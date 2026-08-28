const path = require("node:path");

const productionStoreIdentity = "LAIZEYU.RetailDecisionStudiobyLAIZEYU";
const productionStorePublisher = "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8";
const configuredStoreIdentity = process.env.RETAILLENS_STORE_IDENTITY_NAME?.trim();
const configuredStorePublisher = process.env.RETAILLENS_STORE_PUBLISHER?.trim();
if (configuredStoreIdentity && configuredStoreIdentity !== productionStoreIdentity) {
  throw new Error("RETAILLENS_STORE_IDENTITY_NAME differs from the reserved production identity");
}
if (configuredStorePublisher && configuredStorePublisher !== productionStorePublisher) {
  throw new Error("RETAILLENS_STORE_PUBLISHER differs from the production Partner Center Publisher");
}
const rfc3161TimestampServer =
  process.env.RETAILLENS_WINDOWS_TIMESTAMP_URL?.trim();

module.exports = {
  appId: "com.laizeyu.retaildecisionstudio",
  productName: "Retail Decision Studio by LAI ZEYU",
  copyright: "Copyright © 2026 LAI ZEYU（来泽宇）",
  directories: {
    output: "release/windows",
    buildResources: "build"
  },
  files: [
    "dist/**/*",
    "dist-electron/**/*",
    "package.json",
    "LICENSE",
    "THIRD_PARTY_NOTICES.txt",
    "!node_modules/**/*"
  ],
  asar: true,
  compression: "normal",
  npmRebuild: false,
  electronLanguages: ["en-US", "zh-CN"],
  afterPack: path.join(__dirname, "scripts", "after-pack.cjs"),
  publish: null,
  win: {
    icon: "build/icon.png",
    requestedExecutionLevel: "asInvoker",
    verifyUpdateCodeSignature: true,
    signExts: [".exe", ".dll", ".node"],
    signtoolOptions: {
      signingHashAlgorithms: ["sha256"],
      ...(rfc3161TimestampServer
        ? { rfc3161TimeStampServer: rfc3161TimestampServer }
        : {})
    }
  },
  appx: {
    identityName: productionStoreIdentity,
    publisher: productionStorePublisher,
    publisherDisplayName: "LAI ZEYU",
    applicationId: "RetailDecisionStudio",
    displayName: "Retail Decision Studio by LAI ZEYU",
    languages: ["en-US", "zh-CN"],
    capabilities: ["runFullTrust", "internetClient"],
    minVersion: "10.0.17763.0",
    maxVersionTested: "10.0.26100.0",
    backgroundColor: "#102a4b",
    showNameOnTiles: true,
    addAutoLaunchExtension: false,
    setBuildNumber: false,
    artifactName: "RetailDecisionStudioByLAIZEYU-${version}-${arch}.${ext}"
  }
};
