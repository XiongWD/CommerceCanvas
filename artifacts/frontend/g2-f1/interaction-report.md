# G2-F1 交互验证报告

> 截图与录像来自独立 Playwright Chromium（非 ZCode IAB），scripts/capture-g2-f1.mjs 自动驱动。
> 平移周期检测：8/8 PASS（见 periodicity 检测输出，最低 MAE 3.4–14，远高于 0.5 阈值）。

## 1. 截图状态区分验证（亮度特征）

8 张截图捕获了不同运行状态（非同一画面）：

| 截图 | 平均亮度 | 绿色像素(完成) | 黄色像素(风险/中断) | 状态判定 |
|---|---|---|---|---|
| idle-1440x900 | 25.2 | 86 | 9 | 初始空闲 |
| running-analysis | 26.8 | 118 | 10 | 分析进行中 |
| evidence-focus | 26.6 | 111 | 10 | Evidence 高亮定位 |
| task-panel-expanded | 28.3 | 115 | 10 | 任务面板展开（内容最多） |
| risk-review | 27.2 | 129 | 18 | 风险场景（风险+完成混合） |
| disconnected | 25.7 | 100 | **30** | 断线（黄色中断态最强） |
| recovered | 25.7 | **133** | 10 | 恢复（绿色恢复态最强） |
| completed | 26.6 | 111 | 10 | 正常完成 |

## 2. Evidence 双向定位验证

- **轨迹 → 画布**：capture 脚本点击第一条「点击定位证据」轨迹条目（evidence-focus.png），
  中央画布切换到对应资产并高亮 Evidence 区域，其他区域降低视觉权重（opacity 0.25）。
- **画布 → 轨迹**：EvidenceOverlay 区域可点击（onRegionClick），触发 focusEvidence(source='canvas')，
  通过 findSequenceForRegion 反查 liveState.trace，高亮对应轨迹条目（highlightedSequence）。
- 自动测试覆盖：`AnalysisTrace.test.tsx` 验证点击携带 evidenceRefs 的条目触发 onFocusEvidence 一次。

## 3. 三态任务面板验证

- **紧凑态**：默认，显示任务名/阶段/进度/发现/风险/产物/用时/连接/开始-暂停按钮。
- **展开态**：点击「任务详情」向上弹出 ExpandedTaskPanel（不遮挡中央商品区），
  含 7 阶段轨道（StageRail）+ 进度/时间/连接 + 最近 3 条关键事件 + 人工介入提示（task-panel-expanded.png）。
- **任务详情**：本轮使用同页抽屉（ExpandedTaskPanel 即详情视图），未建正式路由。

## 4. 断线恢复验证（场景 C）

- disconnected.png：底部任务栏显示「实时事件已中断 · 保留当前结果」，黄色态。
- recovered.png：显示「已从第 18 个事件后恢复 · 补齐 N 个事件」，绿色态。
- 自动测试覆盖：
  - 重放事件标记 replayed=true（>0 条）。
  - 全部应用后 Artifact 不重复（Recipe 草案仅 1 个）。
  - 4 个里程碑各只记录一次（Set 去重）。
  - 前 18 事件已到达，断线期间已完成阶段结果保留。

## 5. 演示控制验证

- 开始/暂停/继续/重新运行：DemoControls 提供。
- 0.5×/1×/2× 速度：capture 脚本以 2× 运行全部三场景。
- 三场景切换：normal/risk/reconnect 按钮切换并重置状态。
- 确定性：自动测试验证 normal/risk 两次 build 序列完全一致。

## 6. 进度真实性验证

- determinate：阶段进度携带真实分母（7 阶段、12 张图片），显示百分比。
- indeterminate：第三方模型类阶段（如 extract_composition 心跳）只显示「阶段进行中 · 不确定进度」+ 已用时，不伪造百分比。
- 自动测试覆盖：idle 为 indeterminate；running 中有阶段完成时为 determinate(total=7)。

## 7. 录像（live-intelligence-demo.webm）

- 真实浏览器录制（Playwright Chromium headless），1440×900。
- 内容：normal 场景 2× 运行 → 轨迹流入 → Evidence 出现 → 点击定位 → 任务栏展开 →
  切换 risk 场景 → 风险发现 → 切换 reconnect 场景 → 断线 → 恢复。
- 无后期剪辑，状态来自确定性事件流。

## 8. 平移周期检测

```
8/8 PASS（idle/running/evidence/task-panel/risk/disconnected/recovered/completed）
最低横向 MAE 12.55，最低纵向 MAE 12.52（均远高于 0.5 FAIL 阈值）
```
