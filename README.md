<div align="center">

# 💰 DeepSeek 余额监控与用量统计

**DeepSeek Harness（DSH）插件** —— 余额监控 · 官方充值入口 · Miyu 风格用量统计 · 三方插件管理

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness-8d7ce4.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)
[![version](https://img.shields.io/badge/version-1.2.0-b08427.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)

[✨ 功能](#-功能) · [📥 安装](#-安装) · [🖼 界面预览](#-界面预览) · [❓ FAQ](#-常见问题) · [📖 文档](#-文档) · [🌐 English](README.en.md)

</div>

---

## ✨ 功能

| 模块 | 能力 |
| --- | --- |
| **余额监控** | 监控 DeepSeek API 余额（CNY / USD 双余额池），支持多账户并行查询；自动读取 DSH 凭据 `DEEPSEEK_API_KEY`，**无需手动填写** |
| **低余额告警** | CNY / USD 独立阈值（默认 ¥10 / $2，可配置），低于阈值时余额条标红提醒 |
| **一键充值** | 直达 DeepSeek 官方充值页 `platform.deepseek.com/top_up`，另有用量明细页入口 |
| **用量统计** | 1:1 复刻 [Miyu WebUI 用量页](https://github.com/SHORiN-KiWATA/Miyu/tree/main/web)：统计瓦片 / GitHub 贡献图风格用量日历 / 三段堆叠趋势柱状图 / 模型消耗环形图与明细表 / 最近 50 条调用记录 |
| **性能指标** | 轮次 · 步数 · LLM 时长 · 工具调用时长 · 首 token 平均延迟 · tok/s · 缓存命中率 |
| **三方插件管理** | 非官方（非 `@deepseek-ai`）Web 插件清单：包名 / 本地路径 / Bundle rev / 依赖，一键「打开目录」定位源码 |
| **模型工具** | 注册 `query_api_quota` 工具，直接问"DeepSeek 余额还剩多少"即可得到余额摘要 |
| **设置持久化** | 配置自动保存到插件目录 `config.json`，重启后自动恢复 |
| **一键更新** | 在 DSH 插件面板内直接检查更新并一键更新，无需手动操作 |

---

## 📥 安装

### 前置条件

- 已安装并运行 **DeepSeek Harness**
- （可选）DeepSeek API Key —— 可在 [platform.deepseek.com](https://platform.deepseek.com) 获取；若本机已配置 `DEEPSEEK_API_KEY` 凭据，插件启动时**自动读取，无需手动输入**

### 一键安装（推荐）

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

安装完成后**重启 DeepSeek Harness**，输入框右侧出现三个图标按钮即生效。可用 `DSH_PROFILE=<name>` 指定其他 profile。

### 更新插件

```bash
# macOS / Linux
UPDATE=1 curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash

# Windows PowerShell
$env:UPDATE='1'; irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

或在 DSH 面板内点击「检查更新」→「更新」（推荐）。

### 卸载插件

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh | bash

# Windows PowerShell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex
```

---

## 🖼 界面预览

| 截图 | 说明 |
| --- | --- |
| ![输入框预览](assess/输入框预览.png) | 输入框工具行右侧三个图标入口与下方常驻余额条 |
| ![钱包设置页面](assess/钱包设置页面.png) | 余额监控面板：余额表格、低余额告警、账户配置、阈值与刷新间隔、充值入口 |
| ![用量统计界面-顶部](assess/用量统计界面-顶部.png) | 用量统计页顶部：范围切换、统计瓦片、live 性能指标条、GitHub 风格用量日历 |
| ![用量统计界面底部](assess/用量统计界面底部.png) | 用量统计页底部：趋势柱状图、模型消耗明细、调用记录明细 |
| ![三方插件管理界面](assess/三方插件管理界面.png) | 三方插件管理：统计徽章、插件清单、「打开目录」操作 |

---

## ❓ 常见问题

**Q：重启后设置还在吗？**
A：设置自动持久化到插件目录的 `config.json` 文件中，重启后自动恢复。

**Q：重启后插件还在吗？**
A：静态插件持久安装，重启后仍在。自动读取的 `DEEPSEEK_API_KEY` 无需重配，重启后自动恢复。

**Q：侧边栏底部看不到入口按钮？**
A：DSH 侧边栏底部插槽会被官方 Cordis 面板插件独占整行。本插件入口固定在**输入框工具行右侧**，不依赖该插槽。

**Q：Key 会泄露吗？**
A：不会。Key 只保存在本机插件目录 `config.json` 中，界面仅显示掩码；源码与 README 中不含任何密钥。

**Q：为什么不用 `dsh plugin add dsh-balance-plugin`？**
A：npm 上存在他人同名包（`dsh-balance-plugin@0.1.0`），裸包名会装错。请使用一键脚本或 `github:` 源。

更多问题请查看 [完整 FAQ](docs/faq.md)。

---

## 📖 文档

| 文档 | 说明 |
| --- | --- |
| [配置说明](docs/configuration.md) | 详细配置项说明、持久化机制、更新方式 |
| [架构说明](docs/architecture.md) | 双面架构、RPC 路由、持久化机制 |
| [常见问题](docs/faq.md) | 完整 FAQ、故障排查、安装问题 |
| [贡献指南](.github/CONTRIBUTING.md) | 如何参与贡献 |

---

## 💬 社区交流

<div align="center">
  <img src="assess/qq-qun.png" alt="QQ交流群" width="220" />
</div>

---

## 👥 贡献者

<a href="https://github.com/Francis-Xavier-code/dsh-balance-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Francis-Xavier-code/dsh-balance-plugin" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

---

## 📄 许可

[MIT](LICENSE) © 2026 [Black Cat (Francis-Xavier-code)](https://github.com/Francis-Xavier-code)
