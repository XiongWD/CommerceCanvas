# G2-F3 R2 交互验证报告

生成时间：2026-08-08T10:58:29.993Z
浏览器：Playwright Chromium 143.0.7499.4（独立，非 IAB）

## Evidence 清单（每项截图前有强断言）

- **E1 Artifact Lineage**：5 个 Artifact producer 真实（classify_purpose/segment_subject/extract_composition/detect_text_logo/build_recipe），非全部 build_recipe
- **E2 Artifact Metrics**：产物 5（中间 4 · 最终 1）单一口径，Overview/Artifact 区/Audit 同源
- **E3 Cost Audit**：预估 $0.21，实际 $0.19，对账通过（actual === estimated + Σdelta，非恒真）
- **E4 Node Source Audit**：7/7 节点有源事件，attemptCount 来自真实 sourceEventIds
- **E5 Cross-route Persistence**：receivedCount 跨路由增长（before < after），simulator identity 不变
- **E6 Browser Back**：history.back() 后返回竞品分析，runId/identity 保持
- **E7 QC → Evidence**：点击 QC → 返回竞品分析 → highlightedTraceSequence 非空（指向 QC 来源事件）

## 关键断言（RED→GREEN）
- producer 真实：art-purpose ← classify_purpose（R1 全部 build_recipe 错误）
- linked 不覆盖 producer（P0-1 核心）
- cost balanced 非恒真（P0-3：actual === estimated + Σdelta）
- source events 真实累计（P0-4：withSourceEvents 由 sourceEventIds 派生）
- receivedCount 跨路由增长 + identity 不变（P1-1/P1-2）

## negative tests（自动测试输出，非截图）
- cost mismatch: 21 + 15 != 35 → balanced = false
- stage missing source event: missingIds 包含无源 stage
