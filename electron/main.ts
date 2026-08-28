import type { Server } from "node:http";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  session,
  shell
} from "electron";
import {
  desktopStartupErrorMessage,
  isDevToolsShortcut,
  isLocalAppNavigation,
  isTrustedExternalUrl
} from "./security";
import {
  buildStoreUiReadyEvidence,
  parseStoreUiProbe,
  rendererDomProofFailures,
  type RendererDomProof,
  type StoreUiProbe,
  WINDOWS_AUTHOR_NAME,
  WINDOWS_PRODUCT_NAME
} from "./readiness";

const APP_ID = "com.laizeyu.retaildecisionstudio";
const DESKTOP_PORT = 47_824;
const DESKTOP_ORIGIN = `http://127.0.0.1:${DESKTOP_PORT}`;
const isSmokeTest = process.argv.includes("--smoke-test");
const isEndToEndTest =
  !app.isPackaged && process.env.RETAILLENS_E2E === "1";
const productionMode =
  app.isPackaged || process.env.NODE_ENV === "production";

if (
  isEndToEndTest &&
  process.env.RETAILLENS_E2E_USER_DATA_DIR
) {
  app.setPath(
    "userData",
    path.resolve(process.env.RETAILLENS_E2E_USER_DATA_DIR)
  );
}

process.env.NODE_ENV = "production";
process.env.RETAILLENS_PROJECT_ROOT = app.getAppPath();
app.enableSandbox();

let mainWindow: BrowserWindow | null = null;
let localServer: Server | null = null;
let localOrigin = "";
let smokeTestSettled = false;

const STORE_UI_PROOF_DIRECTORY = "retaillens-store-ui-proof";
const STORE_SCREENSHOT_DIRECTORY = "store-listing-screenshots";
const STORE_SCREENSHOT_WIDTH = 1366;
const STORE_SCREENSHOT_HEIGHT = 768;

function storeUiProofPaths() {
  const directory = path.join(
    app.getPath("temp"),
    STORE_UI_PROOF_DIRECTORY
  );
  return {
    directory,
    probe: path.join(directory, "probe.json"),
    ready: path.join(directory, "ui_ready.json"),
    screenshots: path.join(directory, STORE_SCREENSHOT_DIRECTORY)
  };
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForRendererCondition(
  window: BrowserWindow,
  expression: string,
  label: string
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (window.isDestroyed()) {
      throw new Error(`The renderer closed while waiting for ${label}.`);
    }
    const satisfied = await window.webContents.executeJavaScript(
      `Boolean(${expression})`,
      true
    );
    if (satisfied === true) return;
    await wait(100);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function clickRendererControl(
  window: BrowserWindow,
  script: string,
  label: string
): Promise<void> {
  const clicked = await window.webContents.executeJavaScript(script, true);
  if (clicked !== true) {
    throw new Error(`Packaged screenshot automation could not click ${label}.`);
  }
  await wait(350);
}

async function assertScreenshotPrivacy(window: BrowserWindow): Promise<void> {
  const result = (await window.webContents.executeJavaScript(
    `(() => {
      const bodyText = document.body?.innerText ?? "";
      const patterns = [
        /(?:sk|rk|pk)-[A-Za-z0-9_-]{20,}/,
        /\\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\\b/,
        /\\bgithub_pat_[A-Za-z0-9_]{20,}\\b/,
        /\\bAKIA[0-9A-Z]{16}\\b/,
        /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
        /\\bBearer\\s+[A-Za-z0-9._~+\\/-]{20,}/i,
        /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/i,
        /(?:C:\\\\Users\\\\|\\/Users\\/)[^\\s]+/i
      ];
      const secretInputs = [...document.querySelectorAll("input")].filter((input) => {
        const autocomplete = input.getAttribute("autocomplete") ?? "";
        return Boolean(input.value) && (
          input.type === "password" ||
          autocomplete === "current-password" ||
          autocomplete === "new-password"
        );
      });
      const storageHasSecret = Object.entries(localStorage).some(([key, value]) =>
        /(?:api.?key|password|token|secret)/i.test(key) || patterns.some((pattern) => pattern.test(value))
      );
      return {
        bodyLength: bodyText.trim().length,
        productVisible: bodyText.includes(${JSON.stringify(WINDOWS_PRODUCT_NAME)}),
        authorVisible: bodyText.includes(${JSON.stringify(WINDOWS_AUTHOR_NAME)}),
        sensitivePatternCount: patterns.filter((pattern) => pattern.test(bodyText)).length,
        secretBearingInputCount: secretInputs.length,
        storageHasSecret
      };
    })()`,
    true
  )) as {
    bodyLength: number;
    productVisible: boolean;
    authorVisible: boolean;
    sensitivePatternCount: number;
    secretBearingInputCount: number;
    storageHasSecret: boolean;
  };
  if (
    result.bodyLength < 100 ||
    !result.productVisible ||
    !result.authorVisible ||
    result.sensitivePatternCount !== 0 ||
    result.secretBearingInputCount !== 0 ||
    result.storageHasSecret
  ) {
    throw new Error(
      "Store screenshot privacy gate found missing attribution or potentially sensitive visible/local data."
    );
  }
}

async function captureStoreScreenshots(
  window: BrowserWindow,
  probe: StoreUiProbe
): Promise<void> {
  if (!probe.captureStoreScreenshots) return;
  if (probe.screenshotRound !== 2) {
    throw new Error("Store screenshots may be captured only in lifecycle round 2.");
  }

  const paths = storeUiProofPaths();
  await mkdir(paths.screenshots, { recursive: false });
  window.setContentSize(
    STORE_SCREENSHOT_WIDTH,
    STORE_SCREENSHOT_HEIGHT,
    false
  );
  await waitForRendererCondition(
    window,
    `window.innerWidth === ${STORE_SCREENSHOT_WIDTH} && window.innerHeight === ${STORE_SCREENSHOT_HEIGHT}`,
    "the exact 1366 x 768 packaged viewport"
  );

  const images: Array<{
    fileName: string;
    height: number;
    sha256: string;
    size: number;
    viewId: string;
    width: number;
  }> = [];
  const capture = async (fileName: string, viewId: string) => {
    await window.webContents.executeJavaScript(
      "window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); true",
      true
    );
    await wait(200);
    await assertScreenshotPrivacy(window);
    const image = await window.webContents.capturePage({
      x: 0,
      y: 0,
      width: STORE_SCREENSHOT_WIDTH,
      height: STORE_SCREENSHOT_HEIGHT
    });
    const dimensions = image.getSize();
    if (
      dimensions.width !== STORE_SCREENSHOT_WIDTH ||
      dimensions.height !== STORE_SCREENSHOT_HEIGHT
    ) {
      throw new Error(
        `Packaged screenshot ${fileName} was ${dimensions.width} x ${dimensions.height}, not 1366 x 768.`
      );
    }
    const png = image.toPNG();
    if (png.length < 20_000 || png.length > 15_000_000) {
      throw new Error(`Packaged screenshot ${fileName} has an implausible PNG size.`);
    }
    const temporaryPath = path.join(paths.screenshots, `${fileName}.tmp`);
    const finalPath = path.join(paths.screenshots, fileName);
    await writeFile(temporaryPath, png, { flag: "wx" });
    await rename(temporaryPath, finalPath);
    images.push({
      fileName,
      height: dimensions.height,
      sha256: createHash("sha256").update(png).digest("hex"),
      size: png.length,
      viewId,
      width: dimensions.width
    });
  };

  await clickRendererControl(
    window,
    `(() => {
      const button = [...document.querySelectorAll("button")].find((candidate) =>
        /(?:载入示例|Load demo)/.test(candidate.textContent ?? "")
      );
      if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
      button.click();
      return true;
    })()`,
    "the built-in demo loader"
  );
  await waitForRendererCondition(
    window,
    `document.querySelector(".coverage-value")?.textContent?.trim() !== "0%"`,
    "the built-in demo assessment"
  );
  await capture("01-assessment-demo.png", "assessment-demo");

  await clickRendererControl(
    window,
    `(() => {
      const steps = [...document.querySelectorAll(".step-button")];
      const button = steps[8];
      if (!(button instanceof HTMLButtonElement) || steps.length !== 9) return false;
      button.click();
      return true;
    })()`,
    "enterprise input step 9"
  );
  await waitForRendererCondition(
    window,
    `document.querySelector(".step-button:nth-of-type(9)") !== null || document.body.innerText.includes("第 9 步") || document.body.innerText.includes("Step 9 of 9")`,
    "enterprise input workbench"
  );
  await capture("02-enterprise-inputs.png", "enterprise-inputs");

  await clickRendererControl(
    window,
    `(() => {
      const button = document.querySelector(".bottom-action-bar .button.primary");
      if (!(button instanceof HTMLButtonElement) || button.disabled) return false;
      button.click();
      return true;
    })()`,
    "the deterministic assessment action"
  );
  await waitForRendererCondition(
    window,
    `document.querySelector(".report-shell") !== null && document.body.innerText.includes("74.3 / 100")`,
    "the exact built-in-demo report"
  );
  await capture("03-executive-workpaper.png", "executive-workpaper");

  await clickRendererControl(
    window,
    `(() => {
      const button = [...document.querySelectorAll(".report-nav-button")].find((candidate) =>
        /(?:战略矩阵|Strategy matrices)/.test(candidate.textContent ?? "")
      );
      if (!(button instanceof HTMLButtonElement)) return false;
      button.click();
      return true;
    })()`,
    "the strategy matrices report tab"
  );
  await waitForRendererCondition(
    window,
    `document.querySelector('[data-testid="strategy-matrices"]') !== null`,
    "the strategy matrices view"
  );
  await capture("04-strategy-matrices.png", "strategy-matrices");

  const manifest = {
    schemaVersion: 1,
    evidenceKind: "exact-packaged-store-candidate-screenshots",
    candidateSha256: probe.candidateSha256,
    version: probe.version,
    nonce: probe.nonce,
    screenshotRound: probe.screenshotRound,
    captureSource: "ELECTRON_WEB_CONTENTS_CAPTURE_PAGE",
    dataset: "BUILT_IN_DEMO_ONLY",
    privacyGatePassed: true,
    sensitiveTextPatternCount: 0,
    secretBearingInputCount: 0,
    width: STORE_SCREENSHOT_WIDTH,
    height: STORE_SCREENSHOT_HEIGHT,
    screenshotCount: images.length,
    images,
    generatedAt: new Date().toISOString()
  };
  const manifestTemporaryPath = path.join(
    paths.screenshots,
    "store-screenshot-capture.v1.json.tmp"
  );
  const manifestPath = path.join(
    paths.screenshots,
    "store-screenshot-capture.v1.json"
  );
  await writeFile(
    manifestTemporaryPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" }
  );
  await rename(manifestTemporaryPath, manifestPath);
}

function finishSmokeTest(exitCode: number, message: string): void {
  if (!isSmokeTest || smokeTestSettled) return;
  smokeTestSettled = true;
  const writer = exitCode === 0 ? console.log : console.error;
  writer(message);
  localServer?.close();
  app.exit(exitCode);
}

function denyAllPermissions(): void {
  const currentSession = session.defaultSession;
  currentSession.setPermissionCheckHandler(() => false);
  currentSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => callback(false)
  );
}

async function readStoreUiProbe(): Promise<StoreUiProbe | null> {
  if (!app.isPackaged || process.platform !== "win32") return null;

  const paths = storeUiProofPaths();
  let raw: string;
  try {
    raw = await readFile(paths.probe, "utf8");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }

  await rm(paths.probe, { force: true });
  try {
    return parseStoreUiProbe(JSON.parse(raw), app.getVersion());
  } catch (error) {
    console.error(
      `Ignored invalid Store UI probe: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    );
    return null;
  }
}

async function waitForRendererDom(
  window: BrowserWindow
): Promise<RendererDomProof> {
  let lastFailures = ["renderer readiness was not evaluated"];

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (window.isDestroyed()) {
      throw new Error("The renderer window closed before readiness checks.");
    }

    const proof = await window.webContents.executeJavaScript(
      `(() => {
        const root = document.getElementById("root");
        const bodyText = document.body?.innerText ?? "";
        const privacyEntry = document.querySelector('[data-testid="open-about-privacy"]');
        const privacyStyle = privacyEntry ? window.getComputedStyle(privacyEntry) : null;
        const privacyRect = privacyEntry?.getBoundingClientRect();
        return {
          rootContentLength: root?.textContent?.trim().length ?? 0,
          titleMatches: document.title === ${JSON.stringify(WINDOWS_PRODUCT_NAME)},
          productNameVisible: bodyText.includes(${JSON.stringify(WINDOWS_PRODUCT_NAME)}),
          authorVisible: bodyText.includes(${JSON.stringify(WINDOWS_AUTHOR_NAME)}),
          privacyEntryVisible: Boolean(
            privacyEntry &&
            privacyStyle?.display !== "none" &&
            privacyStyle?.visibility !== "hidden" &&
            privacyRect &&
            privacyRect.width > 0 &&
            privacyRect.height > 0
          )
        };
      })()`,
      true
    ) as RendererDomProof;
    lastFailures = rendererDomProofFailures(proof);
    if (lastFailures.length === 0) return proof;

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(
    `Packaged renderer DOM readiness failed: ${lastFailures.join("; ")}`
  );
}

async function writeStoreUiReadyEvidence(
  probe: StoreUiProbe,
  dom: RendererDomProof
): Promise<void> {
  const paths = storeUiProofPaths();
  const temporaryPath = `${paths.ready}.${process.pid}.tmp`;
  const evidence = buildStoreUiReadyEvidence(probe, dom, process.pid);

  await mkdir(paths.directory, { recursive: true });
  await rm(paths.ready, { force: true });
  await writeFile(
    temporaryPath,
    `${JSON.stringify(evidence, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" }
  );
  await rename(temporaryPath, paths.ready);
}

async function handleRendererLoaded(window: BrowserWindow): Promise<void> {
  let storeProbe: StoreUiProbe | null = null;

  try {
    storeProbe = await readStoreUiProbe();
    const dom = await waitForRendererDom(window);
    if (storeProbe) {
      await captureStoreScreenshots(window, storeProbe);
      await writeStoreUiReadyEvidence(storeProbe, dom);
    }

    if (isSmokeTest) {
      const response = await fetch(`${localOrigin}/api/health`);
      const body = (await response.json()) as {
        status?: string;
        processId?: number;
      };
      if (
        !response.ok ||
        body.status !== "ok" ||
        body.processId !== process.pid
      ) {
        throw new Error(`Health response was HTTP ${response.status}.`);
      }
      finishSmokeTest(
        0,
        "Retail Decision Studio by LAI ZEYU packaged DOM and health smoke test passed."
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown renderer error";
    if (isSmokeTest) {
      finishSmokeTest(
        1,
        `Retail Decision Studio by LAI ZEYU desktop smoke test failed: ${message}`
      );
      return;
    }

    console.error(
      `Retail Decision Studio by LAI ZEYU renderer readiness failed: ${message}`
    );
    if (storeProbe) {
      app.exit(1);
      return;
    }
    dialog.showErrorBox(
      "Retail Decision Studio by LAI ZEYU could not start",
      message
    );
    app.quit();
  }
}

function applyContentSecurity(window: BrowserWindow): void {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrustedExternalUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (!isLocalAppNavigation(url, localOrigin)) {
      event.preventDefault();
    }
  });

  window.webContents.on("will-redirect", (event, url) => {
    if (!isLocalAppNavigation(url, localOrigin)) {
      event.preventDefault();
    }
  });

  window.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });

  if (productionMode && !isEndToEndTest) {
    window.webContents.on("before-input-event", (event, input) => {
      if (isDevToolsShortcut(input)) {
        event.preventDefault();
      }
    });
    window.webContents.on("devtools-opened", () => {
      window.webContents.closeDevTools();
    });
  }
}

async function createMainWindow(): Promise<void> {
  const { startServer } = await import("../server/index");
  try {
    localServer = await startServer({
      port: DESKTOP_PORT,
      expectedOrigin: DESKTOP_ORIGIN,
      log: false
    });
  } catch (error) {
    throw new Error(
      desktopStartupErrorMessage(error, DESKTOP_PORT),
      { cause: error }
    );
  }
  const address = localServer.address();

  if (!address || typeof address === "string") {
    throw new Error("The loopback server did not expose a TCP port.");
  }

  if (address.port !== DESKTOP_PORT) {
    throw new Error(
      `The loopback server opened unexpected port ${address.port}.`
    );
  }

  localOrigin = DESKTOP_ORIGIN;
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: "Retail Decision Studio by LAI ZEYU",
    backgroundColor: "#f5f7fa",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: !productionMode || isEndToEndTest
    }
  });

  applyContentSecurity(mainWindow);

  mainWindow.once("ready-to-show", () => {
    if (!isSmokeTest) mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.once("did-finish-load", () => {
    if (!mainWindow) return;
    void handleRendererLoaded(mainWindow);
  });

  await mainWindow.loadURL(localOrigin);
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  if (isSmokeTest) {
    finishSmokeTest(
      1,
      "Retail Decision Studio by LAI ZEYU desktop smoke test could not acquire the single-instance lock."
    );
  } else {
    app.quit();
  }
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady()
    .then(async () => {
      app.setAppUserModelId(APP_ID);
      Menu.setApplicationMenu(null);
      denyAllPermissions();
      await createMainWindow();
    })
    .catch((error: unknown) => {
      finishSmokeTest(
        1,
        `Retail Decision Studio by LAI ZEYU desktop startup failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
      if (!isSmokeTest) {
        const message =
          error instanceof Error ? error.message : "unknown error";
        console.error(
          `Retail Decision Studio by LAI ZEYU desktop startup failed: ${message}`
        );
        dialog.showErrorBox(
          "Retail Decision Studio by LAI ZEYU could not start",
          message
        );
        app.quit();
      }
    });
}

app.on("window-all-closed", () => {
  app.quit();
});

app.on("will-quit", () => {
  localServer?.close();
  localServer = null;
});
