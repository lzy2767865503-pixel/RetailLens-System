import { describe, expect, it } from "vitest";
import {
  hasExpectedPeMetadata,
  isAuthorOwnedSignerIdentity,
  isAllowedSignerSimpleName,
  windowsReleasePolicy
} from "./windows-release-policy.mjs";

describe("Windows release identity policy", () => {
  it("allows only the two author-owned signer simple names", () => {
    expect(windowsReleasePolicy.allowedSignerSimpleNames).toEqual([
      "LAI ZEYU",
      "来泽宇"
    ]);
    expect(isAllowedSignerSimpleName("LAI ZEYU")).toBe(true);
    expect(isAllowedSignerSimpleName("来泽宇")).toBe(true);
  });

  it.each([
    "SignPath Foundation",
    "Microsoft Corporation",
    "DigiCert, Inc.",
    "LAI ZEYU（来泽宇）",
    "LAI ZEYU ",
    "lai zeyu",
    ""
  ])("rejects third-party or non-exact signer name %j", (name) => {
    expect(isAllowedSignerSimpleName(name)).toBe(false);
  });

  it("rejects third-party organization names even when CN is author-owned", () => {
    expect(
      isAuthorOwnedSignerIdentity({
        simpleName: "LAI ZEYU",
        commonName: "LAI ZEYU",
        organizationNames: []
      })
    ).toBe(true);
    expect(
      isAuthorOwnedSignerIdentity({
        simpleName: "来泽宇",
        commonName: "来泽宇",
        organizationNames: ["来泽宇"]
      })
    ).toBe(true);
    expect(
      isAuthorOwnedSignerIdentity({
        simpleName: "LAI ZEYU",
        commonName: "LAI ZEYU",
        organizationNames: ["SignPath Foundation"]
      })
    ).toBe(false);
    expect(
      isAuthorOwnedSignerIdentity({
        simpleName: "LAI ZEYU",
        commonName: "SignPath Foundation",
        organizationNames: []
      })
    ).toBe(false);
  });

  it("requires exact final PE identity metadata", () => {
    expect(
      hasExpectedPeMetadata({
        companyName: "LAI ZEYU（来泽宇）",
        legalCopyright: "Copyright © 2026 LAI ZEYU（来泽宇）",
        productName: "Retail Decision Studio by LAI ZEYU"
      })
    ).toBe(true);
    expect(
      hasExpectedPeMetadata({
        companyName: "SignPath Foundation",
        legalCopyright: "Copyright © 2026 LAI ZEYU（来泽宇）",
        productName: "Retail Decision Studio by LAI ZEYU"
      })
    ).toBe(false);
  });
});
