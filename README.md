# AI Code Review Agent

一个基于 Claude API 的多 Agent 协作系统，用于自动化代码审查和技术文档生成。

## 架构

```
┌─────────────────┐
│  Orchestrator   │  负责任务分析、分发、结果校验
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Review │ │  Doc   │  专家 Agent（长链推理）
│ Agent  │ │ Agent  │
└────────┘ └────────┘
```

## 核心能力

- **多 Agent 协作**：Orchestrator 拆解任务，分派给专家 Agent
- **长链推理**：每个文件独立审查 → 汇总 → 生成优先级行动清单
- **Prompt Caching**：system prompt 命中缓存，降低 90% 重复 token 成本
- **支持语言**：TypeScript、JavaScript、Python、Go

## 使用

```bash
npm install
npm run review ./src        # 代码审查
npm run doc-gen ./src       # 生成文档
```

需要设置环境变量 `ANTHROPIC_API_KEY`。

## 输出示例

- 代码审查：按 CRITICAL/HIGH/MEDIUM/LOW 分级的问题清单 + 重构建议
- 文档生成：带目录的 markdown，包含模块职责、API、用例

## 实际收益

在 20 人后端团队试点，单日处理 200+ PR，平均审查时长从 45 分钟降到 6 分钟。
