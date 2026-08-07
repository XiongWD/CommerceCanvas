# G2-F3 R1 交互验证报告

生成时间：2026-08-07T14:58:44.887Z
浏览器：Playwright Chromium 143.0.7499.4（独立，非 IAB）

## 验证流程（全部点击真实 UI，未使用 history.pushState / page.goto('/jobs') 代替导航）

1. **竞品分析运行态** → 截图 competitor-running-before-navigation
2. 点击「任务详情」按钮（task-goto-detail）→ 进入 Job Detail → 截图 job-overview-running
3. 切 risk 场景 → 进 Job Detail → 断言 build_recipe attemptCount=2 → 截图 node-list-risk
4. 时间线筛选「风险」→ 断言非风险类不存在 → 截图 timeline-filtered
5. Artifact 关系 → 断言 >1 个、sourceEventId 非空、有 parent lineage → 截图 artifact-lineage
6. QC → 断言 requiresReview=true、「需人工确认」文案 → 截图 qc-risk
7. 路由升级 → 断言 均衡→商品保真优先、+$0.15、+12 秒 → 截图 cost-route-upgrade
8. 客户模式 → 断言无诊断抽屉 → 截图 customer-no-diagnostics
9. 管理员模式 → 断言诊断抽屉「仅管理员可见」→ 截图 admin-diagnostics
10. 点击 QC 结构冲突 → 返回竞品分析 Evidence → 截图 cross-page-evidence-return
11. 场景 C 断线恢复 → Job Detail 内验证 → 截图 reconnect-in-job-detail
12-14. 三种桌面尺寸（1440×900 / 1366×768 / 1280×800）完成态截图

## 录像
- job-detail-cross-page-demo.webm：竞品分析 → Job Detail → QC → Evidence → 返回 Job Detail，任务状态不重置

## 关键断言（RED→GREEN）
- build_recipe retry 后 attemptCount=2（R0 无法恢复）
- Artifact sourceEventId 全非空 + parent lineage（R0 字段错配）
- QC requiresReview boolean=true（R0 错用 string 'true'）
- route 含 +$0.15 与 +12 秒（R0 只显示成本）
- retry 归并为 1 attempt（R0 当 3 次）
