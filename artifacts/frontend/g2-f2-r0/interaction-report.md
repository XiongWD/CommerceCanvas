# G2-F2 R0 交互验证报告

> 截图与录像来自独立 Playwright Chromium（非 IAB），scripts/capture-g2-f2.mjs 驱动。
> 平移周期检测：11/11 PASS。80 自动测试全过（7 文件）。

## 1. F1 遗留项修复结果

- **§3.1 transport 保留原事件时间**：Runtime TransportSignal 保留 eventId/occurredAt；Reducer 不再生成 `new Date()`。测试验证同一 run 支持多次断线周期。
- **§3.2 Evidence Selector 提取**：findSequenceForEvidence 提取到 `state/evidence-selectors.ts`；组件与测试共用同一函数；删除测试中复制的算法。
- **§3.3 MilestoneReveal session 隔离**：组件按 `key={jobId#runId}` 挂载；shownMilestoneIds 按 sessionKey 隔离；restart 后重新挂载可重显。
- **§3.4 manifest 字段**：sourceCommit / sourceTreeHash / evidenceCommit 三字段。

## 2. F2 页面信息架构

Shell 保留（64px 图标栏 + 244px 上下文栏 + 中央 + 280px 轨迹 + 340px 检查器 + 底部任务栏）。

- 左侧：Product Master 摘要 + 套图统计 + 素材分组筛选 + 缩略图列表
- 中央：4 种查看模式（单图证据 / 套图总览 / 构图聚类 / 卖点顺序）
- 右侧：4 Tab（当前图片 / 套图洞察 / Creative Recipe / 风险排除）
- 轨迹：6 类筛选（全部/发现/证据/风险/成果/系统）

## 3. 四种中央查看模式

| 模式 | 截图 | 内容 |
|---|---|---|
| 单图证据 | single-image-running.png | 复用大图+Evidence Overlay，含用途/聚类/置信度 |
| 套图总览 | contact-sheet.png | 12 张网格，用途标签/风险数/聚类标记/活跃状态 |
| 构图聚类 | composition-clusters.png | 4 聚类卡片，代表图/特征/可借鉴程度/风险 |
| 卖点顺序 | selling-point-sequence.png | 纵向轨道 6 节点，关联图片/构图/光线/继承性 |

## 4. 12 张素材与用途清单

12 张独立 SVG，1:1 映射（无裁切复用）。详见 `docs/frontend/demo-assets.md`。
分布：主图1 / 场景图4 / 卖点图5 / 细节图1 / 参数图1。

## 5. 构图聚类定义

- A：右侧主体 / 左侧文案（4 张，高置信可借鉴）
- B：中心对称 / 环境使用（3 张，中置信）
- C：局部特写 / 材质强调（3 张，高置信）
- D：人物佩戴 / 生活方式（2 张，中置信）

## 6. 卖点顺序定义

舒适性 → 稳定佩戴 → 声音体验 → 续航 → 防水 → 参数与兼容性。
每个节点关联图片 + 构图 + 光线 + 继承性 + 事实校验需求。

## 7. Recipe 草案字段

7 字段（用途/画布/位置/占比/背景/光线/安全区）+ 适用平台 + 推荐槽位 + 来源依据 + 置信度。
支持接受/待调整/恢复建议值（本地 UI 状态）。明确标注「尚未进入正式生成」。

## 8. 风险排除分类

- 禁止继承：竞品 Logo / 型号 / 包装文字 / 入耳式结构 / 竞品独有功能（5 项）
- 待事实校验：续航时长 / 防水等级 / 材料参数 / 兼容性 / 尺寸数据（5 项）
- 可安全借鉴：构图方向 / 光线结构 / 背景气氛 / 页面节奏 / 文案安全区（5 项）

## 9. 置信度依据

4 级（高/中/低/待确认），每个 ConfidenceInfo 携带 basisZh（如"该构图在 5 张图片中重复出现"）。点击展开中文依据。

## 10. Live Intelligence 如何驱动渐进页面

复用 F1 单一事件状态。idle 时套图总览只显示已处理图片；执行中 Evidence/聚类/Recipe/风险/置信度逐步形成。无静态写死终态。

## 11. 共享 Selector 与状态边界

- findSequenceForEvidence / findTraceBySequence：evidence-selectors.ts（组件与测试共用）
- selectRecipeCompleteness / selectStageProgress：live-intelligence-selectors.ts
- 页面级状态：viewMode / selectedAssetId / selectedClusterId / inspectorTab（App.tsx useState）

## 12. 测试原始结果

```
build: ✓ exit 0
lint: exit 0 (0 problems)
test: Test Files 7 passed | Tests 80 passed
```

## 13. 截图与录像

11 张截图 + 1 段 webm（独立 Playwright Chromium，周期检测 11/11 PASS）。
详见 `artifacts/frontend/g2-f2-r0/screenshot-manifest.json`。

## 14. 数据对账

data-audit.json：12 assets / 12 unique src / 4 clusters / 7 brand assets / 3 risks / recipe normal 7-7 risk 4-7。
