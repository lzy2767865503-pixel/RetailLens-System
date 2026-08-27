const TRUSTED_GITHUB_OWNER = "lzy2767865503-pixel";

export interface KeyboardInput {
  key: string;
  control?: boolean;
  meta?: boolean;
  shift?: boolean;
}

export function desktopStartupErrorMessage(
  error: unknown,
  port: number
): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "EADDRINUSE") {
    return `Local port ${port} is already in use. Close the conflicting process, then reopen Retail Decision Studio by LAI ZEYU.`;
  }

  return error instanceof Error ? error.message : "unknown error";
}

export function isLocalAppNavigation(
  targetUrl: string,
  expectedOrigin: string
): boolean {
  try {
    const target = new URL(targetUrl);
    const origin = new URL(expectedOrigin);
    return (
      origin.protocol === "http:" &&
      origin.hostname === "127.0.0.1" &&
      target.origin === origin.origin
    );
  } catch {
    return false;
  }
}

export function isTrustedExternalUrl(targetUrl: string): boolean {
  try {
    const target = new URL(targetUrl);
    const ownerPath = `/${TRUSTED_GITHUB_OWNER}`;
    return (
      target.protocol === "https:" &&
      target.hostname === "github.com" &&
      (target.pathname === ownerPath ||
        target.pathname.startsWith(`${ownerPath}/`))
    );
  } catch {
    return false;
  }
}

export function isDevToolsShortcut(input: KeyboardInput): boolean {
  const key = input.key.toLowerCase();
  const primaryModifier = Boolean(input.control || input.meta);
  return (
    key === "f12" ||
    (primaryModifier && input.shift === true && ["c", "i", "j"].includes(key))
  );
}
