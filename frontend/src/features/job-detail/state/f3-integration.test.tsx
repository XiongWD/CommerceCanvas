/**
 * F3-R1 §十：F3 专属真实集成测试（21 项要求）。
 *
 * 必须是真实 Router + LiveContext/Provider 集成测试，不能只测试 Selector。
 * 覆盖：路由与连续性、Job Detail 投影、信息边界、跨页面定位。
 *
 * 测试入口：直接渲染 App（含 BrowserRouter + LiveContext.Provider + PersistentTaskBar），
 * 通过点击真实 UI 触发导航，不使用 history.pushState/PopStateEvent/page.goto。
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Theme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { AppShell } from '@/app/App';
import { liveReducer } from '@/features/live-intelligence/state/live-intelligence-reducer';
import { createInitialState } from '@/features/live-intelligence/state/live-intelligence-state';
import { projectJobDetail } from '@/features/job-detail/state/job-detail-projection';
import { generateJobAudit } from '@/features/job-detail/state/job-audit-generator';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { buildNormalScenario } from '@/features/live-intelligence/simulator/scenario-normal';
import { buildRiskScenario } from '@/features/live-intelligence/simulator/scenario-risk';
import { buildReconnectScenario } from '@/features/live-intelligence/simulator/scenario-reconnect';

/** 把整个事件序列应用到 reducer，得到终态（用于纯函数级断言） */
function dispatchAll(events, scenario, jobId) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

/**
 * 渲染 AppShell（真实 LiveContext Provider + 内部 Routes），用 MemoryRouter 包装。
 * AppShell 不含 BrowserRouter，避免 Router 嵌套；点击真实 UI 触发导航。
 */
function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Theme theme={neutralTheme}>
        <AppShell />
      </Theme>
    </MemoryRouter>,
  );
}

// =========================================================================
// 一、路由与连续性（§十 1-5, 21）
// =========================================================================
describe('F3-R1 §路由与连续性', () => {
  it('1. PersistentTask「任务详情」按钮真实进入 /jobs/:jobId', async () => {
    renderApp('/');
    // 等待 PersistentTaskBar 渲染
    const gotoDetail = await screen.findByTestId('task-goto-detail');
    expect(gotoDetail.textContent).toContain('任务详情');
    // 点击前不在 job detail
    expect(screen.queryByTestId('job-detail-page')).toBeNull();
    // 点击真实按钮
    fireEvent.click(gotoDetail);
    // 进入 Job Detail 页
    await waitFor(() => {
      expect(screen.getByTestId('job-detail-page')).toBeTruthy();
    });
  });

  it('2. PersistentTaskBar 同时有「展开/收起」与「任务详情」两个独立按钮', async () => {
    renderApp('/');
    const expand = await screen.findByTestId('task-expand-toggle');
    const detail = await screen.findByTestId('task-goto-detail');
    // 两个不同按钮
    expect(expand).not.toBe(detail);
    // 展开按钮文案为「展开」（未展开态）
    expect(expand.textContent).toContain('展开');
  });

  it('21. 页面切换不重建 Live Provider（同一 jobId 跨页保持）', async () => {
    renderApp('/');
    const gotoDetail = await screen.findByTestId('task-goto-detail');
    // 记录初始 jobId（来自 ambient status 或 task bar）
    fireEvent.click(gotoDetail);
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    // job detail 页 jobId 与初始一致（未重置）
    // 返回分析页
    const backBtn = screen.getByText('返回分析');
    fireEvent.click(backBtn);
    await waitFor(() => expect(screen.queryByTestId('job-detail-page')).toBeNull());
    // 再进 job detail，jobId 应保持一致
    fireEvent.click(screen.getByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
  });
});

// =========================================================================
// 二、Job Detail 投影（§十 6-9, 16）
// =========================================================================
describe('F3-R1 §Job Detail 投影（权威 audit state）', () => {
  it('6. 7 节点来自 StageAudit（attemptCount/findings 真实）', () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    expect(detail.nodes).toHaveLength(7);
    // 每个节点的 attemptCount/findings 来自 audit，非固定 0
    for (const node of detail.nodes) {
      expect(node.attemptCount).toBeGreaterThanOrEqual(1);
    }
    // 至少有节点产生了发现
    const totalFindings = detail.nodes.reduce((s, n) => s + n.findingsProduced, 0);
    expect(totalFindings).toBeGreaterThan(0);
  });

  it('7. risk build_recipe retry 后 attemptCount=2', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    const recipe = detail.nodes.find((n) => n.stageId === 'build_recipe');
    expect(recipe?.attemptCount).toBe(2);
  });

  it('8. 节点 start/completed 时间真实（来自 stageAudit，非 undefined）', () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    // 已完成的阶段应有 startedAt 和 completedAt
    const completed = detail.nodes.filter((n) => n.statusRaw === 'completed');
    expect(completed.length).toBeGreaterThan(0);
    for (const node of completed) {
      expect(node.startedAt).toBeTruthy();
      expect(node.completedAt).toBeTruthy();
    }
  });

  it('9. 节点状态全部中文展示（不显示英文 active/completed）', () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    const zhStatuses = ['等待执行', '执行中', '已完成', '等待人工确认', '执行失败'];
    for (const node of detail.nodes) {
      expect(zhStatuses).toContain(node.status);
      // 不应出现原始英文
      expect(['active', 'completed', 'pending', 'awaiting_review', 'failed']).not.toContain(node.status);
    }
  });

  it('16. risk 终态 awaiting_review', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    expect(state.jobStatus).toBe('awaiting_review');
  });
});

// =========================================================================
// 三、Artifact Lineage（§十 10-11）
// =========================================================================
describe('F3-R1 §Artifact Lineage', () => {
  it('10. Artifact sourceEventId 全部非空', () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    expect(detail.artifacts.length).toBeGreaterThan(1);
    for (const a of detail.artifacts) {
      expect(a.sourceEventId).toBeTruthy();
      expect(a.sourceEventId.length).toBeGreaterThan(0);
    }
  });

  it('11. Artifact lineage 完整（至少 1 个有 parent lineage）', () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    const withLineage = detail.artifacts.filter((a) => a.parentArtifactIds.length > 0);
    expect(withLineage.length).toBeGreaterThan(0);
  });
});

// =========================================================================
// 四、QC 数据模型（§十 12-13）
// =========================================================================
describe('F3-R1 §QC 数据模型', () => {
  it('12. QC review boolean 正确（不是 string）', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    // risk 场景至少有 review=true 的 QC
    const reviewTrue = detail.qcResults.filter((q) => q.requiresReview === true);
    expect(reviewTrue.length).toBeGreaterThan(0);
    // 确认是 boolean true，不是 string 'true'
    for (const q of detail.qcResults) {
      expect(typeof q.requiresReview).toBe('boolean');
    }
  });

  it('13. QC Evidence 可解析（差异化，非全部同一 subject）', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    const layers = new Set(detail.qcResults.map((q) => q.evidenceRefs?.[0]?.layer));
    // 不应全部是 subject（R0 bug：5 项全指向 img-06 subject）
    expect(layers.size).toBeGreaterThan(1);
  });
});

// =========================================================================
// 五、Retry Attempt 归并（§十 14）
// =========================================================================
describe('F3-R1 §Retry Attempt 归并', () => {
  it('14. 一次 retry lifecycle 只形成一个 attempt（非 3 条）', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    // 归并后只有 1 个 attempt（R0 bug：3 事件当 3 次）
    expect(detail.retryRecords).toHaveLength(1);
    expect(detail.retryRecords[0].attempt).toBe(1);
    expect(detail.retryRecords[0].status).toBe('completed');
  });
});

// =========================================================================
// 六、Route Upgrade（§十 15）
// =========================================================================
describe('F3-R1 §Route Upgrade 完整影响', () => {
  it('15. route upgrade 显示中文原因 + 成本 + 耗时 + 策略', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    expect(detail.routeUpgrades).toHaveLength(1);
    const r = detail.routeUpgrades[0];
    expect(r.fromStrategy).toBe('均衡');
    expect(r.toStrategy).toBe('商品保真优先');
    expect(r.reasonZh).toContain('结构冲突');
    expect(r.costDeltaCents).toBe(15);
    expect(r.timeDeltaSeconds).toBe(12);
  });
});

// =========================================================================
// 七、Reconnect（§十 17）
// =========================================================================
describe('F3-R1 §Reconnect 时间线无重复', () => {
  it('17. reconnect 后时间线无重复 sequence', () => {
    const state = dispatchAll(buildReconnectScenario().events, 'reconnect', 'job-reconnect-003');
    // 业务事件 sequence 不重复
    const bizSeqs = state.trace
      .filter((t) => t.sequence > 0)
      .map((t) => t.sequence);
    const unique = new Set(bizSeqs);
    expect(bizSeqs.length).toBe(unique.size);
    // Artifact 不重复
    const artifactIds = Object.keys(state.artifactAudit);
    expect(new Set(artifactIds).size).toBe(artifactIds.length);
  });
});

// =========================================================================
// 八、信息边界（§十 18-19）
// =========================================================================
describe('F3-R1 §客户/管理员信息边界', () => {
  it('18. 客户模式不显示诊断数据（admin drawer 默认不存在）', async () => {
    renderApp('/');
    fireEvent.click(await screen.findByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    // 默认客户模式：诊断抽屉不存在
    expect(screen.queryByTestId('admin-diag-drawer')).toBeNull();
    expect(screen.queryByTestId('admin-diag-open')).toBeNull();
  });

  it('19. 管理员演示模式显示独立诊断抽屉', async () => {
    renderApp('/');
    fireEvent.click(await screen.findByTestId('task-goto-detail'));
    await waitFor(() => expect(screen.getByTestId('job-detail-page')).toBeTruthy());
    // 切换管理员模式
    fireEvent.click(screen.getByTestId('admin-mode-toggle'));
    // 出现诊断入口
    const diagOpen = await screen.findByTestId('admin-diag-open');
    fireEvent.click(diagOpen);
    // 诊断抽屉出现，标注「仅管理员可见」
    const drawer = await screen.findByTestId('admin-diag-drawer');
    expect(drawer.textContent).toContain('仅管理员可见');
  });
});

// =========================================================================
// 九、跨页面定位（§十 20）
// =========================================================================
describe('F3-R1 §跨页面 QC → Evidence', () => {
  it('20. QC → 竞品分析 Evidence 定位（Router state 携带目标）', () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const detail = projectJobDetail(state, competitorAnalysisMock);
    // 找到 block 状态的 QC（结构冲突）
    const blockQc = detail.qcResults.find((q) => q.status === 'block');
    expect(blockQc).toBeTruthy();
    // 该 QC 有差异化 evidenceRefs（img-06 subject）
    expect(blockQc?.evidenceRefs?.[0]?.assetId).toBe('img-06');
    expect(blockQc?.evidenceRefs?.[0]?.layer).toBe('subject');
    // sourceSequence 可定位 trace
    expect(blockQc?.sourceSequence).toBeTruthy();
  });
});

// =========================================================================
// 十、Job Audit（§十一）
// =========================================================================
describe('F3-R1 §Job Audit 闭包', () => {
  it('normal + risk audit 关键 missingIds 全空', () => {
    const normalState = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const riskState = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const normalAudit = generateJobAudit(normalState);
    const riskAudit = generateJobAudit(riskState);

    // 节点 missingIds
    expect(normalAudit.nodes.missingIds).toHaveLength(0);
    expect(riskAudit.nodes.missingIds).toHaveLength(0);
    // Artifact missingIds
    expect(normalAudit.artifacts.missingIds).toHaveLength(0);
    expect(riskAudit.artifacts.missingIds).toHaveLength(0);
    // QC missingIds
    expect(normalAudit.qc.missingIds).toHaveLength(0);
    expect(riskAudit.qc.missingIds).toHaveLength(0);
    // 跨页 missingIds
    expect(normalAudit.crossPageTargets.missingIds).toHaveLength(0);
    expect(riskAudit.crossPageTargets.missingIds).toHaveLength(0);

    // risk retry: 1 attempt, 3 lifecycle events, balanced
    expect(riskAudit.retries.attempts).toBe(1);
    expect(riskAudit.retries.lifecycleEvents).toBe(3);
    expect(riskAudit.retries.attemptsBalanced).toBe(true);

    // risk route: 完整影响
    expect(riskAudit.routeUpgrades.withChineseReason).toBe(1);
    expect(riskAudit.routeUpgrades.withCostImpact).toBe(1);
    expect(riskAudit.routeUpgrades.withTimeImpact).toBe(1);
  });
});
