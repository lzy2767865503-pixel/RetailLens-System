import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  WifiOff
} from "lucide-react";
import {
  analyzeBusiness,
  RetailLensApiError,
  scoreBusiness as requestBusinessScore,
  testAiConnection,
  type AiAnalysis
} from "./api";
import {
  businessToDraft,
  businessToStrategyData,
  draftToBusiness,
  EMPTY_FRAMEWORKS,
  scoreToReport
} from "./adapters";
import {
  AppHeader,
  type AppSection
} from "./components/AppHeader";
import { ApiSettingsDialog } from "./components/ApiSettingsDialog";
import { ExecutiveConsultingView } from "./components/ExecutiveConsultingView";
import { EnterpriseTheoryView } from "./components/EnterpriseTheoryView";
import {
  createEmptyDraft,
  IntakeWizard,
  type RetailIntakeDraft
} from "./components/IntakeWizard";
import { MethodologyView } from "./components/MethodologyView";
import { ReportView } from "./components/ReportView";
import { StrategyMatrices } from "./components/StrategyMatrices";
import {
  BusinessInputSchema,
  buildConsultingAssessment,
  buildEnterpriseTheoryAssessment,
  createDemoBusiness,
  scoreBusiness,
  type BusinessInput,
  type BusinessScore
} from "./domain";
import { useApiHealth } from "./hooks/useApiHealth";
import {
  useApiSettings,
  type ApiSettings
} from "./hooks/useApiSettings";
import { usePersistentDraft } from "./hooks/usePersistentDraft";
import type { Locale } from "./i18n";

const DRAFT_KEY = "retaillens.business-draft";
const DRAFT_VERSION = 2;

function localAiUnavailable(model = "gpt-5.6-sol"): AiAnalysis {
  return {
    status: "unavailable",
    model,
    reason: "missing_api_key"
  };
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    window.localStorage.getItem("retaillens.locale") === "en"
      ? "en"
      : "zh"
  );
  const [activeSection, setActiveSection] =
    useState<AppSection>("assessment");
  const {
    value: draft,
    setValue: setDraft,
    save,
    savedAt
  } = usePersistentDraft<RetailIntakeDraft>(
    DRAFT_KEY,
    DRAFT_VERSION,
    createEmptyDraft()
  );
  const [frameworks, setFrameworks] =
    useState<BusinessInput["frameworks"]>(EMPTY_FRAMEWORKS);
  const [input, setInput] = useState<BusinessInput | null>(null);
  const [score, setScore] = useState<BusinessScore | null>(null);
  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const health = useApiHealth();
  const apiSettings = useApiSettings();
  const isZh = locale === "zh";
  const serverAiConfigured =
    health.status === "ready" &&
    health.value.ai.serverConfigured;
  const aiConfigured = apiSettings.hasKey || serverAiConfigured;
  const preferredAiModel = apiSettings.hasKey
    ? apiSettings.settings.model
    : health.status === "ready"
      ? health.value.ai.model
      : "gpt-5.6-sol";

  useEffect(() => {
    window.localStorage.setItem("retaillens.locale", locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title =
      locale === "zh"
        ? "RetailLens / 零售透镜"
        : "RetailLens / Retail Business Assessment";
  }, [locale]);

  const report = useMemo(
    () => (input && score ? scoreToReport(input, score) : null),
    [input, score]
  );
  const consultingAssessment = useMemo(
    () => (input && score ? buildConsultingAssessment(input, score) : null),
    [input, score]
  );
  const enterpriseTheoryAssessment = useMemo(
    () =>
      input && score
        ? buildEnterpriseTheoryAssessment(input, score)
        : null,
    [input, score]
  );

  const setSection = (section: AppSection) => {
    setError(null);
    setActiveSection(section);
  };

  const handleDraftChange = (next: RetailIntakeDraft) => {
    setDraft(next);
    if (
      frameworks.efe.length > 0 ||
      frameworks.ife.length > 0 ||
      frameworks.qspm.factors.length > 0
    ) {
      setFrameworks(EMPTY_FRAMEWORKS);
    }
  };

  const loadDemo = () => {
    const demo = createDemoBusiness();
    setDraft({
      ...businessToDraft(demo),
      plannedLaunchDate: "2026-10-01",
      estimatedCustomerCount: 9_000,
      monthlyTraffic: 12_000,
      inventoryTurnover: 8.5,
      teamSize: 6
    });
    setFrameworks(structuredClone(demo.frameworks));
    setError(null);
  };

  const parseDraft = (nextDraft: RetailIntakeDraft) => {
    const candidate = draftToBusiness(nextDraft, frameworks);
    const parsed = BusinessInputSchema.safeParse(candidate);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(
        isZh
          ? `资料尚未完整：${issue.path.join(".")} — ${issue.message}`
          : `Input is incomplete: ${issue.path.join(".")} — ${issue.message}`
      );
    }
    return parsed.data;
  };

  const runAssessment = async (nextDraft: RetailIntakeDraft) => {
    setSubmitting(true);
    setError(null);

    try {
      const nextInput = parseDraft(nextDraft);
      let nextScore: BusinessScore;

      try {
        nextScore = await requestBusinessScore<
          BusinessInput,
          BusinessScore
        >(locale, nextInput);
      } catch (apiError) {
        nextScore = scoreBusiness(nextInput);
        if (
          apiError instanceof RetailLensApiError &&
          apiError.status === 400
        ) {
          throw apiError;
        }
      }

      setInput(nextInput);
      setScore(nextScore);
      setAi(localAiUnavailable(preferredAiModel));
      save();
      setActiveSection("reports");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (assessmentError) {
      setError(
        assessmentError instanceof Error
          ? assessmentError.message
          : isZh
            ? "评估未能完成。"
            : "The assessment could not be completed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const retryAi = async () => {
    if (!input) return;
    if (!aiConfigured) {
      setApiSettingsOpen(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await analyzeBusiness<
        BusinessInput,
        BusinessScore
      >(
        locale,
        input,
        apiSettings.hasKey ? apiSettings.settings : undefined
      );
      setScore(response.score);
      setAi(response.ai);
    } catch (retryError) {
      setAi({
        status: "error",
        model: preferredAiModel,
        reason: "provider_error"
      });
      setError(
        retryError instanceof Error
          ? retryError.message
          : isZh
            ? "AI 解读暂时不可用。"
            : "AI interpretation is temporarily unavailable."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const saveApiSettings = (next: ApiSettings) => {
    apiSettings.saveSettings(next);
    if (ai?.status !== "complete") {
      setAi(localAiUnavailable(next.model));
    }
  };

  const clearApiSettings = () => {
    apiSettings.clearSettings();
    if (!serverAiConfigured) {
      setAi(localAiUnavailable());
    }
  };

  return (
    <div className="app">
      <AppHeader
        locale={locale}
        activeSection={activeSection}
        apiConfigured={aiConfigured}
        onLocaleChange={setLocale}
        onSectionChange={setSection}
        onOpenApiSettings={() => setApiSettingsOpen(true)}
      />

      <ServiceStrip
        locale={locale}
        health={health}
        hasUserKey={apiSettings.hasKey}
        userModel={apiSettings.settings.model}
        onOpenApiSettings={() => setApiSettingsOpen(true)}
      />

      {error && (
        <div className="app-error" role="alert">
          <AlertTriangle size={17} aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            {isZh ? "关闭" : "Dismiss"}
          </button>
        </div>
      )}

      {activeSection === "assessment" && (
        <IntakeWizard
          locale={locale}
          value={draft}
          onChange={handleDraftChange}
          onSave={() => save()}
          onSubmit={runAssessment}
          onLoadDemo={loadDemo}
          submitting={submitting}
          savedAt={savedAt}
        />
      )}

      {activeSection === "reports" &&
        (report &&
        input &&
        score &&
        consultingAssessment &&
        enterpriseTheoryAssessment ? (
          <ReportView
            locale={locale}
            report={report}
            ai={ai}
            aiLoading={submitting}
            executiveContent={
              <ExecutiveConsultingView
                locale={locale}
                assessment={consultingAssessment}
              />
            }
            theoryContent={
              <EnterpriseTheoryView
                locale={locale}
                assessment={enterpriseTheoryAssessment}
              />
            }
            matrixContent={
              <StrategyMatrices
                locale={locale}
                data={businessToStrategyData(input, score)}
              />
            }
            onRetryAi={retryAi}
            onEdit={() => setActiveSection("assessment")}
            onOpenMethodology={() => setActiveSection("methodology")}
          />
        ) : (
          <EmptyReport
            locale={locale}
            onStart={() => setActiveSection("assessment")}
          />
        ))}

      {activeSection === "methodology" && (
        <MethodologyView locale={locale} />
      )}

      <footer className="app-authorship">
        <span>RetailLens 1.0</span>
        <span>
          {isZh ? "设计与作者：" : "Designed and authored by "}
          <a
            href="https://github.com/lzy2767865503-pixel"
            target="_blank"
            rel="noreferrer"
          >
            LAI ZEYU
          </a>
        </span>
        <a
          href="https://github.com/lzy2767865503-pixel/RetailLens-System/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
        >
          MIT License
        </a>
      </footer>

      {apiSettingsOpen && (
        <ApiSettingsDialog
          open
          locale={locale}
          value={apiSettings.settings}
          onClose={() => setApiSettingsOpen(false)}
          onSave={saveApiSettings}
          onClear={clearApiSettings}
          onTestConnection={(settings, signal) =>
            testAiConnection(settings, signal)
          }
          disabled={submitting}
        />
      )}
    </div>
  );
}

function ServiceStrip({
  locale,
  health,
  hasUserKey,
  userModel,
  onOpenApiSettings
}: {
  locale: Locale;
  health: ReturnType<typeof useApiHealth>;
  hasUserKey: boolean;
  userModel: string;
  onOpenApiSettings: () => void;
}) {
  const isZh = locale === "zh";
  const state =
    health.status === "ready" &&
    (health.value.ai.serverConfigured || hasUserKey)
      ? "connected"
      : health.status === "offline"
        ? "offline"
        : "rules";
  const activeModel = hasUserKey
    ? userModel
    : health.status === "ready"
      ? health.value.ai.model
      : "";

  return (
    <div className={`service-strip service-${state}`}>
      {state === "connected" ? (
        <CheckCircle2 size={14} aria-hidden="true" />
      ) : state === "offline" ? (
        <WifiOff size={14} aria-hidden="true" />
      ) : (
        <CheckCircle2 size={14} aria-hidden="true" />
      )}
      <span>
        {state === "connected"
          ? isZh
            ? `规则评分与 AI 解读已就绪 · ${activeModel}`
            : `Deterministic scoring and AI interpretation ready · ${activeModel}`
          : state === "offline"
            ? isZh
              ? "本地规则评分可用；API 服务未连接"
              : "Local deterministic scoring available; API service offline"
            : isZh
              ? "规则评分已就绪；如需 AI 解读，请配置自己的 API"
              : "Deterministic scoring ready; configure your API for AI interpretation"}
      </span>
      <button
        className="service-action"
        type="button"
        onClick={onOpenApiSettings}
      >
        <KeyRound size={12} aria-hidden="true" />
        {isZh ? "API 设置" : "API settings"}
      </button>
    </div>
  );
}

function EmptyReport({
  locale,
  onStart
}: {
  locale: Locale;
  onStart: () => void;
}) {
  const isZh = locale === "zh";
  return (
    <main className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        RL
      </div>
      <h1>
        {isZh ? "还没有生成评估报告" : "No assessment report yet"}
      </h1>
      <p>
        {isZh
          ? "完成 9 步商业模型资料后，系统会生成固定评分、企业理论诊断、优缺点、硬门槛、战略矩阵和改进路线图。"
          : "Complete the nine-step business profile to generate a deterministic score, enterprise theory diagnostics, strengths, gaps, hard gates, strategy matrices, and an improvement roadmap."}
      </p>
      <button className="button primary" type="button" onClick={onStart}>
        {isZh ? "开始新评估" : "Start an assessment"}
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </main>
  );
}
