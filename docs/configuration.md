# 配置说明

点击**输入框工具行右侧的钱包图标（💰）**打开「余额监控」面板。

## 配置项

| 配置项 | 说明 |
| --- | --- |
| **账户列表** | 「+ 添加账户」新增；每个账户可设名称与 API Key |
| **API Key 输入** | 直接填明文 Key，或填 `$env:环境变量名` 引用（如 `$env:DEEPSEEK_API_KEY`）；已有 Key 的账户留空表示保持不变 |
| **自动读取账户** | 启动时若检测到 DSH 凭据 `DEEPSEEK_API_KEY`，自动生成「自动读取·DSH 凭据」账户 |
| **CNY / USD 告警阈值** | 对应币种余额低于阈值时触发低余额告警（默认 ¥10 / $2） |
| **刷新间隔** | 30 秒 ~ 30 分钟（默认 5 分钟）；「保存配置」即立即刷新一次 |
| **底部余额栏** | 选择显示或隐藏输入框下方的常驻余额条 |

> 🔒 密钥安全：API Key 仅保存在本机插件目录 `config.json` 中，不会上传任何第三方；界面只显示掩码。

## 持久化存储

设置自动持久化到插件目录的 `config.json` 文件中，重启后自动恢复。如果面板底部显示「配置已持久化到: ...」则说明持久化正常工作。

## 更新插件

**方式一：在 DSH 面板内更新（推荐）**
1. 点击输入框右侧的 💰 图标打开余额监控面板
2. 滚动到底部「插件更新」区域
3. 点击「检查更新」，如有新版本点击「更新」即可

**方式二：一键脚本更新**
```bash
# macOS / Linux
UPDATE=1 curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash

# Windows PowerShell
$env:UPDATE='1'; irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

## 使用入口

| 入口 | 位置 | 说明 |
| --- | --- | --- |
| 💰 钱包图标 | 输入框工具行右侧 | 打开余额监控面板（配置 / 余额 / 充值） |
| 📊 柱状图图标 | 输入框工具行右侧 | 打开用量统计面板 |
| 🧩 四格图标 | 输入框工具行右侧 | 打开三方插件管理面板 |
| 常驻余额条 | 输入框下方 | 实时余额摘要、↻ 刷新、充值链接；低余额时整条标红 |
| `query_api_quota` 工具 | 模型调用 | 直接问"DeepSeek 余额还剩多少" |

面板均为居中浮层：点击遮罩或「✕ 关闭」退出。
