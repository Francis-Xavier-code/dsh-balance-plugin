<div align="center">

# 💰 DeepSeek Balance Monitor & Usage Stats

**A DeepSeek Harness (DSH) plugin** — balance monitoring · official top-up link · Miyu-style usage statistics · third-party plugin manager

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness-8d7ce4.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)
[![version](https://img.shields.io/badge/version-1.3.0-b08427.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)

[✨ Features](#-features) · [📥 Install](#-install) · [🖼 Screenshots](#-screenshots) · [❓ FAQ](#-faq) · [📖 Docs](#-docs) · [🌐 中文](README.md)

</div>

---

## ✨ Features

| Module | Capability |
| --- | --- |
| **Balance monitoring** | Monitors DeepSeek API balance (CNY / USD dual balance pool) with parallel multi-account queries; auto-reads the DSH credential `DEEPSEEK_API_KEY` — **no manual entry needed** |
| **Low-balance alerts** | Independent CNY / USD thresholds (default ¥10 / $2, configurable); the balance bar turns red when below threshold |
| **One-click top-up** | Jumps straight to the official DeepSeek top-up page `platform.deepseek.com/top_up`, plus a usage-details page link |
| **Usage statistics** | 1:1 recreation of the [Miyu WebUI usage page](https://github.com/SHORiN-KiWATA/Miyu/tree/main/web): stat tiles / GitHub-contribution-style usage calendar / three-segment stacked trend bar chart / model consumption donut chart with detail table / recent 50 call records |
| **Performance metrics** | Turns · steps · LLM duration · tool-call duration · avg first-token latency · tok/s · cache hit rate |
| **Third-party plugin manager** | Lists unofficial (non-`@deepseek-ai`) web plugins: package name / local path / Bundle rev / dependencies, with a one-click "Open Directory" to locate source code |
| **Model tool** | Registers the `query_api_quota` tool — just ask "How much DeepSeek balance is left?" and get a balance summary |
| **Persistent settings** | Config auto-saves to `config.json` in the plugin directory and restores after restart |
| **One-click update** | Check for updates and update directly in the DSH plugin panel — no manual operations needed |

---

## 📥 Install

### Prerequisites

- **DeepSeek Harness** installed and running
- (Optional) DeepSeek API Key — get one at [platform.deepseek.com](https://platform.deepseek.com); if `DEEPSEEK_API_KEY` is already configured on this machine, the plugin **auto-reads it at startup — no manual input required**

### One-click install (recommended)

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

**Restart DeepSeek Harness** after installation — three icon buttons appear on the right of the input box. Use `DSH_PROFILE=<name>` to target another profile.

### Update the plugin

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | UPDATE=1 bash

# Windows PowerShell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
# Then in PowerShell run: $env:UPDATE='1'; irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

Or click "Check Update" → "Update" in the DSH plugin panel (recommended).

### Uninstall the plugin

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh | bash

# Windows PowerShell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex
```

---

## 🖼 Screenshots

| Screenshot | Description |
| --- | --- |
| ![Input preview](assess/输入框预览.png) | Three icon entries on the right of the input toolbar plus a persistent balance bar below |
| ![Wallet settings](assess/钱包设置页面.png) | Balance monitoring panel: balance table, low-balance alerts, account config, thresholds & refresh interval, top-up entry |
| ![Usage stats top](assess/用量统计界面-顶部.png) | Usage page top: range switcher, stat tiles, live performance metric bar, GitHub-style usage calendar |
| ![Usage stats bottom](assess/用量统计界面底部.png) | Usage page bottom: trend bar chart, model consumption details, call record details |
| ![Plugin manager](assess/三方插件管理界面.png) | Third-party plugin manager: stat badges, plugin list, "Open Directory" action |

---

## ❓ FAQ

**Q: Are my settings preserved after restart?**
A: Settings are automatically persisted to `config.json` in the plugin directory and restore after restart.

**Q: Will the plugin still be there after a restart?**
A: Yes — static plugins are installed persistently and survive restarts. The auto-read `DEEPSEEK_API_KEY` account needs no reconfiguration and restores automatically after restart.

**Q: I can't see the entry button at the bottom of the sidebar?**
A: The DSH sidebar bottom slot is exclusively occupied by the official Cordis panel plugin. This plugin's entry is fixed on the **right of the input toolbar** and does not depend on that slot.

**Q: Will my Key leak?**
A: No. Keys are saved only in `config.json` in the plugin directory on your machine and the UI only shows masked values; neither the source code nor the README contains any secrets.

**Q: Why not use `dsh plugin add dsh-balance-plugin`?**
A: A third party owns a same-named package on npm (`dsh-balance-plugin@0.1.0`), so the bare name would install the wrong one. Use the one-click script or the `github:` source.

See the [full FAQ](docs/faq.md) for more questions.

---

## 📖 Docs

| Document | Description |
| --- | --- |
| [Configuration](docs/configuration.md) | Detailed settings, persistence, update methods |
| [Architecture](docs/architecture.md) | Dual-face architecture, RPC routes, persistence |
| [FAQ](docs/faq.md) | Full FAQ, troubleshooting, installation issues |
| [Contributing](.github/CONTRIBUTING.md) | How to contribute |

---

## 💬 Community

<div align="center">
  <img src="assess/qq-qun.png" alt="QQ Community" width="220" />
</div>

---

## 👥 Contributors

<a href="https://github.com/Francis-Xavier-code/dsh-balance-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Francis-Xavier-code/dsh-balance-plugin" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

---

## 📄 License

[MIT](LICENSE) © 2026 [Black Cat (Francis-Xavier-code)](https://github.com/Francis-Xavier-code)
