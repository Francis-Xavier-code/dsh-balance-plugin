# 常见问题 (FAQ)

## 基本问题

**Q：重启后设置还在吗？**
A：设置自动持久化到插件目录的 `config.json` 文件中，重启后自动恢复。如果面板底部显示「配置已持久化到: ...」则说明持久化正常工作。

**Q：重启后插件还在吗？**
A：静态插件持久安装，重启后仍在。自动读取的 `DEEPSEEK_API_KEY` 无需重配，重启后自动恢复。

**Q：侧边栏底部看不到入口按钮？**
A：DSH 侧边栏底部插槽会被官方 Cordis 面板插件独占整行。本插件入口固定在**输入框工具行右侧**，不依赖该插槽。

## 安全问题

**Q：Key 会泄露吗？**
A：不会。Key 只保存在本机插件目录 `config.json` 中，界面仅显示掩码；源码与 README 中不含任何密钥。

## 故障排查

**Q：余额查询失败？**
A：检查面板中的错误提示：
- `未配置 API Key`：需要配置 DeepSeek API Key
- `未设置环境变量 xxx`：使用了 `$env:环境变量名` 格式，但环境变量未设置
- `401 错误`：API Key 无效，请检查是否正确

**Q：用量统计没有历史数据？**
A：插件启动时扫描近 90 天会话事件；「首 token 平均」仅统计插件运行后实时捕获的流式数据。

## 安装问题

**Q：为什么不用 `dsh plugin add dsh-balance-plugin`？**
A：npm 上存在他人同名包（`dsh-balance-plugin@0.1.0`），裸包名会装错。请使用一键脚本或 `github:` 源。

**Q：Windows 安装失败？**
A：确保以管理员身份运行 PowerShell。如果执行策略阻止脚本，请运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Q：如何更新插件？**
A：有两种方式：
1. 在 DSH 面板内点击「检查更新」并「更新」（推荐）
2. 使用一键脚本更新：`UPDATE=1 curl -fsSL ... | bash`

**Q：如何卸载插件？**
A：使用一键卸载脚本：
```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.sh | bash

# Windows PowerShell
irm https://raw.githubusercontent.com/Francis-Xavier-code/dsh-balance-plugin/main/uninstall.ps1 | iex
```
