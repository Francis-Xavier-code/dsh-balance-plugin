# 架构说明

## 双面架构

本插件采用"双面"架构，Host 端（Node.js）和 Client 端（浏览器）通过 RPC 通信。

```
Host（Node.js 进程）
├─ 余额查询：shell 执行 curl → api.deepseek.com/user/balance（Bearer 鉴权）
├─ 用量聚合：session/event 实时监听 + 90 天历史扫描（按 seq 去重）
├─ 三方插件：clientModules.graph() + clientPath() + open -R 定位
├─ RPC 路由：/bmon/api/get-state · refresh · recharge · set-config ·
│            get-usage · list-plugins · open-plugin-dir · check-updates · update-plugin
│            install-plugin · uninstall-plugin · search-plugins · get-plugin-info · featured-plugins
├─ 持久化：配置自动保存到 config.json 文件
└─ 模型工具：query_api_quota

Client（浏览器）
├─ 入口：输入框工具行右侧 3 个 SVG 图标按钮
├─ 浮层：组件内自渲染 fixed 面板（不依赖 overlay 槽位）
├─ 图表：Miyu chart/heat 色板，深色/浅色自适应
└─ 轮询：每 15 秒与 Host 同步状态，支持增量更新
```

## RPC 路由

| 路由 | 说明 |
| --- | --- |
| `get-state` | 获取完整状态（余额、配置、轮询状态等） |
| `refresh` | 强制刷新余额 |
| `recharge` | 获取充值链接 |
| `set-config` | 更新配置（账户、阈值、间隔等），自动持久化 |
| `get-usage` | 获取用量统计（1d/7d/30d/all） |
| `list-plugins` | 列出已安装插件（区分官方/三方） |
| `open-plugin-dir` | 打开插件目录 |
| `install-plugin` | 安装插件（调用 `dsh plugin add`） |
| `uninstall-plugin` | 卸载插件（调用 `dsh plugin rm`） |
| `update-plugin` | 更新插件（先 rm 再 add） |
| `check-updates` | 检查 GitHub 上的新版本 |
| `search-plugins` | npm 搜索 |
| `get-plugin-info` | 包详情 |
| `featured-plugins` | 推荐插件列表 |

## 平台支持

- **macOS / Linux**：install.sh / uninstall.sh（Bash 脚本）
- **Windows**：install.ps1 / uninstall.ps1（PowerShell 脚本）

## 持久化机制

配置保存在插件安装目录的 `config.json` 文件中，包含：
- 账户列表（名称、API Key、自动读取标记）
- CNY/USD 告警阈值
- 刷新间隔
- 底部余额栏显示/隐藏设置
- 下一个账户 ID 计数器

启动时自动加载配置，保存设置时自动写入文件。
