<div align="center">

# 💰 DeepSeek 余额监控与用量统计

**DeepSeek Harness（DSH）插件** —— 余额监控 · 官方充值入口 · Miyu 风格用量统计 · 三方插件管理

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness-8d7ce4.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)
[![version](https://img.shields.io/badge/version-1.0.0-b08427.svg)](https://github.com/Francis-Xavier-code/dsh-balance-plugin)

**🌐 [English](README.md) · [简体中文](README.zh-CN.md)**

[✨ 功能](#-功能) · [🖼 界面预览](#-界面预览) · [📥 安装](#-安装) · [⚙️ 配置](#️-配置) · [🎮 使用](#-使用) · [🗑 卸载](#-卸载) · [🏗 架构](#-架构) · [❓ FAQ](#-常见问题)

### 平台支持

| 平台 | 安装 | 卸载 |
| --- | --- | --- |
| **macOS / Linux** | `curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh \| bash` | `curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh \| bash` |
| **Windows** | `irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 \| iex` | `irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 \| iex` |

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

图表采用 Miyu 的 chart / heat 色板（蓝 / 金 / 玫红 / 紫 + 蓝紫热力色阶），自动适配深色 / 浅色主题。

---

## 🖼 界面预览

| 截图 | 说明 |
| --- | --- |
| ![输入框预览](assess/输入框预览.png) | 输入框工具行右侧三个图标入口（💰 钱包 / 📊 用量 / 🧩 三方插件）与下方常驻余额条 |
| ![钱包设置页面](assess/钱包设置页面.png) | 余额监控面板：余额表格、低余额告警、账户配置、阈值与刷新间隔、充值入口 |
| ![用量统计界面-顶部](assess/用量统计界面-顶部.png) | 用量统计页顶部：范围切换、统计瓦片、live 性能指标条、GitHub 风格用量日历 |
| ![用量统计界面底部](assess/用量统计界面底部.png) | 用量统计页底部：趋势柱状图、模型消耗明细、调用记录明细 |
| ![三方插件管理界面](assess/三方插件管理界面.png) | 三方插件管理：统计徽章、插件清单、「打开目录」操作 |

---

## 📥 安装

### 前置条件

- 已安装并运行 **DeepSeek Harness**
- （可选）DeepSeek API Key —— 可在 [platform.deepseek.com](https://platform.deepseek.com) 获取；若本机已配置 `DEEPSEEK_API_KEY` 凭据，插件启动时**自动读取，无需手动输入**

### 一键安装（推荐）

**macOS / Linux:**
```bash
# 安装（自动：装依赖 → 写组合 patch → 提示重启）
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
# 安装（自动：装依赖 → 写组合 patch → 提示重启）
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/install.ps1 | iex
```

安装完成后**重启 DeepSeek Harness**，输入框右侧出现三个图标按钮即生效。可用 `DSH_PROFILE=<name>` 指定其他 profile。

### 手动安装（等效）

```bash
# 1. 安装依赖（默认 github: 源，勿用裸包名——npm 上存在他人同名包）
dsh plugin --profile web add github:Francis-Xavier-code/dsh-balance-plugin

# 2. 将插件行追加到 ~/.dsh/cordis.patch.yml（已存在则跳过）
- insert:
    - id: dsh-balance-plugin
      name: 'dsh-balance-plugin'

# 3. 重启 DeepSeek Harness
```

---

## ⚙️ 配置

点击**输入框工具行右侧的钱包图标（💰）**打开「余额监控」面板：

| 配置项 | 说明 |
| --- | --- |
| **账户列表** | 「+ 添加账户」新增；每个账户可设名称与 API Key |
| **API Key 输入** | 直接填明文 Key，或填 `$env:环境变量名` 引用（如 `$env:DEEPSEEK_API_KEY`）；已有 Key 的账户留空表示保持不变 |
| **自动读取账户** | 启动时若检测到 DSH 凭据 `DEEPSEEK_API_KEY`，自动生成「自动读取·DSH 凭据」账户 |
| **CNY / USD 告警阈值** | 对应币种余额低于阈值时触发低余额告警（默认 ¥10 / $2） |
| **刷新间隔** | 30 秒 ~ 30 分钟（默认 5 分钟）；「保存配置」即立即刷新一次 |

> 🔒 密钥安全：API Key 仅保存在本机插件进程内存中，不会上传任何第三方；界面只显示掩码。

---

## 🎮 使用

| 入口 | 位置 | 说明 |
| --- | --- | --- |
| 💰 钱包图标 | 输入框工具行右侧 | 打开余额监控面板（配置 / 余额 / 充值） |
| 📊 柱状图图标 | 输入框工具行右侧 | 打开用量统计面板 |
| 🧩 四格图标 | 输入框工具行右侧 | 打开三方插件管理面板 |
| 常驻余额条 | 输入框下方 | 实时余额摘要、↻ 刷新、充值链接；低余额时整条标红 |
| `query_api_quota` 工具 | 模型调用 | 直接问"DeepSeek 余额还剩多少" |

面板均为居中浮层：点击遮罩或「✕ 关闭」退出。

---

## 🗑 卸载

**macOS / Linux:**
```bash
# 一键卸载（移除依赖 + 清理组合 patch）
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh | bash
```

**Windows (PowerShell):**
```powershell
# 一键卸载（移除依赖 + 清理组合 patch）
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex
```

手动等效：

```bash
dsh plugin --profile web rm dsh-balance-plugin
# 并从 ~/.dsh/cordis.patch.yml 移除对应两行
```

卸载后重启 DeepSeek Harness 生效。

---

## 🏗 架构

```
Host（Node.js 进程）
├─ 余额查询：shell 执行 curl → api.deepseek.com/user/balance（Bearer 鉴权）
├─ 用量聚合：session/event 实时监听 + 90 天历史扫描（按 seq 去重）
├─ 三方插件：clientModules.graph() + clientPath() + open -R 定位
├─ RPC 路由：/bmon/api/get-state · refresh · recharge · set-config ·
│            get-usage · list-plugins · open-plugin-dir
└─ 模型工具：query_api_quota

Client（浏览器）
├─ 入口：输入框工具行右侧 3 个 SVG 图标按钮
├─ 浮层：组件内自渲染 fixed 面板（不依赖 overlay 槽位）
└─ 图表：Miyu chart/heat 色板，深色/浅色自适应

平台支持：
├─ macOS / Linux：install.sh / uninstall.sh（Bash 脚本）
└─ Windows：install.ps1 / uninstall.ps1（PowerShell 脚本）
```

---

## ❓ 常见问题

**Q：重启后插件还在吗？**
A：静态插件持久安装，重启后仍在；手动配置的账户 Key 会重置（自动读取的 `DEEPSEEK_API_KEY` 无需重配，重启后自动恢复）。

**Q：侧边栏底部看不到入口按钮？**
A：DSH 侧边栏底部插槽会被官方 Cordis 面板插件独占整行。本插件入口固定在**输入框工具行右侧**，不依赖该插槽。

**Q：Key 会泄露吗？**
A：不会。Key 只保存在本机插件进程内存，界面仅显示掩码；源码与 README 中不含任何密钥。

**Q：余额查询失败？**
A：检查面板中的错误提示：未配置 Key（`未配置 API Key`）、环境变量缺失（`未设置环境变量 xxx`）、Key 无效（401 错误信息）等，对应处理即可。

**Q：用量统计没有历史数据？**
A：插件启动时扫描近 90 天会话事件；「首 token 平均」仅统计插件运行后实时捕获的流式数据。

**Q：为什么不用 `dsh plugin add dsh-balance-plugin`？**
A：npm 上存在他人同名包（`dsh-balance-plugin@0.1.0`），裸包名会装错。请使用一键脚本或 `github:` 源（见[安装](#-安装)）。

**Q：Windows 安装失败？**
A：确保以管理员身份运行 PowerShell。如果执行策略阻止脚本，请运行：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 💬 社区交流

<div align="center">
  <img src="assess/qq-qun.png" alt="QQ交流群" width="220" />
</div>

---

## 📄 许可

[MIT](LICENSE) © 2026 [Black Cat (Francis-Xavier-code)](https://github.com/Francis-Xavier-code)