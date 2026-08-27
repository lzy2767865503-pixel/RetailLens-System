const path = require("node:path");
const {
  flipFuses,
  getCurrentFuseWire,
  FuseState,
  FuseVersion,
  FuseV1Options
} = require("@electron/fuses");

const expectedFuseStates = new Map([
  [FuseV1Options.RunAsNode, false],
  [FuseV1Options.EnableCookieEncryption, true],
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable, false],
  [FuseV1Options.EnableNodeCliInspectArguments, false],
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation, true],
  [FuseV1Options.OnlyLoadAppFromAsar, true],
  [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot, false],
  [FuseV1Options.GrantFileProtocolExtraPrivileges, false],
  [FuseV1Options.WasmTrapHandlers, true]
]);

module.exports = async function hardenElectronRuntime(context) {
  if (context.electronPlatformName !== "win32") return;

  const expectedCompanyName = "LAI ZEYU（来泽宇）";
  const expectedCopyright = "Copyright © 2026 LAI ZEYU（来泽宇）";
  if (
    context.packager.appInfo.companyName !== expectedCompanyName ||
    context.packager.appInfo.copyright !== expectedCopyright
  ) {
    throw new Error(
      "Windows PE CompanyName/LegalCopyright source metadata is not the exact bilingual LAI ZEYU（来泽宇） identity"
    );
  }

  const executablePath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`
  );

  await flipFuses(executablePath, {
    version: FuseVersion.V1,
    strictlyRequireAllFuses: true,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
    // electron-builder's Windows payload provides v8_context_snapshot.bin,
    // not browser_v8_context_snapshot.bin. Enabling this fuse would make the
    // packaged process terminate before main with a fatal snapshot error.
    [FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
    [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
    [FuseV1Options.WasmTrapHandlers]: true
  });

  const currentFuses = await getCurrentFuseWire(executablePath);
  const verifiedStates = [];
  for (const [option, expectedEnabled] of expectedFuseStates) {
    const expectedState = expectedEnabled
      ? FuseState.ENABLE
      : FuseState.DISABLE;
    const actualState = currentFuses[option];
    if (actualState !== expectedState) {
      throw new Error(
        `Electron fuse verification failed for ${FuseV1Options[option]}: expected ${FuseState[expectedState]}, received ${FuseState[actualState] ?? actualState}`
      );
    }
    verifiedStates.push(
      `${FuseV1Options[option]}=${FuseState[actualState]}`
    );
  }

  console.log(
    `Verified Retail Decision Studio by LAI ZEYU Windows fuses: ${verifiedStates.join(", ")}`
  );
};
