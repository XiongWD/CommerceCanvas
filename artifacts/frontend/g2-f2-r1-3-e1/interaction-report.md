# G2-F2 R1.3-E1 交互验证报告

> 独立 Playwright Chromium（非 IAB），108 自动测试（10 文件），8 项严格断言全部通过。

## 1. 卖点检查器切换修复

`handleSelectSellingPoint` 现在导航到 `{ viewMode: 'selling-points', inspectorTab: 'suite-insights' }`。

截图断言：
```
✓ currently on Recipe Tab
✓ inspector switched to suite-insights after SP click from Recipe Tab
✓ sp-comfort detail mode (got sp-comfort)
```

截图路径：`selling-point-from-recipe-tab.png`

## 2. 重置证据

restart 后立即断言（在重新运行事件到达前）：
```
✓ selectedClusterId empty (got "")
✓ selectedSellingPointId empty (got "")
✓ selectedRiskItemId empty (got "")
✓ selectedRecipeField empty (got "")
✓ classifiedAssetIds === 0 (got 0)
```

截图路径：`restarted-zero-results.png`

## 3. navigationCoverage Audit

```
risks: { total: 15, withTrace: 15, withEvidence: 5, missingIds: [] }
recipeFields: { total: 7, withTrace: 7, missingIds: [] }
clusters: { total: 4, withTrace: 4, withInsights: 4, missingIds: [] }
sellingPoints: { total: 6, withTrace: 6, withAssets: 6, missingIds: [] }
```

所有 missingIds 为空。

## 4. 真实组件测试（8 用例）

analysis-navigation.test.tsx：
- 点击 cluster-a 后显示详情和关联图片
- 返回全部聚类恢复总览
- selectedClusterId 设置后显示详情模式
- 点击 sp-comfort 后显示详情和全部关联图片
- 返回卖点顺序恢复全部节点
- 点击风险条目调用 onNavigateRisk
- restart 后 selectedClusterId 清空
- restart 后 selectedSellingPointId 清空

## 5. 提交绑定

- sourceCommit: A（源码+测试+audit 逻辑）
- evidencePayloadCommit: B（截图+audit+report）
- manifestBindingCommit: C（更新 manifest 记录 A 和 B）
