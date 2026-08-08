/**
 * F3-R2 数据真实性测试（P0-1 ~ P0-4 + negative cases）。
 *
 * 覆盖任务 §15 最低自动化测试 1-9：
 *   1. artifact producer 正确 stage
 *   2. artifact linked 不覆盖 producer
 *   3. recipe parentArtifactIds lineage
 *   4. artifactMetrics 统一口径
 *   5. cost balanced normal = true
 *   6. cost balanced risk = true
 *   7. cost mismatch negative = false
 *   8. stage sourceEventIds accumulation
 *   9. stage audit missingIds negative case
 *
 * 这些测试证明 audit 数据由真实事件派生，不是常量。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from '@/features/live-intelligence/state/live-intelligence-reducer';
import { createInitialState } from '@/features/live-intelligence/state/live-intelligence-state';
import { generateJobAudit } from '@/features/job-detail/state/job-audit-generator';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { projectJobDetail } from '@/features/job-detail/state/job-detail-projection';
import { buildNormalScenario } from '@/features/live-intelligence/simulator/scenario-normal';
import { buildRiskScenario } from '@/features/live-intelligence/simulator/scenario-risk';
import type { LiveEventEnvelope } from '@/types/live-event';

function dispatchAll(events: LiveEventEnvelope[], scenario: string, jobId: string) {
  let s = createInitialState(scenario as 'normal' | 'risk' | 'reconnect');
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

// =========================================================================
// P0-1: Artifact producer stage 因果关系
// =========================================================================
describe('F3-R2 P0-1 §Artifact producer stage 因果', () => {
  it('1. 不同 Artifact 的 producerStageId 分别来自真实 stage', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const audit = s.artifactAudit;
    // 用途分类结果 ← classify_purpose
    expect(audit['art-purpose']?.producerStageId).toBe('classify_purpose');
    // Evidence 索引 ← segment_subject
    expect(audit['art-evidence']?.producerStageId).toBe('segment_subject');
    // 构图聚类 ← extract_composition
    expect(audit['art-clusters']?.producerStageId).toBe('extract_composition');
    // 风险排除清单 ← detect_text_logo
    expect(audit['art-risk-list']?.producerStageId).toBe('detect_text_logo');
    // Creative Recipe ← build_recipe
    expect(audit['recipe-draft-v1']?.producerStageId).toBe('build_recipe');
  });

  it('2. artifact.linked 不覆盖 producer（link stage ≠ producer stage）', () => {
    // 构造：art-x 在 stage A 生产，之后在 stage B artifact.linked
    let s = createInitialState('normal');
    s = { ...s, jobId: 'job-test' };
    const evA: LiveEventEnvelope = {
      eventId: 'e1', sequence: 1, occurredAt: '2026-01-01T00:00:01Z', jobId: 'job-test',
      kind: 'artifact.created', severity: 'success', titleZh: '产物 X', traceCategory: '成果',
      stageId: 'classify_purpose', artifactRefs: ['art-x'],
      metrics: { artifactType: '分类结果', artifactRole: 'intermediate' },
    };
    s = liveReducer(s, { type: 'apply_event', event: evA });
    const evB: LiveEventEnvelope = {
      eventId: 'e2', sequence: 2, occurredAt: '2026-01-01T00:00:02Z', jobId: 'job-test',
      kind: 'artifact.linked', severity: 'success', titleZh: '产物 X 纳入 Recipe', traceCategory: '成果',
      stageId: 'build_recipe', artifactRefs: ['art-x'],
      metrics: { parentArtifactIds: ['art-y'] },
    };
    s = liveReducer(s, { type: 'apply_event', event: evB });
    // producer 仍为 stage A（classify_purpose），不是 stage B（build_recipe）
    expect(s.artifactAudit['art-x']?.producerStageId).toBe('classify_purpose');
    // 但 parentArtifactIds 被 linked 追加
    expect(s.artifactAudit['art-x']?.parentArtifactIds).toContain('art-y');
  });

  it('3. Recipe parentArtifactIds lineage 包含真实上游', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const recipe = s.artifactAudit['recipe-draft-v1'];
    expect(recipe).toBeTruthy();
    // Recipe 的 parent 至少包含构图聚类和风险排除清单（真实上游）
    expect(recipe!.parentArtifactIds).toContain('art-clusters');
    expect(recipe!.parentArtifactIds).toContain('art-risk-list');
  });
});

// =========================================================================
// P0-2: Artifact metrics 统一口径
// =========================================================================
describe('F3-R2 P0-2 §Artifact metrics 统一口径', () => {
  it('4. artifactMetrics.total === artifactAudit.length，intermediate+final === total', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    expect(s.artifactMetrics.total).toBe(Object.keys(s.artifactAudit).length);
    expect(s.artifactMetrics.intermediate + s.artifactMetrics.final).toBe(s.artifactMetrics.total);
    // normal：5 total，4 intermediate，1 final（Recipe）
    expect(s.artifactMetrics.total).toBe(5);
    expect(s.artifactMetrics.intermediate).toBe(4);
    expect(s.artifactMetrics.final).toBe(1);
  });

  it('4b. Overview 和 Artifact 区使用相同权威数据（projection 一致）', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const detail = projectJobDetail(s, competitorAnalysisMock);
    // Overview.artifacts === artifactMetrics.total（不再 summaryMetrics 口径冲突）
    expect(detail.overview.artifacts).toBe(detail.artifactMetrics.total);
    // Artifact 区条数 === artifactMetrics.total
    expect(detail.artifacts.length).toBe(detail.artifactMetrics.total);
  });
});

// =========================================================================
// P0-3: Cost audit balanced 非恒真
// =========================================================================
describe('F3-R2 P0-3 §Cost audit balanced', () => {
  it('5. normal: estimated 21 + delta -2 = actual 19, balanced = true', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const audit = generateJobAudit(s);
    expect(audit.cost.estimatedCents).toBe(21);
    expect(audit.cost.actualCents).toBe(19);
    expect(audit.cost.expectedActualCents).toBe(19);
    expect(audit.cost.balanced).toBe(true);
  });

  it('6. risk: estimated 21 + delta +15 = actual 36, balanced = true', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const audit = generateJobAudit(s);
    expect(audit.cost.estimatedCents).toBe(21);
    expect(audit.cost.deltaCents).toBe(15);
    expect(audit.cost.actualCents).toBe(36);
    expect(audit.cost.expectedActualCents).toBe(36);
    expect(audit.cost.balanced).toBe(true);
  });

  it('7. NEGATIVE: estimated 21 + delta +15 != actual 35, balanced = false', () => {
    // 构造一个不平衡的成本序列：estimated=21, delta=+15, actual=35（应为 36）
    let s = createInitialState('risk');
    s = { ...s, jobId: 'job-test' };
    const events: LiveEventEnvelope[] = [
      { eventId: 'c1', sequence: 1, occurredAt: '2026-01-01T00:00:01Z', jobId: 'job-test', kind: 'cost.estimate.created', severity: 'info', titleZh: '预估', traceCategory: '成本', metrics: { estimatedCents: 21, currency: 'USD' } },
      { eventId: 'c2', sequence: 2, occurredAt: '2026-01-01T00:00:02Z', jobId: 'job-test', kind: 'cost.updated', severity: 'info', titleZh: '实际', traceCategory: '成本', metrics: { actualCents: 35, deltaCents: 15, currency: 'USD' } },
    ];
    for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
    const audit = generateJobAudit(s);
    // 21 + 15 = 36 != 35 → balanced = false（非恒真）
    expect(audit.cost.expectedActualCents).toBe(36);
    expect(audit.cost.actualCents).toBe(35);
    expect(audit.cost.balanced).toBe(false);
  });
});

// =========================================================================
// P0-4: Stage source-event audit 真实累计
// =========================================================================
describe('F3-R2 P0-4 §Stage source-event audit', () => {
  it('8. 全量事件：withSourceEvents === total，sourceEventIds 真实累计', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const audit = generateJobAudit(s);
    expect(audit.nodes.total).toBe(7);
    expect(audit.nodes.withSourceEvents).toBe(7);
    expect(audit.nodes.missingIds).toHaveLength(0);
    // 每个 stage 的 sourceEventIds 非空（真实累计）
    for (const sid of s.stageOrder) {
      expect(s.stageAudit[sid].sourceEventIds.length).toBeGreaterThan(0);
    }
  });

  it('9. NEGATIVE: 构造一个 stage 无 source event，missingIds 包含该 stage', () => {
    // 只派发前 2 个 stage 的事件（validate_images + classify_purpose），其余 stage 无 source
    const allEvents = buildNormalScenario().events;
    // 找到 segment_subject 首个事件的 sequence，截断到它之前
    const cutSeq = allEvents.find((e) => e.stageId === 'segment_subject')?.sequence ?? 999;
    const partial = allEvents.filter((e) => e.sequence < cutSeq);
    const s = dispatchAll(partial, 'normal', 'job-partial');
    const audit = generateJobAudit(s);
    // withSourceEvents < total
    expect(audit.nodes.withSourceEvents).toBeLessThan(audit.nodes.total);
    // missingIds 包含无 source 的 stage（segment_subject 及之后）
    expect(audit.nodes.missingIds.length).toBeGreaterThan(0);
    expect(audit.nodes.missingIds).toContain('segment_subject');
  });

  it('9b. retry lifecycle 事件归入 build_recipe 的 sourceEventIds（但不破坏 attempt 聚合）', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const recipeAudit = s.stageAudit.build_recipe;
    // retry.scheduled/started/completed 三个事件都应归入 build_recipe sourceEventIds
    const retryEventIds = s.trace
      .filter((t) => t.kind?.startsWith('retry.') && t.stageId === 'build_recipe')
      .map((t) => t.eventId);
    for (const rid of retryEventIds) {
      expect(recipeAudit.sourceEventIds).toContain(rid);
    }
    // 但 attempt 聚合不变：仍 1 个 attempt
    const audit = generateJobAudit(s);
    expect(audit.retries.attempts).toBe(1);
    expect(audit.retries.lifecycleEvents).toBe(3);
  });
});
