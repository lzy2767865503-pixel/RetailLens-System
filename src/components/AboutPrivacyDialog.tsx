import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent
} from "react";
import { Info, ShieldCheck, Trash2, X } from "lucide-react";
import type { Locale } from "../i18n";

export interface AboutPrivacyDialogProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  onClearLocalData: () => void;
}

export function AboutPrivacyDialog({
  open,
  locale,
  onClose,
  onClearLocalData
}: AboutPrivacyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [cleared, setCleared] = useState(false);
  const isZh = locale === "zh";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (open) setCleared(false);
  }, [open]);

  const handleBackdropClick = (
    event: ReactMouseEvent<HTMLDialogElement>
  ) => {
    if (event.target === event.currentTarget) onClose();
  };

  const clearData = () => {
    const confirmed = window.confirm(
      isZh
        ? "确认清除本机保存的商业草稿、报告状态、内存中的 API 密钥和模型偏好吗？语言偏好会保留。"
        : "Clear the locally saved business draft, report state, in-memory API key, and model preference? The language preference will remain."
    );
    if (!confirmed) return;

    onClearLocalData();
    setCleared(true);
  };

  return (
    <dialog
      ref={dialogRef}
      className="about-privacy-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
    >
      <header className="about-dialog-header">
        <div>
          <Info size={21} aria-hidden="true" />
          <div>
            <h2 id={titleId}>
              {isZh ? "关于与隐私" : "About & privacy"}
            </h2>
            <p id={descriptionId}>
              Retail Decision Studio by LAI ZEYU {__APP_VERSION__} · Windows v1
            </p>
          </div>
        </div>
        <button
          className="button ghost"
          type="button"
          onClick={onClose}
          aria-label={isZh ? "关闭" : "Close"}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="about-dialog-body">
        <section>
          <h3>{isZh ? "应用边界" : "Application boundary"}</h3>
          <p>
            {isZh
              ? "Retail Decision Studio by LAI ZEYU 是基于 RetailLens 开源项目构建的 Windows 中英文零售商业决策支持工具。确定性评分、硬门槛和企业理论输出由版本化规则生成；AI 只能读取锁定结果并提供可选解释，不能改分。"
              : "Retail Decision Studio by LAI ZEYU is a bilingual Windows retail decision-support app built from the open-source RetailLens project. Versioned rules produce the deterministic score, hard gates, and enterprise-theory outputs; optional AI can only interpret locked results and cannot change the score."}
          </p>
          <p>
            {isZh
              ? "内置演示数据为合成样例，不代表真实企业或经核实的当前市场事实。本应用不构成法律、税务、会计、投资或监管建议。"
              : "The built-in demo is synthetic and does not represent a real business or verified current market facts. This app is not legal, tax, accounting, investment, or regulatory advice."}
          </p>
          <p>
            {isZh ? "设计与作者：" : "Designed and authored by "}
            <strong>LAI ZEYU（来泽宇）</strong>
          </p>
        </section>

        <section>
          <h3>
            <ShieldCheck size={18} aria-hidden="true" />
            {isZh ? "隐私说明" : "Privacy summary"}
          </h3>
          <ul>
            <li>
              {isZh
                ? "商业草稿和非敏感模型偏好只保存在本机应用存储；没有账户、云端数据库、遥测或广告追踪。"
                : "Business drafts and the non-secret model preference stay in local app storage; there are no accounts, cloud database, telemetry, or advertising trackers."}
            </li>
            <li>
              {isZh
                ? "使用者输入的 OpenAI API 密钥只保留在当前页面内存，不写入磁盘。"
                : "A user-entered OpenAI API key stays in current-page memory and is not written to disk."}
            </li>
            <li>
              {isZh
                ? "只有主动测试连接或生成 AI 解读时，密钥和必要请求才经 127.0.0.1 本机服务发送给 OpenAI；规则评分完全不需要 AI。"
                : "Only an explicit connection test or AI-interpretation request sends the key and necessary request through the 127.0.0.1 service to OpenAI; deterministic scoring never requires AI."}
            </li>
          </ul>
          <a
            href="https://github.com/lzy2767865503-pixel/RetailLens-System/blob/main/docs/PRIVACY.md"
            target="_blank"
            rel="noreferrer"
          >
            {isZh ? "查看完整隐私说明" : "Read the full privacy statement"}
          </a>
        </section>
      </div>

      <footer className="about-dialog-actions">
        <div className={cleared ? "clear-status is-cleared" : "clear-status"}>
          {cleared
            ? isZh
              ? "本机商业数据已清除。"
              : "Local business data was cleared."
            : isZh
              ? "语言偏好不会被清除。"
              : "Language preference is retained."}
        </div>
        <button
          className="button danger"
          type="button"
          onClick={clearData}
          data-testid="clear-local-data"
        >
          <Trash2 size={17} aria-hidden="true" />
          {isZh ? "清除本机数据" : "Clear local data"}
        </button>
        <button className="button" type="button" onClick={onClose}>
          {isZh ? "完成" : "Done"}
        </button>
      </footer>
    </dialog>
  );
}

export default AboutPrivacyDialog;
