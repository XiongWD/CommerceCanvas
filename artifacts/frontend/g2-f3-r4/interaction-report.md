# G2-F3 R4 Evidence Closure 交互验证报告

生成时间：2026-08-08T11:59:23.295Z
浏览器：Playwright Chromium 143.0.7499.4

## E1 QC → Evidence exact sequence
- expected 从真实 QC DOM data-qc-source-sequence 读取（非写死 61）
- actualTraceSequence === expectedTraceSequence（exact）
- actualAsset === expectedAsset / actualLayer === expectedLayer / actualRegion === expectedRegion

## E2 Browser Back same-job route
- 独立 context + 干净 normal Analysis 起点（goto 建立）
- page.goBack() 后 pathname exact 恢复
- route identity === active jobId（无 job-risk-002 vs job-normal-001 冲突）
- receivedCount 不减 / identity 保持 / jobStatus 非idle
