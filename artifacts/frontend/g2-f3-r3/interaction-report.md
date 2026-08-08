# G2-F3 R3 Closure 交互验证报告

生成时间：2026-08-08T11:35:50.353Z
浏览器：Playwright Chromium 143.0.7499.4

## E1 QC → Evidence exact
- focusedAsset === 'img-06'（exact）
- focusedLayer === 'subject'（exact）
- highlightedSeq > 0（exact，来自 QC sourceSequence）
- focusedRegion === ''（subject 层无 region，明确断言）

## E2 Browser Back persistence（真实 page.goBack）
- pathname: /jobs/ → 竞品分析（非 /jobs/）
- runId: 保持
- simulatorIdentity: 保持
- receivedCount: 不减
- jobId: 保持（非空）
- jobStatus: 非idle/空

## E3 Persistent Task Artifact Metrics
- artifactMetrics.total === 5（来自 state.artifactMetrics.total）
- artifactMetrics.final === 1
- Task 文案含「产物 5 · 最终 1」（单一口径）
