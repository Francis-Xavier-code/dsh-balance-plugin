# 贡献指南

感谢你对 dsh-balance-plugin 的关注！

## 提交 Issue

**请先确认：**

1. 搜索现有 Issues，避免重复
2. 阅读 [README 文档](../README.md)，确认不是已知问题
3. 使用最新版本（旧版本的问题可能已修复）

**Issue 类型：**

| 类型 | 说明 |
|------|------|
| Bug Report | 插件运行异常、功能不正常 |
| Feature Request | 新功能建议、改进提案 |

**不要提交：**

- 使用问题（请到 [Discussions](https://github.com/Francis-Xavier-code/dsh-balance-plugin/discussions) 提问）
- 只贴截图不写描述的 Issue（会直接关闭）
- 与本项目无关的内容

## 提交 PR

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feat/my-feature`
3. 提交你的改动：`git commit -m 'feat: add some feature'`
4. 推送到分支：`git push origin feat/my-feature`
5. 创建一个 Pull Request

**Commit 规范：**

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `perf:` 性能优化
- `refactor:` 重构
- `docs:` 文档更新
- `chore:` 构建/工具变更

**代码风格：**

- 使用 ES Modules (`import/export`)
- 保持与现有代码一致的风格
- 不要引入新的依赖（除非必要且讨论过）
