import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Eye, EyeOff, KeyRound, PlugZap, X } from "lucide-react";
import type { Locale } from "../i18n";
import {
  DEFAULT_OPENAI_MODEL,
  EMPTY_API_SETTINGS,
  OPENAI_MODEL_OPTIONS,
  type ApiSettings
} from "../hooks/useApiSettings";

export type ApiConnectionResultCode =
  | "connected"
  | "invalid_key"
  | "unauthorized"
  | "model_unavailable"
  | "server_unavailable"
  | "rate_limited"
  | "unknown";

export interface ApiConnectionTestResult {
  ok: boolean;
  code: ApiConnectionResultCode;
}

export interface ApiSettingsDialogProps {
  open: boolean;
  locale: Locale;
  value: ApiSettings;
  onClose: () => void;
  onSave: (settings: ApiSettings) => void | Promise<void>;
  onClear: () => void | Promise<void>;
  onTestConnection: (
    settings: ApiSettings,
    signal: AbortSignal
  ) => Promise<ApiConnectionTestResult>;
  disabled?: boolean;
}

type DialogStatus =
  | "idle"
  | "saving"
  | "saved"
  | "testing"
  | "connected"
  | "clearing"
  | "cleared"
  | "error";

type SafeErrorCode =
  | "missing_key"
  | "invalid_key"
  | "unauthorized"
  | "model_unavailable"
  | "server_unavailable"
  | "rate_limited"
  | "save_failed"
  | "clear_failed"
  | "unknown";

interface Copy {
  zh: string;
  en: string;
}

const copy = {
  title: {
    zh: "OpenAI API 设置",
    en: "OpenAI API settings"
  },
  subtitle: {
    zh: "为 RetailLens 的 AI 深度解读配置一个 OpenAI 密钥。",
    en: "Configure an OpenAI key for RetailLens AI interpretation."
  },
  provider: {
    zh: "服务提供商",
    en: "Provider"
  },
  providerSecondary: {
    zh: "Provider",
    en: "服务提供商"
  },
  apiKey: {
    zh: "OpenAI API 密钥",
    en: "OpenAI API key"
  },
  apiKeySecondary: {
    zh: "OpenAI API key",
    en: "OpenAI API 密钥"
  },
  apiKeyPlaceholder: {
    zh: "以 sk- 开头",
    en: "Starts with sk-"
  },
  showKey: {
    zh: "显示密钥",
    en: "Show key"
  },
  hideKey: {
    zh: "隐藏密钥",
    en: "Hide key"
  },
  model: {
    zh: "分析模型",
    en: "Analysis model"
  },
  modelSecondary: {
    zh: "Analysis model",
    en: "分析模型"
  },
  save: {
    zh: "在当前页面启用",
    en: "Use for this open page"
  },
  test: {
    zh: "测试连接",
    en: "Test connection"
  },
  clear: {
    zh: "清除密钥",
    en: "Clear key"
  },
  close: {
    zh: "关闭",
    en: "Close"
  },
  security: {
    zh: "密钥只保留在当前打开页面的内存中，刷新或关闭页面后即清除；它不会写入 localStorage、sessionStorage、数据库或项目文件。只有在你测试连接或请求 AI 分析时，密钥才会发送到本机 RetailLens 服务器。仅在可信的私人或本地部署中使用，绝不要让密钥出现在日志中。浏览器只会保存不含密钥的模型偏好。",
    en: "The key is kept only in memory for this open page and is cleared on refresh or close; it is never written to localStorage, sessionStorage, a database, or project files. It is sent to the local RetailLens server only when you test the connection or request AI analysis. Use this only on a trusted private or local deployment, and never include the key in logs. The browser stores only the non-secret model preference."
  },
  keyHelp: {
    zh: "启用设置不会测试或发送密钥；密钥只在本页内存中保留，并始终遮挡，除非你主动显示。",
    en: "Applying settings does not test or send the key; it stays only in this page's memory and remains masked unless you reveal it."
  }
} satisfies Record<string, Copy>;

const statusCopy: Record<DialogStatus, Copy> = {
  idle: {
    zh: "尚未执行操作",
    en: "No action yet"
  },
  saving: {
    zh: "正在为当前页面启用…",
    en: "Applying to this open page…"
  },
  saved: {
    zh: "密钥已在当前页面内存中启用",
    en: "The key is active in this page's memory"
  },
  testing: {
    zh: "正在通过本机服务器测试连接…",
    en: "Testing through the local server…"
  },
  connected: {
    zh: "OpenAI 连接测试成功",
    en: "OpenAI connection test succeeded"
  },
  clearing: {
    zh: "正在清除页面内存中的密钥…",
    en: "Clearing the key from page memory…"
  },
  cleared: {
    zh: "页面内存中的密钥已清除",
    en: "The in-memory key was cleared"
  },
  error: {
    zh: "操作未完成",
    en: "The action did not complete"
  }
};

const errorCopy: Record<SafeErrorCode, Copy> = {
  missing_key: {
    zh: "请先输入 OpenAI API 密钥。",
    en: "Enter an OpenAI API key first."
  },
  invalid_key: {
    zh: "密钥格式无效。OpenAI API 密钥应以 sk- 开头。",
    en: "The key format is invalid. OpenAI API keys start with sk-."
  },
  unauthorized: {
    zh: "OpenAI 未接受此密钥。请检查密钥是否有效及项目权限。",
    en: "OpenAI did not accept this key. Check that it is active and has project access."
  },
  model_unavailable: {
    zh: "当前密钥无法使用所选模型。请选择可用模型后重试。",
    en: "The selected model is unavailable to this key. Choose an available model and try again."
  },
  server_unavailable: {
    zh: "无法连接本机 RetailLens 服务器。请确认程序正在运行。",
    en: "The local RetailLens server could not be reached. Confirm that the app is running."
  },
  rate_limited: {
    zh: "请求频率或账户额度受到限制，请稍后再试。",
    en: "The request was rate-limited or quota-limited. Try again later."
  },
  save_failed: {
    zh: "浏览器未能应用设置。请检查当前页面权限。",
    en: "The browser could not apply the settings. Check this page's permissions."
  },
  clear_failed: {
    zh: "浏览器未能清除设置。请检查当前页面权限。",
    en: "The browser could not clear the settings. Check this page's permissions."
  },
  unknown: {
    zh: "连接测试失败。为保护密钥，系统不会显示服务端异常原文。",
    en: "The connection test failed. Raw server errors are hidden to protect the key."
  }
};

function t(value: Copy, locale: Locale) {
  return value[locale];
}

function otherLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

function resultCodeToError(
  code: ApiConnectionResultCode
): SafeErrorCode {
  switch (code) {
    case "invalid_key":
    case "unauthorized":
    case "model_unavailable":
    case "server_unavailable":
    case "rate_limited":
      return code;
    default:
      return "unknown";
  }
}

function validateSettings(
  settings: ApiSettings
): SafeErrorCode | null {
  const key = settings.apiKey.trim();
  if (!key) return "missing_key";
  if (!/^sk-[A-Za-z0-9_-]{20,240}$/.test(key)) {
    return "invalid_key";
  }
  return null;
}

export function ApiSettingsDialog({
  open,
  locale,
  value,
  onClose,
  onSave,
  onClear,
  onTestConnection,
  disabled = false
}: ApiSettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const testControllerRef = useRef<AbortController | null>(null);
  const wasOpenRef = useRef(false);
  const [draft, setDraft] = useState<ApiSettings>(value);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<DialogStatus>("idle");
  const [errorCode, setErrorCode] =
    useState<SafeErrorCode | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const keyHelpId = useId();
  const keyErrorId = useId();
  const secondary = otherLocale(locale);
  const busy =
    disabled ||
    status === "saving" ||
    status === "testing" ||
    status === "clearing";
  const invalidKey =
    errorCode === "missing_key" || errorCode === "invalid_key";

  const requestClose = useCallback(() => {
    testControllerRef.current?.abort();
    testControllerRef.current = null;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(value);
      setShowKey(false);
      setStatus("idle");
      setErrorCode(null);
    }
    wasOpenRef.current = open;
  }, [open, value]);

  useEffect(
    () => () => {
      testControllerRef.current?.abort();
    },
    []
  );

  const handleBackdropClick = (
    event: ReactMouseEvent<HTMLDialogElement>
  ) => {
    if (event.target === event.currentTarget) {
      requestClose();
    }
  };

  const handleSave = async () => {
    const validationError = validateSettings(draft);
    if (validationError) {
      setStatus("error");
      setErrorCode(validationError);
      return;
    }

    const next = {
      apiKey: draft.apiKey.trim(),
      model: draft.model
    };

    setStatus("saving");
    setErrorCode(null);
    try {
      await onSave(next);
      setDraft(next);
      setStatus("saved");
    } catch {
      setStatus("error");
      setErrorCode("save_failed");
    }
  };

  const handleTest = async () => {
    const validationError = validateSettings(draft);
    if (validationError) {
      setStatus("error");
      setErrorCode(validationError);
      return;
    }

    testControllerRef.current?.abort();
    const controller = new AbortController();
    testControllerRef.current = controller;
    setStatus("testing");
    setErrorCode(null);

    try {
      const result = await onTestConnection(
        {
          apiKey: draft.apiKey.trim(),
          model: draft.model
        },
        controller.signal
      );
      if (controller.signal.aborted) return;

      if (result.ok && result.code === "connected") {
        setStatus("connected");
        return;
      }

      setStatus("error");
      setErrorCode(resultCodeToError(result.code));
    } catch {
      if (controller.signal.aborted) return;
      setStatus("error");
      setErrorCode("server_unavailable");
    } finally {
      if (testControllerRef.current === controller) {
        testControllerRef.current = null;
      }
    }
  };

  const handleClear = async () => {
    testControllerRef.current?.abort();
    testControllerRef.current = null;
    setStatus("clearing");
    setErrorCode(null);

    try {
      await onClear();
      setDraft(EMPTY_API_SETTINGS);
      setShowKey(false);
      setStatus("cleared");
    } catch {
      setStatus("error");
      setErrorCode("clear_failed");
    }
  };

  const statusClassName =
    status === "saved" ||
    status === "connected" ||
    status === "cleared"
      ? "ai-status is-ready"
      : status === "error"
        ? "ai-status is-error"
        : "ai-status";

  return (
    <dialog
      ref={dialogRef}
      className="ai-panel api-settings-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={handleBackdropClick}
    >
      <div className="ai-panel-header">
        <div className="gate-card-heading">
          <KeyRound size={19} strokeWidth={1.8} aria-hidden="true" />
          <div>
            <h2 id={titleId}>{t(copy.title, locale)}</h2>
            <span className="provider-chip">OpenAI only</span>
          </div>
          <button
            className="button ghost"
            type="button"
            onClick={requestClose}
            aria-label={t(copy.close, locale)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="section-copy" id={descriptionId}>
          {t(copy.subtitle, locale)}
          {" / "}
          {t(copy.subtitle, secondary)}
        </p>
        <div className={statusClassName} role="status" aria-live="polite">
          <span className="ai-status-dot" aria-hidden="true" />
          <span>{t(statusCopy[status], locale)}</span>
        </div>
      </div>

      <form
        className="ai-panel-body"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
        noValidate
      >
        <div className="notice">
          <span aria-hidden="true">ⓘ</span>
          <span>{t(copy.security, locale)}</span>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label" htmlFor="api-provider">
              <span>{t(copy.provider, locale)}</span>
              <small>{t(copy.providerSecondary, locale)}</small>
            </label>
            <input
              id="api-provider"
              value="OpenAI"
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="api-model">
              <span>{t(copy.model, locale)}</span>
              <small>{t(copy.modelSecondary, locale)}</small>
            </label>
            <select
              id="api-model"
              value={draft.model}
              onChange={(event) => {
                const model =
                  OPENAI_MODEL_OPTIONS.find(
                    ({ value: optionValue }) =>
                      optionValue === event.target.value
                  )?.value ?? DEFAULT_OPENAI_MODEL;
                setDraft((current) => ({ ...current, model }));
                setStatus("idle");
                setErrorCode(null);
              }}
              disabled={busy}
            >
              {OPENAI_MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label[locale]} / {model.label[secondary]}
                </option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label className="field-label" htmlFor="openai-api-key">
              <span>
                {t(copy.apiKey, locale)}{" "}
                <span className="required" aria-hidden="true">
                  *
                </span>
              </span>
              <small>{t(copy.apiKeySecondary, locale)}</small>
            </label>
            <div className="field-units">
              <input
                id="openai-api-key"
                type={showKey ? "text" : "password"}
                value={draft.apiKey}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    apiKey: event.target.value
                  }));
                  setStatus("idle");
                  setErrorCode(null);
                }}
                placeholder={t(copy.apiKeyPlaceholder, locale)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={busy}
                aria-invalid={invalidKey}
                aria-describedby={`${keyHelpId}${invalidKey ? ` ${keyErrorId}` : ""}`}
              />
              <button
                className="button"
                type="button"
                onClick={() => setShowKey((current) => !current)}
                aria-pressed={showKey}
                aria-label={
                  showKey
                    ? t(copy.hideKey, locale)
                    : t(copy.showKey, locale)
                }
                disabled={busy || draft.apiKey.length === 0}
              >
                {showKey ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
                <span>
                  {showKey
                    ? t(copy.hideKey, locale)
                    : t(copy.showKey, locale)}
                </span>
              </button>
            </div>
            <p className="field-help" id={keyHelpId}>
              {t(copy.keyHelp, locale)}
            </p>
            {invalidKey && errorCode ? (
              <p className="field-error" id={keyErrorId} role="alert">
                {t(errorCopy[errorCode], locale)}
              </p>
            ) : null}
          </div>
        </div>

        {status === "error" &&
        errorCode &&
        !invalidKey ? (
          <div className="notice error" role="alert">
            <span aria-hidden="true">!</span>
            <span>{t(errorCopy[errorCode], locale)}</span>
          </div>
        ) : null}
      </form>

      <div className="ai-panel-actions">
        <button
          className="button"
          type="button"
          onClick={() => void handleTest()}
          disabled={busy || draft.apiKey.trim().length === 0}
        >
          <PlugZap size={17} aria-hidden="true" />
          {status === "testing"
            ? t(statusCopy.testing, locale)
            : t(copy.test, locale)}
        </button>
        <button
          className="button primary"
          type="button"
          onClick={() => void handleSave()}
          disabled={busy || draft.apiKey.trim().length === 0}
        >
          {status === "saving"
            ? t(statusCopy.saving, locale)
            : t(copy.save, locale)}
        </button>
        <div className="button-group">
          <button
            className="button danger"
            type="button"
            onClick={() => void handleClear()}
            disabled={
              busy &&
              status !== "testing"
            }
          >
            {t(copy.clear, locale)}
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={requestClose}
          >
            {t(copy.close, locale)}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ApiSettingsDialog;
