# dsh-balance-plugin 一键远程安装脚本 (Windows PowerShell)
# 用法:
#   irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
# 可选: 指定 profile（默认 web）: $env:DSH_PROFILE='tui'; irm ... | iex
# 可选: 显式指定 registry 包（默认走 github: 协议，避免与 npm 上同名包混淆）:
#   $env:PKG='@Francis-Xavier-code/dsh-balance-plugin'; irm ... | iex

$ErrorActionPreference = "Stop"

$PKG = if ($env:PKG) { $env:PKG } else { "" }
$UPDATE = if ($env:UPDATE) { $env:UPDATE } else { "0" }
$GITHUB_SRC = "github:Francis-Xavier-code/dsh-balance-plugin"
$TARBALL = "https://github.com/Francis-Xavier-code/dsh-balance-plugin/archive/refs/heads/main.tar.gz"
$PROFILE = if ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { "web" }
$PATCH = Join-Path $env:USERPROFILE ".dsh\cordis.patch.yml"

# 检查 dsh 命令是否存在
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
    Write-Host "✗ 未找到 dsh 命令" -ForegroundColor Red
    exit 1
}

# 检查是否已安装
function Test-Installed {
    $packageJson = Join-Path $env:USERPROFILE ".dsh\profiles\$PROFILE\package.json"
    if (Test-Path $packageJson) {
        $content = Get-Content $packageJson -Raw
        return $content -match "dsh-balance-plugin"
    }
    return $false
}

# 强制更新：先移除旧依赖再重装；否则已安装则跳过（幂等）
if ($UPDATE -eq "1") {
    Write-Host "→ UPDATE=1：先移除旧依赖" -ForegroundColor Cyan
    & dsh plugin --profile $PROFILE rm dsh-balance-plugin 2>$null
}

if ((Test-Installed) -and ($UPDATE -ne "1")) {
    Write-Host "→ 依赖已存在于 profile: $PROFILE，跳过安装（更新代码请用 UPDATE=1）" -ForegroundColor Yellow
} else {
    function Invoke-Add {
        param([string]$Source)
        try {
            & dsh plugin --profile $PROFILE add $Source 2>$null
            return $true
        } catch {
            return $false
        }
    }

    if ($PKG) {
        Write-Host "→ 从 registry 安装 $PKG 到 profile: $PROFILE" -ForegroundColor Cyan
        if (-not (Invoke-Add $PKG)) {
            Write-Host "→ registry 安装失败，改用 github: 协议" -ForegroundColor Yellow
            if (-not (Invoke-Add $GITHUB_SRC)) {
                Write-Host "→ github: 安装失败，改用 GitHub tarball 兜底" -ForegroundColor Yellow
                if (-not (Invoke-Add $TARBALL)) {
                    Write-Host "✗ 安装失败" -ForegroundColor Red
                    exit 1
                }
            }
        }
    } else {
        Write-Host "→ 从 github: 协议安装到 profile: $PROFILE" -ForegroundColor Cyan
        if (-not (Invoke-Add $GITHUB_SRC)) {
            Write-Host "→ github: 安装失败，改用 GitHub tarball 兜底" -ForegroundColor Yellow
            if (-not (Invoke-Add $TARBALL)) {
                Write-Host "✗ 安装失败" -ForegroundColor Red
                exit 1
            }
        }
    }
}

Write-Host "✔ 安装完成！请重启 DeepSeek Harness 生效。" -ForegroundColor Green
Write-Host "  验证组合: dsh --profile $PROFILE --dump-config | Select-String dsh-balance-plugin"
Write-Host "  卸载: irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex"