import type { Server } from "node:http";
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

function storeUiProofPaths() {
  const directory = path.join(
    app.getPath("temp"),
    STORE_UI_PROOF_DIRECTORY
  );
  return {
    directory,
    probe: path.join(directory, "probe.json"),
    ready: path.join(directory, "ui_ready.json")
  };
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
