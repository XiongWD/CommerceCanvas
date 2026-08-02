# 前端未来契约备忘（G2-F0）

> 用途：记录 G2-F0 阶段发现、但**不在本任务实现**的未来接口与契约（任务书 §十）。
> 这些条目不得提前实现，仅作为后续 G2/G3 设计与后端 Schema 的输入。

## 1. 实时智能演算层契约（FD-031 / FD-032 / FD-033）

F0 当前为**静态完成态**，未实现 SSE。未来需要：

- SSE 事件信封（envelope）：`eventId / sequence / jobId / taskId / occurredAt / kind / code / titleZh / summaryZh / progress / evidenceIds / artifactIds / severity / visibility`
  （来自 `plans/frontend-prototype-plan.md` §5 的最小 TS 契约草案）
- 事件重放（replay）：基于 `last-event-id` / `sequence` + 当前快照，去重，断线不丢业务事件（FD-033）。
- 心跳与业务事件区分：心跳可瞬时，业务事件持久化（OD-103）。
- 客户界面只消费 `visibility: customer` 的中文语义事件；`admin / diagnostic` 不得直接复用同一展示模板（NG-022）。

**F0 占位**：底部持续任务栏显示静态"实时连接正常 / 视觉分析节点 3 个"，标注为占位。

## 2. 持续任务面板（FD-037 / OD-211）

F0 只展示完成态。未来需要：

- compact / expanded / full-detail 三态切换。
- 跨页面跟随：导航后任务仍在底部可见，并可展开到"任务详情"完整轨迹。
- 并发任务与"需要人工介入"高亮。
- 与 SSE 事件流的绑定（暂停 / 继续 / 加速 / 重置，见计划 F1）。

## 3. 证据可视化（OD-210 / FD-031）

F0 使用归一化坐标的静态证据框。未来需要：

- 证据区域与"分析轨迹"事件的双向定位（点击轨迹条目高亮画布证据，点击证据回滚到对应事件）。
- 证据不可用时的回退（fallback）UI：明确说明"该证据暂不可用"，不展示空框或伪数据。
- 多类型证据叠加：OCR 框、Logo 框、商品 Mask、差异图、关键区域匹配（mvp-prd §6.4）。

## 4. 竞品资料法律/策略（OD-009）

F0 使用内部测试数据。未来生产前需要：

- 竞品图片来源、授权、用户声明、泄露控制的法律与策略审查。
- 在 UI 标注竞品资料的合规状态。

## 5. L1 身份度量与阈值（OD-007）

F0 仅展示"待人工确认"。未来需要：

- 分类别的 L1 身份度量与阈值（ROC/错误分析，偏重误接受）。
- MVP 默认：强制人工复核，不做自动身份通过（开放决策临时默认）。

## 6. Provider / Model / Route（FD-014 / FD-015 / NG-006）

F0 不接任何 Provider。未来需要：

- 客户选择"快速 / 均衡 / 高质量 / 商品保真优先 / 文字准确优先"，内部映射到 Provider Binding（不暴露 Model ID）。
- 路由升级、重试、成本变化的中文原因说明（mvp-prd §15）。

## 7. 路由体系（计划 §7）

F0 单页。未来需要前端路由：

```
/queue
/products/:productId
/products/:productId/competitor-analysis/:runId
/products/:productId/generate/:runId
/products/:productId/localization/:sceneId
/reviews/:reviewId
/jobs/:jobId
```

路由仅为体验原型结构，不代表后端 API 已冻结。
