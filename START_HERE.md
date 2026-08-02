# CommerceCanvas Dev Agent Start Here

> 用途：指导开发 Agent 正确消费 G0 冻结包，并启动 G2 前端体验原型。  
> 版本：0.1.0  
> 日期：2026-08-02  
> 客户界面语言：简体中文（zh-CN）

## 1. 这套文档是什么

`docs/` 下 14 份 Markdown 是 CommerceCanvas 的产品、范围、验证、架构和治理基线。它们可以作为开发 Agent 的长期知识库和每个任务的约束来源，但不是可直接逐条编码的完整技术规格。

它们解决：

- 产品为什么存在；
- MVP 做什么、不做什么；
- 哪些结论已冻结；
- 哪些能力必须先验证；
- 架构和部署边界；
- QC、模型路由和验收原则；
- 实时智能演算层与中文客户交互要求。

它们尚未完整解决：

- 页面路由与组件树；
- 设计 Token 的最终数值；
- 页面级状态模型；
- 前端 DTO 与 TypeScript 类型；
- SSE 事件 Schema 的字段级契约；
- Mock 场景和演示素材；
- 组件级验收用例；
- 与真实后端的 API 契约。

因此，G2 的第一步是把冻结基线翻译成前端体验规格和可点击原型，而不是直接补齐后端。

## 2. 文档优先级

发生冲突时按以下顺序处理：

1. `docs/governance/frozen-decisions.md`
2. `docs/product/scope-matrix.md`
3. `docs/product/non-goals.md`
4. `docs/product/mvp-prd.md`
5. `docs/governance/open-decisions.md`
6. `docs/architecture/*.md`
7. `docs/validation/*.md`
8. `docs/product/glossary.md`

`open-decisions.md` 中的问题不得由开发 Agent 通过实现方式偷偷关闭。遇到开放决策时，只能：

- 使用文档中已有的临时默认值；或
- 在计划中显式标记阻塞点；或
- 暂停该分支，继续不依赖该决策的工作。

## 3. 每个任务开始前的强制输出

开发 Agent 在修改代码前，必须先输出：

```text
适用冻结决策：FD-xxx, FD-xxx
适用范围：FROZEN / VALIDATION_REQUIRED / NON_BLOCKING_EXPERIMENT
明确非目标：NG-xxx
涉及开放决策：OD-xxx 或“无”
本任务验收条件：...
本任务不修改：...
```

缺少上述内容，不得开始编码。

## 4. G2 前端原型的性质

当前允许开发的是“前端体验原型”，不是生产前端。

允许：

- React + TypeScript + Vite；
- 本地 Mock API；
- 确定性的事件模拟器；
- 模拟 SSE 断线、重连和事件重放；
- 使用真实结构的演示数据；
- 高保真页面、状态和动效；
- 组件和页面截图验收。

禁止：

- 接真实图片或视频 Provider；
- 编写正式 FastAPI 业务接口；
- 建 PostgreSQL 业务表；
- 实现真实 Job Queue；
- 把 Mock 百分比伪装成真实可计算进度；
- 把英文 Worker 日志直接显示给客户；
- 为了“黑客感”伪造代码、推理过程或不存在的执行节点；
- 同时铺开所有页面和全部功能。

所有演示任务必须标记为“演示数据”，但界面行为和数据结构应尽可能接近未来真实契约。

## 5. 客户可见语言规则

所有客户可见内容使用简体中文，包括：

- 导航、按钮、标题；
- 状态、错误、警告、空状态；
- 分析轨迹；
- SSE 中间结果；
- 里程碑提示；
- QC 结论；
- 路由升级和成本变化说明。

允许保留英文的内容仅限稳定技术标识，例如：

- SKU；
- Trace ID；
- Provider ID；
- Model ID；
- 事件码；
- 文件哈希。

技术标识出现时必须有中文语义说明。普通客户界面不得出现原始堆栈、原始 Worker stdout 或英文诊断日志。

## 6. G2 第一开发目标

第一目标不是“把所有页面画出来”，而是完成一个可演示的高质量纵向体验：

```text
进入竞品套图分析
→ 导入 12 张演示图片
→ 实时看到分析节点和证据逐步出现
→ Creative Recipe 草案逐步形成
→ 看到风险、排除项和中间产物
→ 跨页面后任务仍在底部持续显示
→ 进入任务详情查看完整轨迹和证据
```

该流程优先证明：

- Graphite Canvas 视觉语言；
- Live Intelligence Layer；
- 中文高信息密度交互；
- 真实、克制的“高级感和黑客感”；
- 跨页面任务连续性；
- 中间结果和证据可检查。

详细计划见 `plans/frontend-prototype-plan.md`。

## 7. 建议上下文加载方式

不要在每个小任务中重复注入全部 14 份文档。建议：

- 会话初始化：加载本文件、`frozen-decisions.md`、`scope-matrix.md`、`non-goals.md`；
- 页面设计任务：追加 `mvp-prd.md`、`glossary.md`、`capability-map.md`；
- 实时交互任务：追加 `deployment-boundaries.md`、`acceptance-metrics.md`、`risk-register.md`；
- QC 页面任务：追加 `qc-policy-draft.md`；
- 模型路由页面任务：追加 `model-routing-draft.md`；
- G1 演示与验证任务：追加 `sample-set-plan.md`、`experiment-matrix.md`。

## 8. 完成定义

Agent 不得用“页面已完成”代替证据。每个里程碑至少提交：

- 代码变更清单；
- 可运行命令；
- 页面截图或录屏；
- 状态覆盖矩阵；
- 与冻结决策的映射；
- 未完成项和已知缺陷；
- 自动化测试结果；
- 不得声称完成但未亲自运行的命令。
