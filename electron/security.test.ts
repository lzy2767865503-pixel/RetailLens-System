import { describe, expect, it } from "vitest";
import {
  desktopStartupErrorMessage,
  isDevToolsShortcut,
  isLocalAppNavigation,
  isTrustedExternalUrl
} from "./security";

describe("Electron navigation policy", () => {
  const origin = "http://127.0.0.1:47824";

  it("permits only the stable exact loopback origin", () => {
    expect(isLocalAppNavigation(`${origin}/reports`, origin)).toBe(true);
    expect(isLocalAppNavigation("http://127.0.0.1:8787/", origin)).toBe(false);
    expect(isLocalAppNavigation("http://localhost:47824/", origin)).toBe(false);
    expect(isLocalAppNavigation("https://example.com/", origin)).toBe(false);
  });

  it("opens only the project owner's GitHub URLs externally", () => {
    expect(
      isTrustedExternalUrl(
        "https://github.com/lzy2767865503-pixel/RetailLens-System"
      )
    ).toBe(true);
    expect(isTrustedExternalUrl("https://github.com/openai")).toBe(false);
    expect(
      isTrustedExternalUrl(
        "https://github.com/lzy2767865503-pixel.evil.example/"
      )
    ).toBe(false);
  });
});

describe("Electron desktop startup diagnostics", () => {
  it("explains a fixed-port conflict without exposing unrelated data", () => {
    expect(
      desktopStartupErrorMessage(
        Object.assign(new Error("listen failed"), {
          code: "EADDRINUSE"
        }),
        47_824
      )
    ).toBe(
      "Local port 47824 is already in use. Close the conflicting process, then reopen Retail Decision Studio by LAI ZEYU."
    );
  });
});

describe("Electron production DevTools policy", () => {
  it("recognizes common DevTools shortcuts", () => {
    expect(isDevToolsShortcut({ key: "F12" })).toBe(true);
    expect(
      isDevToolsShortcut({ key: "I", control: true, shift: true })
    ).toBe(true);
    expect(isDevToolsShortcut({ key: "r", control: true })).toBe(false);
  });
});
