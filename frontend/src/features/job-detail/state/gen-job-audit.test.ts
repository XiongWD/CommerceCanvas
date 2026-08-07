/**
 * F3-R1 §十一 job-audit 生成测试（由 scripts/generate-g2-f3-audit.mjs 调用）。
 * 调用共享 generateJobAudit，对账关键 missingIds，写 job-audit.json。
 *
 * 两个场景（normal / risk）都生成审计；任意关键 missingIds 非空时测试失败。
 */
import { describe, it, expect } from 'vitest';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { liveReducer } from '@/features/live-intelligence/state/live-intelligence-reducer';
import { createInitialState } from '@/features/live-intelligence/state/live-intelligence-state';
import { generateJobAudit } from './job-audit-generator';
import { buildNormalScenario } from '@/features/live-intelligence/simulator/scenario-normal';
import { buildRiskScenario } from '@/features/live-intelligence/simulator/scenario-risk';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../../../../..');
const AUDIT_OUT = process.env.AUDIT_OUT || path.join(REPO_ROOT, 'artifacts/frontend/g2-f3-r1');

function dispatchAll(events, scenario, jobId) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('F3-R1 job-audit generation', () => {
  it('normal 场景：7 节点 + 多 Artifact lineage + QC boolean + 成本对账', async () => {
    const state = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const audit = generateJobAudit(state);

    // 节点：7 个全部有 sourceEvents / startedAt / attemptCount
    expect(audit.nodes.total).toBe(7);
    expect(audit.nodes.missingIds).toHaveLength(0);
    expect(audit.nodes.withStartedAt).toBe(7);
    expect(audit.nodes.withAttemptCount).toBe(7);

    // Artifact：多于 1 个（lineage 谱系），sourceEventId 全非空，至少 1 个有 parent lineage
    expect(audit.artifacts.total).toBeGreaterThan(1);
    expect(audit.artifacts.missingIds).toHaveLength(0);
    expect(audit.artifacts.withLineage).toBeGreaterThan(0);

    // QC：5 项，qcReview 必须 boolean（requiresReviewBalanced）
    expect(audit.qc.total).toBe(5);
    expect(audit.qc.requiresReviewBalanced).toBe(true);
    expect(audit.qc.missingIds).toHaveLength(0);

    // 成本：有事件且对账通过
    expect(audit.cost.balanced).toBe(true);

    // 跨页目标：QC 全部可解析
    expect(audit.crossPageTargets.missingIds).toHaveLength(0);
  });

  it('risk 场景：build_recipe attemptCount=2，retryAttempts=1，route 完整影响', async () => {
    const state = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const audit = generateJobAudit(state);

    // build_recipe 节点尝试次数 = 2（初始 + 1 retry）
    const recipeAudit = state.stageAudit.build_recipe;
    expect(recipeAudit.attemptCount).toBe(2);

    // retryAttempts = 1（一次 lifecycle 归并为 1 个 attempt）
    expect(audit.retries.attempts).toBe(1);
    // lifecycle 事件 = 3（scheduled/started/completed），且 attemptsBalanced
    expect(audit.retries.lifecycleEvents).toBe(3);
    expect(audit.retries.attemptsBalanced).toBe(true);

    // route 升级：1 次，含中文原因 + 成本影响 + 耗时影响
    expect(audit.routeUpgrades.total).toBe(1);
    expect(audit.routeUpgrades.withChineseReason).toBe(1);
    expect(audit.routeUpgrades.withCostImpact).toBe(1);
    expect(audit.routeUpgrades.withTimeImpact).toBe(1);

    // risk 终态 awaiting_review
    expect(state.jobStatus).toBe('awaiting_review');

    // QC review=true 项存在（risk 场景至少 3 项需 review）
    const reviewTrue = state.trace
      .filter((t) => t.kind === 'qc.result.created')
      .filter((t) => (t.metrics ?? {}).qcReview === true);
    expect(reviewTrue.length).toBeGreaterThan(0);
    expect(audit.qc.requiresReviewBalanced).toBe(true);

    // 写 audit 文件（由脚本设 AUDIT_OUT）
    await mkdir(AUDIT_OUT, { recursive: true });
    await writeFile(
      path.join(AUDIT_OUT, 'job-audit.json'),
      JSON.stringify({ normal: generateJobAudit(dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001')), risk: audit }, null, 2),
    );
  });
});
