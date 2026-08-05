# G2-F2 R1 交互验证报告

> 独立 Playwright Chromium（非 IAB），周期检测 12/12 PASS。94 自动测试全过（8 文件）。

## 1. 页面投影状态结构

新建 `competitor-analysis-projection.ts`：从 LiveIntelligenceState + CompetitorAnalysisState 推导 `CompetitorAnalysisProjection`（visibleAssetIds / visibleClusterIds / visibleSellingPointIds / visibleInsightIds / visibleRiskItemIds / visibleRecipeFields / confidenceByEntityId / completedMilestones / isIdle / isTerminal / processedImages）。所有渐进结果只由已到达事件/里程碑/Recipe 推导，不直接渲染完整 mock。

## 2. 每个阶段可见结果清单

| 阶段 | 资产 | 聚类 | 卖点 | 洞察 | 风险 | Recipe |
|---|---|---|---|---|---|---|
| idle | 0（12 占位） | 0 | 0 | 0 | 0 | 0/7 |
| running(4/12) | 4 | 0 | 0 | 0 | 0 | 0/7 |
| running(12/12+构图) | 12 | 4 | 0 | 2 | 3 | 0/7 |
| completed | 12 | 4 | 6 | 7 | 15 | 7/7 |
| awaiting_review | 12 | 4 | 6 | 7 | 15 | 4/7 |

## 3. 四种模式如何渐进形成

- **单图证据**：未分析资产显示"等待分析"，不泄露结论
- **套图总览**：idle=0+12 占位；running=已处理；completed=全部
- **构图聚类**：构图里程碑前空状态；里程碑后逐个出现
- **卖点顺序**：summarize_selling_points 完成后出现；风险场景待校验节点黄色

## 4. 四项主要联动验证

- **聚类→图片集合+洞察+轨迹**：点击聚类设置 selectedClusterId → 中央显示该聚类图片 → 右侧切洞察 Tab
- **风险→Evidence+轨迹**：点击风险排除项 → 进入单图 → 选择关联图片
- **Recipe 依据→轨迹**：Recipe Tab 每字段显示 basisZh
- **Evidence 双向定位**：保留 F1 轨迹↔画布双向定位

## 5. Recipe 审核状态重置

每个字段提供明确按钮：接受 / 待调整 / 恢复 / 查看依据（不再点击循环三态）。审核状态按 `sessionKey + recipeField` 隔离。restart/switchScenario 后 sessionKey 变化 → useEffect 清空审核状态。

## 6. 风险数字口径

summaryMetrics.risks = 3（风险类别）。左侧栏显示"风险类别 3"而非证据命中数。

## 7. 响应式轨迹收起逻辑

1366px 及以下自动折叠 280px 轨迹为 28px 窄栏（显示"轨迹 N"），点击展开。1280/1366 下中央区域明显宽于 340px 检查器。

## 8. data-audit 真实生成方式

从 mock 数据结构程序化计算：assets.length=12、unique src=12、roles 分布、clusters=4、riskCategories=3。

## 9. 自动测试原始结果

build ✓ / lint ✓ / test 94 passed（8 文件，含投影层 14 测试 + 数据审计 25 测试）。

## 10. 截图和 WebM

12 张截图 + webm，周期检测 12/12 PASS。
