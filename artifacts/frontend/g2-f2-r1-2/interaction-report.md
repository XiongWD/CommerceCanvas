# G2-F2 R1.2 交互验证报告

> 独立 Playwright Chromium（非 IAB），周期检测 13/13 PASS。99 自动测试。
> 截图严格状态断言全部通过。

## 1. 统一导航控制器

新建 `analysis-navigation.ts` + `use-analysis-navigation.ts`。所有跨区域跳转通过 `navigate(target)` 统一入口。导航能同时设置：viewMode / assetId / clusterId / sellingPointId / riskItemId / recipeField / inspectorTab / evidence / traceSequence。

App.tsx 中实现了 4 个具体导航函数：
- `handleNavigateRisk(riskItemId)` — 从 entityEvidence 解析 Evidence lookup → navigate
- `handleNavigateRecipe(field)` — 从 entityEvidence 解析 → navigate
- `handleSelectCluster(clusterId)` — 设置 cluster + insight tab + trace
- `handleSelectSellingPoint(spId)` — 设置 selling point + trace

## 2. 风险→Evidence→轨迹

RiskExclusionTab 点击 → `onNavigateRisk(riskItemId)` → App 读取 `projection.entityEvidence[riskItemId]` → resolveEvidenceFromEntity（优先 regionId，回退 assetId+layer）→ navigate({ viewMode:'single', assetId, evidence, traceSequence, riskItemId, inspectorTab:'risk-exclusion' })。

截图断言：`✓ 风险点击后切到单图模式`。

## 3. Recipe→来源事件

每个已形成 Recipe 字段有「查看依据」按钮 → `onNavigateRecipe(field)` → 读取 entityEvidence[field] → navigate({ recipeField, traceSequence, evidence, inspectorTab:'recipe' })。

截图断言：`✓ Recipe 查看依据按钮存在`。

## 4. 聚类完整联动

点击聚类卡片 → navigate({ clusterId, viewMode:'clusters', inspectorTab:'suite-insights', traceSequence })。聚类内缩略图可点击 → onSelectAsset → 单图模式。

截图断言：`✓ 聚类卡片存在`。

## 5. 卖点完整联动

点击卖点节点主体 → onSelectSellingPoint(spId) → navigate({ sellingPointId, traceSequence })。节点高亮选中态。关联图片缩略图可点击 → 单图。

截图断言：`✓ 卖点节点存在`。

## 6. risk 场景 resultRefs

scenario-risk.ts 补齐全部 resultRefs（classifiedAssetIds/clusterIds/sellingPointIds/insightIds/riskItemIds/recipeFields），ID 与 mock 对齐。终态投影：visibleAssetIds=12, visibleClusterIds=4, visibleSellingPointIds=6, riskItemIds>0, Recipe=4/7, build_recipe=awaiting_review。

## 7. 页面状态完整重置

sessionKey 变化时重置：selectedClusterId / selectedSellingPointId / selectedRiskItemId / selectedRecipeField / inspectorTab / viewMode / selectedAssetId。

## 8. data-audit 真实生成

共享 `generateCompetitorDataAudit()` 函数 → `scripts/generate-g2-f2-audit.mjs` → vitest 测试调用 → 写 data-audit.json。missingEntityIds=0（exit 0）。

## 9. 截图严格断言

```
✓ idle 0 已分类 (got 0)
✓ 聚类出现 (got 2)          ← 渐进 2/4
✓ 卖点出现 (got 3)          ← 渐进 3/6
✓ 风险条目存在              ← requireElement 非 if count>0
✓ 风险点击后切到单图模式
✓ Recipe 查看依据按钮存在   ← requireElement
✓ 聚类卡片存在              ← requireElement
✓ 卖点节点存在              ← requireElement
✓ 置信度徽章存在            ← requireElement
```

## 10. 三阶段证据提交

A. sourceCommit（源码+测试）
B. evidencePayloadCommit（截图+录像+audit）
C. manifestBindingCommit（更新 manifest 记录 A 和 B）

## 11. 边界声明

未实现 F3/后端/真实 SSE。resultRefs 是确定性 Event Simulator 的前端事件属性。
