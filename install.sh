#!/usr/bin/env bash
# dsh-balance-plugin 一键远程安装脚本
# 用法:
#   curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash
# 可选: 指定 profile（默认 web）: DSH_PROFILE=tui curl -fsSL ... | bash
# 可选: 强制更新: UPDATE=1 curl -fsSL ... | bash
# 可选: 显式指定 registry 包（默认走 github: 协议，避免与 npm 上同名包混淆）:
#   PKG=@Francis-Xavier-code/dsh-balance-plugin curl -fsSL ... | bash
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"

PKG="${PKG:-}"
UPDATE="${UPDATE:-0}"
GITHUB_SRC="github:Francis-Xavier-code/dsh-balance-plugin"
TARBALL="https://github.com/Francis-Xavier-code/dsh-balance-plugin/archive/refs/heads/main.tar.gz"
PROFILE="${DSH_PROFILE:-web}"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/package.json"

if ! command -v dsh >/dev/null 2>&1; then
  echo "✗ 未找到 dsh 命令（应位于 ~/.local/bin/dsh）" >&2
  exit 1
fi

# 获取本地已安装版本
getLocalVersion() {
  local pkgJson="$HOME/.dsh/profiles/$PROFILE/node_modules/dsh-balance-plugin/package.json"
  if [ -f "$pkgJson" ]; then
    grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$pkgJson" 2>/dev/null | head -1 | sed 's/.*"\([0-9][0-9.]*\)".*/\1/' || echo ""
  else
    echo ""
  fi
}

# 获取远程最新版本
getRemoteVersion() {
  curl -fsSL "$REMOTE_VERSION_URL" 2>/dev/null | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([0-9][0-9.]*\)".*/\1/' || echo ""
}

LOCAL_VERSION=$(getLocalVersion)
echo "→ 当前 profile: $PROFILE"
if [ -n "$LOCAL_VERSION" ]; then
  echo "→ 已安装版本: $LOCAL_VERSION"
fi

# 检查远程版本并提示更新
if [ "$UPDATE" != "1" ] && [ -n "$LOCAL_VERSION" ]; then
  REMOTE_VERSION=$(getRemoteVersion)
  if [ -n "$REMOTE_VERSION" ] && [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
    echo "! 发现新版本: $REMOTE_VERSION（当前 $LOCAL_VERSION）"
    echo "  运行 UPDATE=1 bash 更新，或在 DSH 插件面板中点击「检查更新」"
  fi
fi

# pnpm 可能因 build-scripts 策略（ERR_PNPM_IGNORED_BUILDS）返回非零但安装已成功；
# 以 profile package.json 是否写入依赖为准判定。
ensureInstalled() {
  if grep -q "dsh-balance-plugin" "$HOME/.dsh/profiles/$PROFILE/package.json" 2>/dev/null; then
    echo "! pnpm 提示非零退出（build scripts 策略），但依赖已写入，继续"
    return 0
  fi
  echo "✗ 安装失败：依赖未写入 profile" >&2
  return 1
}

# 强制更新：先移除旧依赖再重装；否则已安装则跳过（幂等）
if [ "$UPDATE" = "1" ]; then
  echo "→ UPDATE=1：先移除旧依赖"
  dsh plugin --profile "$PROFILE" rm dsh-balance-plugin 2>/dev/null || true
fi
if grep -q '"dsh-balance-plugin"' "$HOME/.dsh/profiles/$PROFILE/package.json" 2>/dev/null && [ "$UPDATE" != "1" ]; then
  echo "→ 依赖已存在于 profile: ${PROFILE}，跳过安装（更新代码请用 UPDATE=1）"
else
  tryAdd() {
    if ! dsh plugin --profile "$PROFILE" add "$1" 2>/dev/null; then
      ensureInstalled
    fi
  }
  if [ -n "$PKG" ]; then
    echo "→ 从 registry 安装 $PKG 到 profile: $PROFILE"
    if ! tryAdd "$PKG"; then
      echo "→ registry 安装失败，改用 github: 协议"
      if ! tryAdd "$GITHUB_SRC"; then
        echo "→ github: 安装失败，改用 GitHub tarball 兜底"
        tryAdd "$TARBALL" || exit 1
      fi
    fi
  else
    # 默认 github: 协议（git clone + pack，哈希稳定）；
    # GitHub archive tarball 为动态生成，pnpm 会报 ERR_PNPM_TARBALL_INTEGRITY，仅作最后兜底。
    echo "→ 从 github: 协议安装到 profile: $PROFILE"
    if ! tryAdd "$GITHUB_SRC"; then
      echo "→ github: 安装失败，改用 GitHub tarball 兜底"
      tryAdd "$TARBALL" || exit 1
    fi
  fi
fi

# 注意：不要再把插件写进 ~/.dsh/cordis.patch.yml 的 insert 块。
# `dsh plugin add` 已经把插件加入 profile 的 dsh.bundles（单一注册源）。
# 若在 patch.yml 再 insert 同一个 id，DSH 组合时会报
# "duplicate loader entry id: dsh-balance-plugin" 导致 Host 启动崩溃。
# 故这里仅校验 profile 已含本插件，不再额外写入 patch。

NEW_VERSION=$(getLocalVersion)
if [ -n "$NEW_VERSION" ]; then
  echo "✔ 安装完成！当前版本: $NEW_VERSION"
else
  echo "✔ 安装完成！"
fi
echo "  请重启 DeepSeek Harness 生效。"
echo "  验证组合: dsh --profile $PROFILE --dump-config | grep dsh-balance-plugin"
echo "  卸载: curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh | bash"
