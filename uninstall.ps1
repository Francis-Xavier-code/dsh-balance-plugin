# dsh-balance-plugin 卸载脚本 (Windows PowerShell)
# 用法:
#   irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex

$ErrorActionPreference = "Stop"

$PROFILE = if ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { "web" }
$PATCH = Join-Path $env:USERPROFILE ".dsh\cordis.patch.yml"

# 移除依赖
if (Get-Command dsh -ErrorAction SilentlyContinue) {
    Write-Host "→ 从 profile 移除依赖: $PROFILE" -ForegroundColor Cyan
    & dsh plugin --profile $PROFILE rm dsh-balance-plugin 2>$null
} else {
    Write-Host "! 未找到 dsh 命令，跳过依赖移除（如有需要请手动执行: dsh plugin --profile $PROFILE rm dsh-balance-plugin）" -ForegroundColor Yellow
}

# 从用户层 patch 中移除本插件块（幂等）
if (Test-Path $PATCH) {
    $lines = Get-Content $PATCH -Encoding UTF8
    $out = @()
    $i = 0
    while ($i -lt $lines.Count) {
        if ($lines[$i].Trim() -eq "- insert:") {
            $block = $lines[$i..($i + 2)]
            if ($block -match "dsh-balance-plugin") {
                $i += 3
                continue
            }
        }
        $out += $lines[$i]
        $i++
    }
    
    $nonComment = $out | Where-Object { $_.Trim() -and -not $_.Trim().StartsWith("#") }
    if ($nonComment.Count -eq 0) {
        Remove-Item $PATCH -Force
        Write-Host "→ 已移除 $PATCH（无剩余 patch 条目，删除文件）" -ForegroundColor Cyan
    } else {
        $out | Set-Content $PATCH -Encoding UTF8
        Write-Host "→ 已从 $PATCH 移除插件块" -ForegroundColor Cyan
    }
}

Write-Host "✔ 卸载完成！请重启 DeepSeek Harness 生效。" -ForegroundColor Green