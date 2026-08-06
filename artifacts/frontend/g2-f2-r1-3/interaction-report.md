# G2-F2 R1.3 交互验证报告

> 独立 Playwright Chromium（非 IAB），周期检测 10/10 PASS。100 自动测试。
> 截图严格 === 断言全部通过。

## 1. 聚类详情模式实现

点击聚类卡片后：
- ClusterView 切换到详情模式（`data-selected-cluster-id`）
- 中央只显示该聚类全部关联图片（不是所有聚类）
- 展示聚类名称、置信度、构图特征、推荐槽位、可借鉴程度、风险提示
- 「返回全部聚类」按钮恢复
- 右侧检查器按 `selectedClusterId` 过滤洞察（assetIds 重叠匹配）

截图断言：`✓ cluster-a detail mode (got cluster-a)` / `✓ cluster detail shows assets (3)`

## 2. 卖点详情模式实现

点击卖点节点后：
- SellingPointSequenceView 切换到详情模式（`data-selected-selling-point-id`）
- 中央显示该卖点全部关联图片集合（不是所有节点）
- 展示卖点名称、构图依据、光线依据、可继承状态、Product Master 事实校验
- 右侧检查器显示该卖点专属详情（SellingPointDetail 组件）
- 「返回卖点顺序」按钮恢复

截图断言：`✓ sp-comfort detail mode (got sp-comfort)` / `✓ sp detail shows assets (2)`

## 3. 精确 4/12、2/4、3/6 断言

场景分类事件改为 4→8→12（不再 6+6）。

```
✓ running-exactly-4-of-12 (got 4)       ← === 4
✓ clusters-exactly-2-of-4 (got 2)       ← === 2
✓ selling-points-exactly-3-of-6 (got 3) ← === 3
```

## 4. 四项导航状态断言

```
✓ cluster-a detail mode (got cluster-a)    ← data-selected-cluster-id
✓ sp-comfort detail mode (got sp-comfort)   ← data-selected-selling-point-id
✓ risk-logo selected (got risk-logo)        ← data-selected-risk-item-id
✓ trace highlighted (seq=30)                ← data-highlighted-trace-sequence
✓ recipe purpose selected (got purpose)     ← data-selected-recipe-field
✓ recipe trace highlighted (seq=58)         ← data-highlighted-trace-sequence
```

## 5. 低置信严格证据

```
✓ 低置信 exists in current-image (1)   ← 精确查找「低置信」，未回退中置信
```

截图展示低置信标签 + 展开的中文依据。

## 6. 页面状态完整重置

- ContextSidebar `key={context-${sessionKey}}`：session 变化重挂载 → 重置素材筛选
- AnalysisTrace `key={trace-${sessionKey}}`：session 变化重挂载 → 重置轨迹筛选与滚动
- 聚类详情、卖点详情、风险/Recipe 导航状态在 sessionKey useEffect 中重置

## 7. 测试

100 用例（9 文件）全过。

## 8. 边界声明

未实现 F3/后端/真实 SSE。
