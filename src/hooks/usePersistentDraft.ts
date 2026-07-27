import { useCallback, useEffect, useState } from "react";

interface StoredDraft<T> {
  version: number;
  savedAt: string;
  value: T;
}

export function usePersistentDraft<T>(
  storageKey: string,
  version: number,
  initialValue: T
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return initialValue;

      const stored = JSON.parse(raw) as StoredDraft<T>;
      return stored.version === version ? stored.value : initialValue;
    } catch {
      return initialValue;
    }
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const save = useCallback(() => {
    const next: StoredDraft<T> = {
      version,
      savedAt: new Date().toISOString(),
      value
    };

    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedAt(next.savedAt);
  }, [storageKey, value, version]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setValue(initialValue);
    setSavedAt(null);
  }, [initialValue, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const next: StoredDraft<T> = {
        version,
        savedAt: new Date().toISOString(),
        value
      };
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [storageKey, value, version]);

  return { value, setValue, save, reset, savedAt };
}
