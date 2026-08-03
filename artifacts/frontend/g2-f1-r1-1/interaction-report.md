# G2-F1 R1.1 收尾交互验证报告

> 截图来自独立 Playwright Chromium（非 IAB），scripts/capture-g2-f1-r1-1.mjs 驱动。
> 平移周期检测：5/5 PASS。

## 1. transport 进入客户分析轨迹（P0-1 修复）

修复：传输事件（disconnected/reconnecting/recovered）用独立 transport action 处理，同时：
- 更新 connection / recoveryInfo（顶部与底部状态）
- 向 trace 追加一条「系统」记录（客户可见）
- 按 eventId 去重
- 不修改业务 ledger.lastContiguousSequence

截图证据：
- disconnected-trace.png：分析轨迹出现「实时事件连接中断，已保留当前结果」（系统类）
- recovered-trace.png：分析轨迹出现「已从第 18 个事件后恢复 · 补齐 4 个事件」（系统类）

自动测试（live-intelligence-r1-1.test.ts）：
- 3 条系统轨迹，顺序正确（中断→重连→恢复）
- recovered 文案包含「补齐 4 个事件」
- 重复 transport event 不重复（eventId 去重）
- transport 不影响业务 lastContiguousSequence

## 2. Evidence 画布→轨迹回退定位（P0-2 修复）

修复：findSequenceForRegion（只按 regionId）改为 findSequenceForEvidence，三级回退：
1. regionId 精确匹配
2. assetId + layer 匹配
3. assetId 匹配
4. 找不到返回 undefined（不崩溃）

点击画布 Evidence 时传入 region.id + asset.id + region.kind。

截图证据：evidence-fallback-focus.png（点击 Logo 风险轨迹精确定位画布）

自动测试（evidence-fallback.test.ts）：
- 有 regionId 的 Logo 框 → regionId 精确匹配（seq=1）
- 无 regionId 的主体框 → assetId+layer 回退（seq=2）
- 无 regionId 的安全区 → assetId+layer 回退（seq=3）
- 仅 assetId → 最宽回退
- 找不到 → undefined（不崩溃）

## 3. restart 的 runId/session 机制（P1-1 修复）

修复：归并状态增加 runId（初始 1，reset/restart/switchScenario 递增）。MilestoneReveal 以 `jobId#runId` 作为展示会话键；同一 run 内重放不重复弹，新 run 可重新展示相同里程碑。不再依赖组件偶然观察到 jobStatus===idle。

截图证据：restarted-milestone.png（normal 完成后 restart，里程碑重新展示）

自动测试：
- reset 后 runId 递增
- restart 后 trace/ledger/milestones 清空，再 dispatch 同场景事件正常进入（不被旧 ledger 去重）
- shownMilestoneIds 按 jobId#runId 分组，新 run 不继承旧记录

## 4. finished 控制按钮行为（P1-2 修复）

修复：finished 状态只显示「重新运行」（DemoControls 与 PersistentTaskBar 同步）；点击重新运行触发 reset（清空 ledger/trace/runId 递增），避免旧 start 按钮被 ledger 去重静默失效。

截图证据：completed-controls.png（完成态只显示重新运行，无「开始」按钮）

自动测试：restart 后 receivedCount 从 0 重新开始、trace 清空、ledger 清空、第一个事件正常进入。

## 5. blockingConflicts 从 state 对账（审计修复）

修复：summaryMetrics 增加 blockingConflicts 字段，由带 blockingConflicts 的事件归并；event-audit.json 从 final state 读取（不再硬编码）。

- normal blockingConflicts = 0
- risk blockingConflicts = 1

## 6. 截图 manifest 绑定最终提交

manifest 记录 commit + sourceTreeHash（git rev-parse HEAD:），不再只记录旧基线。

## 7. 测试汇总

55 用例（6 文件）全过：reducer（24）+ runtime（7）+ AnalysisTrace（7）+ r1-1（11）+ evidence-fallback（6）+ gen-event-audit（1 含契约）。
