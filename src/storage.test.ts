import { describe, expect, it } from "vitest";
import {
  clearRetailLensBusinessData,
  RETAILLENS_DRAFT_STORAGE_KEY,
  RETAILLENS_LOCALE_STORAGE_KEY,
  RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY
} from "./storage";

describe("clearRetailLensBusinessData", () => {
  it("removes business data and model preference but keeps locale", () => {
    const values = new Map([
      [RETAILLENS_DRAFT_STORAGE_KEY, "sensitive draft"],
      [RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY, "model preference"],
      [RETAILLENS_LOCALE_STORAGE_KEY, "en"]
    ]);

    clearRetailLensBusinessData({
      removeItem: (key) => values.delete(key)
    });

    expect(values.has(RETAILLENS_DRAFT_STORAGE_KEY)).toBe(false);
    expect(values.has(RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY)).toBe(false);
    expect(values.get(RETAILLENS_LOCALE_STORAGE_KEY)).toBe("en");
  });
});
