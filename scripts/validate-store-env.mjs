const expected = new Map([
  [
    "RETAILLENS_STORE_IDENTITY_NAME",
    "LAIZEYU.RetailDecisionStudiobyLAIZEYU"
  ],
  [
    "RETAILLENS_STORE_PUBLISHER",
    "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8"
  ]
]);

const mismatches = [...expected].filter(
  ([name, value]) => process.env[name]?.trim() !== value
);

if (mismatches.length > 0) {
  console.error(`Microsoft Store production identity mismatch: ${mismatches.map(([name]) => name).join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("Microsoft Store production Identity.Name and Publisher are exact.");
}
