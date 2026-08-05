# G2-F2 R1.1 交互验证报告

> 独立 Playwright Chromium（非 IAB），周期检测 13/13 PASS。99 自动测试全过。
> 截图脚本状态断言全部通过（idle=0 / running=6 / clusters=2 / sellingPoints=3 / 风险定位）。

## 1. 事件结果 ID 映射方案

新建 `CompetitorResultRefs` 类型：每个产生业务结果的事件通过 `resultRefs` 明确声明它形成了哪些结果（classifiedAssetIds / clusterIds / sellingPointIds / insightIds / riskItemIds / recipeFields）。

Reducer 在 `applyOneImmutable` 中将 `event.resultRefs` 累积到 `state.resultRefsAccumulated`（Set-based merge）。同时为每个实体构建 `entityEvidence`（sourceEventIds / traceSequences / evidenceRefs）。

投影层从 `live.resultRefsAccumulated` 推导可见实体，不再依赖 warningCount / 里程碑存在 / 阶段完成。

## 2. 每种实体的 sourceEvent/evidence 覆盖率

| 实体类别 | 事件驱动 | 示例 |
|---|---|---|
| classifiedAssetIds | classify_purpose 阶段 2 事件 | img-01..06 → img-07..12 |
| clusterIds | extract_composition 阶段 2 事件 | cluster-a/b → cluster-c/d |
| sellingPointIds | summarize_selling_points 阶段 2 事件 | sp-comfort/stability/sound → sp-battery/waterproof/spec |
| insightIds | extract + summarize 阶段事件 | ins-usage/cluster → ins-light/color → ins-rhythm/material/safe-zone |
| riskItemIds | detect_text_logo 3 warning + risk_list_built 里程碑 | risk-logo/model/packaging/inear/exclusive-feature + fact-*/safe-* |
| recipeFields | build_recipe 阶段事件 | purpose/canvas/position → ratio/background/lighting → textSafetyZone |

所有 resultRefs ID 与 mock 数据中的实体 ID 完全对齐（sp-comfort, ins-usage, risk-logo, cluster-a 等）。

## 3. 四项联动真实状态断言

- **风险→Evidence**：点击风险条目 → 单图模式 → 关联图片 ✓（断言 analysis-canvas 存在）
- **Recipe→依据**：Recipe Tab 每字段显示 basisZh + 接受/待调整/恢复按钮
- **聚类→图片**：点击聚类卡片缩略图 → onSelectAsset 进入单图
- **卖点→图片**：点击卖点节点主体 → onSelectAsset 展示关联图片

## 4. idle 泄露修复

AssetThumbnailList 接收 `classifiedAssetIds` Set：未分类资产只显示文件名 + "等待分析"，不显示用途标签、分析状态、风险红点。idle 时所有 12 张资产均未分类。

## 5. 页面状态重置验证

sessionKey（jobId#runId）变化时 App useEffect 重置：selectedClusterId / inspectorTab / viewMode / selectedAssetId。Recipe 审核状态按 sessionKey+recipeField 隔离。

## 6. data-audit 生成方式

共享纯函数 `generateCompetitorDataAudit(analysisData, normalState, riskState)` 程序化计算。capture 脚本与 Vitest 调用同一函数。

## 7. 源码提交与证据提交

两阶段提交：提交 A（源码）→ 截图 → 提交 B（证据）。manifest sourceCommit=提交 A, evidenceCommit=提交 B。

## 8. 截图状态断言

```
✓ idle 无已分类资产 (got 0)
✓ running 部分资产可见 (got 6)
✓ 聚类出现 (got 2)  ← 渐进，非全部 4
✓ 卖点出现 (got 3)  ← 渐进，非全部 6
✓ 风险点击后切到单图模式
```

## 9. 测试

99 用例（8 文件）：投影层 19 测试 + 数据审计 + Evidence selector + reducer + runtime + AnalysisTrace + F2 audit + gen-event-audit。

## 10. 边界声明

未实现 F3 / 后端 / 真实 SSE。resultRefs 是确定性 Event Simulator 的前端事件属性，非真实后端字段。
