import {
  BarChart3,
  BookOpen,
  FilePlus2,
  KeyRound
} from "lucide-react";
import type { Locale } from "../i18n";
import { uiCopy } from "../i18n";

export type AppSection = "assessment" | "reports" | "methodology";

interface AppHeaderProps {
  locale: Locale;
  activeSection: AppSection;
  apiConfigured: boolean;
  onLocaleChange: (locale: Locale) => void;
  onSectionChange: (section: AppSection) => void;
  onOpenApiSettings: () => void;
}

const navItems = [
  {
    id: "assessment" as const,
    icon: FilePlus2,
    label: uiCopy.nav.assessment
  },
  {
    id: "reports" as const,
    icon: BarChart3,
    label: uiCopy.nav.reports
  },
  {
    id: "methodology" as const,
    icon: BookOpen,
    label: uiCopy.nav.methodology
  }
];

export function AppHeader({
  locale,
  activeSection,
  apiConfigured,
  onLocaleChange,
  onSectionChange,
  onOpenApiSettings
}: AppHeaderProps) {
  const isZh = locale === "zh";

  return (
    <header className="app-header">
      <button
        className="brand"
        type="button"
        onClick={() => onSectionChange("assessment")}
        aria-label="RetailLens home"
      >
        <span className="brand-mark" aria-hidden="true">
          RL
        </span>
        <span>
          RetailLens <span className="brand-slash">/</span>{" "}
          <span className="brand-zh">零售透镜</span>
        </span>
      </button>

      <nav className="primary-nav" aria-label="Primary navigation">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            className={activeSection === id ? "nav-item is-active" : "nav-item"}
            type="button"
            key={id}
            onClick={() => onSectionChange(id)}
            aria-current={activeSection === id ? "page" : undefined}
          >
            <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>
              {label[locale]}{" "}
              <small>{locale === "zh" ? label.en : label.zh}</small>
            </span>
          </button>
        ))}
      </nav>

      <div className="header-tools">
        <button
          className={
            apiConfigured
              ? "api-settings-trigger is-configured"
              : "api-settings-trigger"
          }
          type="button"
          onClick={onOpenApiSettings}
          aria-label={
            isZh
              ? "打开 OpenAI API 设置"
              : "Open OpenAI API settings"
          }
        >
          <KeyRound size={15} aria-hidden="true" />
          <span>API</span>
          <span className="api-settings-dot" aria-hidden="true" />
        </button>
        <div className="language-toggle" aria-label="Language">
          <button
            type="button"
            className={locale === "zh" ? "is-selected" : ""}
            onClick={() => onLocaleChange("zh")}
            aria-pressed={locale === "zh"}
          >
            中文
          </button>
          <span aria-hidden="true">|</span>
          <button
            type="button"
            className={locale === "en" ? "is-selected" : ""}
            onClick={() => onLocaleChange("en")}
            aria-pressed={locale === "en"}
          >
            English
          </button>
        </div>
        <p className="language-notice">
          {uiCopy.languageNotice[locale]}
          <span>
            {" "}
            ·{" "}
            {locale === "zh"
              ? uiCopy.languageNotice.en
              : uiCopy.languageNotice.zh}
          </span>
        </p>
      </div>
    </header>
  );
}
