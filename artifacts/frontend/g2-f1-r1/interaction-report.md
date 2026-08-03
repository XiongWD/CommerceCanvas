# G2-F1 R1 交互验证报告

> 截图与录像来自独立 Playwright Chromium（非 ZCode IAB），scripts/capture-g2-f1-r1.mjs 驱动。
> 平移周期检测：8/8 PASS（最低 MAE 10–14，远高于 0.5 阈值）。
> event-audit.json 由 gen-event-audit.test.ts 程序化生成（非手写）。

## 1. 双重执行根因与修复（P0-5）

根因：R0 的 EventSimulator.switchScenario() 内部调用 start()，与 UI「开始演示分析」按钮的 start() 语义冲突；同时 scheduleNext 用 setInterval 在 setSpeed/pause 时未清理旧 timer，导致多个 timer 叠加。截图显示 normal 116 事件（应为 58）、risk 108（应为 54）。

修复：
- switchScenario 改为只 load + reset，不自动 start（R1 runtime.ts）。
- 单一 timer：start 先 stopTimer 再用 setTimeout 递推（替代 setInterval），任一时刻最多一个 pending timer。
- pause/resume/restart/setSpeed 全部先 stopTimer。

验证（runtime.test.ts，fake timers）：
- load+start normal：分发 60 次（= 场景事件数）
- load+start risk：分发 55 次
- switchScenario：事件数 0（不自动开始）
- setSpeed：不产生第二个 timer
- pause+resume：不重复当前事件
- restart：完整场景只运行一次
- dispose：不再分发

event-audit.json normal.dispatchedEvents = scenarioEvents = 60（不再 116）。

## 2. Reducer 去重修复（P0-1）

根因：R0 liveReducer 的 AppliedIndex 是默认参数，React 每次 reducer 调用新建空 Set，去重失效。

修复：去重索引（EventLedger：seenEventIds / pendingBySequence / lastContiguousSequence）属于归并状态本身（state.ledger）。liveReducer 是无状态纯函数，useReducer 与 applyEvents 测试走完全相同路径。

验证（reducer.test.ts）：
- 完整场景重复 dispatch 两次，计数不翻倍（60 = 60）
- 重复 eventId 不进入 trace

## 3. 乱序缓冲（P0-2）

修复：实现有序缓冲。1→3→2 时，3 暂存；2 到达后先应用 2 再 flush 3，lastContiguousSequence 无缺口。

验证：
- 1,3,2：trace 顺序 [一,二,三]，lastContiguous=3，pending 空
- 1,4,3,2：lastContiguous=4
- 已完成阶段后迟到 stage.started 不回退（validate_images 仍 completed）
- 大于当前序号但有缺口的事件不提前污染 UI（sequence 5 在 1 后到达时暂存）

## 4. Reducer 不可变（P0-3）

修复：每次阶段变更新建 stages 对象与 StageState；trace/artifacts/risks/ledger 均用 concat/slice/扩展新建。

验证：
- 应用事件后 previousState !== nextState
- 阶段变更后 previousState.stages !== nextState.stages，目标 stage 不同
- previousState 内容保持原值（不被污染）

## 5. 断线恢复（P0-4）

修复：reconnect 场景改为 Last-Event-ID 语义。前 18 个正常业务事件 → transport disconnected/reconnecting/recovered（独立 action，不占业务 sequence）→ 重放 sequence 19–22（保留原 eventId/sequence，replayed=true）→ 23 起正常实时（replayed=false）。所有业务事件 jobId=job-reconnect-003。

验证：
- replayedSequences = [19,20,21,22]（exactly 4，非 40）
- recoveredCount = 4，fromSequence = 18
- 23+ 事件 replayed=false
- jobId 全部一致
- Artifact 不重复（duplicateArtifacts=0），里程碑不重复（duplicateMilestones=0）
- 截图 recovered-4-events.png 显示「补齐 4 个事件」

## 6. 业务指标对账（P1-1/2/3）

修复：建立权威 summaryMetrics（findings/risks/artifacts），由明确事件更新；AmbientStatus/PersistentTaskBar/ExpandedTaskPanel 全部读同一字段；与 artifacts.length/risks.length 对账。

验证（event-audit.json）：
- normal：findings=24, risks=3, artifacts=1（页面三处一致）
- normal 实际产生 3 条可区分风险（Logo/高密度文案/参数声明），非 1 条
- normal 里程碑文案「3 项普通风险 · 0 项结构冲突」（不再写「2 项结构冲突」）
- risk：findings=24, risks=3, blockingConflicts=1

## 7. Recipe 字段对账（P1-4）

修复：recipeFields 数组逐字段标记。

验证：
- normal：7/7（100%），7 字段全 true
- risk：4/7（purpose/canvas/position/ratio），部分完成

## 8. 阶段待审核状态（P1-5）

修复：新增 stage.awaiting_review 事件类型；risk 场景 build_recipe 发出该事件。

验证：risk.buildRecipeStatus = awaiting_review（非 active）。

## 9. 客户轨迹收敛（§十）

修复：事件 surface 分层（ambient/trace/both）。stage.queued/started/progress/completed 默认 ambient（只更新顶部状态与阶段轨道）；业务发现/判断/证据/风险/动作/成果/断线恢复进 trace。

验证：normal customerTraceItems = 22（非 60）；轨迹不含「阶段排队/开始/进度/完成」。

## 10. 里程碑跨场景重置（§十一）

修复：shownMilestoneIds 按 jobId 分组；reset 切换 jobId 后新 jobId 不继承旧展示记录。

验证：reset 到不同 jobId 后 shownMilestoneIds[jobId] 为空；相同 milestone 可在新场景重新演示。

## 11. Evidence 双向定位（§十二）

- 轨迹→画布：点击「点击定位证据」→ onFocusEvidence(source='trace')（AnalysisTrace.test 验证）
- 画布→轨迹：onRegionClick → findSequenceForRegion 反查（测试验证 regionId 匹配、assetId+layer 回退、无匹配不崩溃）

## 12. 截图与录像

8 张截图（1440×900，周期检测 8/8 PASS）：idle / running / evidence-focus / task-panel-expanded / risk-review / disconnected / recovered-4-events / completed。

live-intelligence-demo.webm：真实浏览器录制，2× 速度，展示 normal 全流程 + risk + reconnect 断线恢复（补齐 4 事件）。无后期剪辑。

## 13. 测试原始汇总

- Test Files: 4 passed（reducer 24 + runtime 7 + AnalysisTrace 7 + gen-event-audit 1）
- Tests: 39 passed
- Coverage: reducer 91%，runtime 71%
