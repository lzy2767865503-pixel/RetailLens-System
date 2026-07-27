#!/bin/zsh
set -e

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "RetailLens 需要 Node.js 20.19.x 或 22.12 以上版本。请先安装 Node.js。\\n\\nRetailLens requires Node.js 20.19.x or Node.js 22.12+." buttons {"确定 / OK"} default button 1 with icon stop'
  exit 1
fi

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major > 22 ? 0 : 1)'; then
  osascript -e 'display dialog "当前 Node.js 版本不受支持。请使用 20.19.x 或 22.12 以上版本。\\n\\nThe installed Node.js version is unsupported. Use Node.js 20.19.x or Node.js 22.12+." buttons {"确定 / OK"} default button 1 with icon stop'
  exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
  PNPM_CMD=(pnpm)
elif command -v corepack >/dev/null 2>&1; then
  PNPM_CMD=(corepack pnpm)
else
  osascript -e 'display dialog "没有找到 pnpm 或 Corepack。请安装 pnpm 11.9.0。\\n\\nNeither pnpm nor Corepack is available. Install pnpm 11.9.0." buttons {"确定 / OK"} default button 1 with icon stop'
  exit 1
fi

echo "RetailLens / 零售透镜"
echo "正在准备本地系统… Preparing the local application…"
"${PNPM_CMD[@]}" install --frozen-lockfile
"${PNPM_CMD[@]}" build

(sleep 2; open "http://127.0.0.1:8787") &

echo "系统已启动： http://127.0.0.1:8787"
echo "按 Control-C 可停止系统。 Press Control-C to stop."
"${PNPM_CMD[@]}" start
