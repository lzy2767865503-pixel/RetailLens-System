import { useCallback, useState } from "react";
import { RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY } from "../storage";

// Keep the selectable list limited to model IDs published in the official
// OpenAI API model catalogue. Store certification still performs a live
// /v1/models lookup and a structured Responses API round trip for the exact
// repository-variable-selected model before a candidate may pass.
export const DEFAULT_OPENAI_MODEL = "gpt-5" as const;

export const OPENAI_MODEL_OPTIONS = [
  {
    value: DEFAULT_OPENAI_MODEL,
    label: {
      zh: "GPT-5（推荐）",
      en: "GPT-5 (recommended)"
    }
  },
  {
    value: "gpt-5-mini",
    label: {
      zh: "GPT-5 mini（性能与成本均衡）",
      en: "GPT-5 mini (balanced)"
    }
  },
  {
    value: "gpt-5-nano",
    label: {
      zh: "GPT-5 nano（高效低成本）",
      en: "GPT-5 nano (efficient)"
    }
  }
] as const;

export type OpenAIModel =
  (typeof OPENAI_MODEL_OPTIONS)[number]["value"];

export interface ApiSettings {
  apiKey: string;
  model: OpenAIModel;
}

export interface UseApiSettingsResult {
  settings: ApiSettings;
  hasKey: boolean;
  configurationState: "configured" | "unconfigured";
  saveSettings: (next: ApiSettings) => void;
  clearSettings: () => void;
}

interface StoredApiSettingsV1 {
  version: 1;
  model: OpenAIModel;
}

const STORAGE_KEY = RETAILLENS_OPENAI_SETTINGS_STORAGE_KEY;
const STORAGE_VERSION = 1;
const OPENAI_MODEL_VALUES = new Set<string>(
  OPENAI_MODEL_OPTIONS.map(({ value }) => value)
);

export const EMPTY_API_SETTINGS: ApiSettings = Object.freeze({
  apiKey: "",
  model: DEFAULT_OPENAI_MODEL
});

function isOpenAIModel(value: unknown): value is OpenAIModel {
  return (
    typeof value === "string" &&
    OPENAI_MODEL_VALUES.has(value)
  );
}

function normalizeSettings(value: ApiSettings): ApiSettings {
  return {
    apiKey: value.apiKey.trim(),
    model: isOpenAIModel(value.model)
      ? value.model
      : DEFAULT_OPENAI_MODEL
  };
}

function readModelPreference(): OpenAIModel {
  if (typeof window === "undefined") return DEFAULT_OPENAI_MODEL;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OPENAI_MODEL;

    const parsed = JSON.parse(raw) as Partial<StoredApiSettingsV1>;
    if (
      parsed.version !== STORAGE_VERSION ||
      !isOpenAIModel(parsed.model)
    ) {
      return DEFAULT_OPENAI_MODEL;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        model: parsed.model
      } satisfies StoredApiSettingsV1)
    );
    return parsed.model;
  } catch {
    return DEFAULT_OPENAI_MODEL;
  }
}

export function useApiSettings(): UseApiSettingsResult {
  const [settings, setSettings] = useState<ApiSettings>(() => ({
    apiKey: "",
    model: readModelPreference()
  }));

  const saveSettings = useCallback((next: ApiSettings) => {
    const normalized = normalizeSettings(next);
    const stored: StoredApiSettingsV1 = {
      version: STORAGE_VERSION,
      model: normalized.model
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stored)
      );
    } catch {
      // Model persistence is optional; the credential still stays in memory.
    }
    setSettings(normalized);
  }, []);

  const clearSettings = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Clearing in-memory state is the security-critical operation.
    }
    setSettings(EMPTY_API_SETTINGS);
  }, []);

  return {
    settings,
    hasKey: settings.apiKey.length > 0,
    configurationState:
      settings.apiKey.length > 0
        ? "configured"
        : "unconfigured",
    saveSettings,
    clearSettings
  };
}
