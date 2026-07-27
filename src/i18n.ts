export type Locale = "zh" | "en";

export interface BilingualText {
  zh: string;
  en: string;
}

export const text = (value: BilingualText, locale: Locale) => value[locale];

export const uiCopy = {
  nav: {
    assessment: { zh: "新建评估", en: "New Assessment" },
    reports: { zh: "项目底稿", en: "Engagements" },
    methodology: { zh: "方法与审计", en: "Method & Audit" }
  },
  languageNotice: {
    zh: "仅支持中文与 English",
    en: "Chinese & English only"
  },
  actions: {
    saveDraft: { zh: "保存草稿", en: "Save draft" },
    continue: { zh: "下一步", en: "Continue" },
    back: { zh: "上一步", en: "Back" },
    assess: { zh: "生成评估", en: "Generate assessment" },
    export: { zh: "导出报告", en: "Export report" },
    edit: { zh: "编辑资料", en: "Edit inputs" },
    viewEvidence: { zh: "查看评分证据", en: "View evidence" },
    generateAi: { zh: "生成深度解读", en: "Generate AI interpretation" }
  }
} satisfies Record<string, unknown>;

export const bilingual = (zh: string, en: string, locale: Locale) =>
  locale === "zh" ? `${zh} / ${en}` : `${en} / ${zh}`;
