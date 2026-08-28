export const RETAILLENS_DRAFT_STORAGE_KEY =
  "retaillens.business-draft";
export const RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY =
  "retaillens.openai-settings";
export const RETAILLENS_LOCALE_STORAGE_KEY = "retaillens.locale";

export const RETAILLENS_BUSINESS_STORAGE_KEYS = Object.freeze([
  RETAILLENS_DRAFT_STORAGE_KEY,
  RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY
]);

export interface RemovableStorage {
  removeItem(key: string): void;
}

/**
 * Removes locally persisted business inputs and the non-secret model preference.
 * Locale remains because it contains no business or credential data.
 */
export function clearRetailLensBusinessData(
  storage: RemovableStorage
): void {
  for (const key of RETAILLENS_BUSINESS_STORAGE_KEYS) {
    storage.removeItem(key);
  }
}
