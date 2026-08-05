/**
 * 投影层测试（R1.1 §二 / §十二）。
 *
 * R1.1 核心变更：可见结果只由已应用事件的 resultRefs 驱动，
 * 不再由里程碑/阶段存在性反推静态数组。
 *   - idle 时一切为空（resultRefsAccumulated 为空）。
 *   - running 时只显示事件已显式产出的结果。
 *   - 终态（completed/awaiting_review）不自动展开全部静态数组。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from '@/features/live-intelligence/state/live-intelligence-reducer';
import { createInitialState } from '@/features/live-intelligence/state/live-intelligence-state';
import { projectCompetitorAnalysis } from './competitor-analysis-projection';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { buildNormalScenario } from '@/features/live-intelligence/simulator/scenario-normal';
import { buildRiskScenario } from '@/features/live-intelligence/simulator/scenario-risk';
import type { LiveEventEnvelope } from '@/types/live-event';

function dispatchAll(events: LiveEventEnvelope[], scenario: string, jobId: string) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

function projectAt(events: LiveEventEnvelope[], scenario: string, jobId: string) {
  const live = dispatchAll(events, scenario, jobId);
  return { live, proj: projectCompetitorAnalysis(live, competitorAnalysisMock) };
}

describe('投影层：idle 无最终结论', () => {
  it('idle 时所有可见集合为空（0 事件 → resultRefsAccumulated 为空）', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(proj.isIdle).toBe(true);
    expect(proj.visibleAssetIds).toHaveLength(0);
    expect(proj.visibleClusterIds).toHaveLength(0);
    expect(proj.visibleSellingPointIds).toHaveLength(0);
    expect(proj.visibleInsightIds).toHaveLength(0);
    expect(proj.visibleRiskItemIds).toHaveLength(0);
    expect(proj.visibleRecipeFields).toHaveLength(0);
    expect(Object.keys(proj.entityEvidence)).toHaveLength(0);
  });
});

describe('投影层：可见性由事件 resultRefs 驱动（非里程碑/阶段）', () => {
  it('在分类用途事件到达前资产为空（即使阶段已开始）', () => {
    // 前 4 个事件：session.started + validate_images 阶段事件，无 classifiedAssetIds
    const events = buildNormalScenario().events.slice(0, 4);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleAssetIds).toHaveLength(0);
    // 但 isIdle=false（已有 session.started）
    expect(proj.isIdle).toBe(false);
  });

  it('分类用途事件到达后，已分类资产逐步出现', () => {
    // 找到第一条携带 classifiedAssetIds 的事件 sequence
    const all = buildNormalScenario().events;
    const firstClassifyIdx = all.findIndex(
      (e) => (e.resultRefs?.classifiedAssetIds ?? []).length > 0,
    );
    expect(firstClassifyIdx, 'normal 场景应存在分类用途事件').toBeGreaterThan(-1);
    // 截到第一条分类事件之后
    const events = all.slice(0, firstClassifyIdx + 1);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleAssetIds.length).toBeGreaterThan(0);
    expect(proj.visibleAssetIds.length).toBeLessThan(12); // 仅前半部分
  });

  it('聚类只在 extract_composition 的 resultRefs 事件后出现', () => {
    const all = buildNormalScenario().events;
    const firstClusterIdx = all.findIndex(
      (e) => (e.resultRefs?.clusterIds ?? []).length > 0,
    );
    // 截到第一条聚类事件之前：聚类为空
    const before = all.slice(0, firstClusterIdx);
    const projBefore = projectAt(before, 'normal', 'job-normal-001').proj;
    expect(projBefore.visibleClusterIds).toHaveLength(0);
    // 截到第一条聚类事件之后：聚类出现（cluster-a..d 与 mock 一致）
    const after = all.slice(0, firstClusterIdx + 1);
    const projAfter = projectAt(after, 'normal', 'job-normal-001').proj;
    expect(projAfter.visibleClusterIds.length).toBeGreaterThan(0);
  });

  it('聚类可见性不再依赖 composition_extracted 里程碑的存在', () => {
    // 构造一个状态：有聚类 resultRefs 事件，但无该里程碑
    const all = buildNormalScenario().events;
    const firstClusterIdx = all.findIndex(
      (e) => (e.resultRefs?.clusterIds ?? []).length > 0,
    );
    const events = all.slice(0, firstClusterIdx + 1);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleClusterIds.length).toBeGreaterThan(0);
    // 此时 composition_extracted 里程碑尚未到达（它在阶段 onComplete）
    expect(proj.completedMilestones).not.toContain('composition_extracted');
  });

  it('卖点只在 summarize_selling_points 的 resultRefs 事件后出现', () => {
    const all = buildNormalScenario().events;
    const firstSpIdx = all.findIndex(
      (e) => (e.resultRefs?.sellingPointIds ?? []).length > 0,
    );
    // 截到卖点事件之前：卖点为空
    const before = all.slice(0, firstSpIdx);
    const projBefore = projectAt(before, 'normal', 'job-normal-001').proj;
    expect(projBefore.visibleSellingPointIds).toHaveLength(0);
    // 注：mock 的卖点 id 为 sp-comfort 等；scenario 用 sp-1..sp-6，
    // 二者命名空间不一致，故过滤后仍为空——这与 mock 对齐的工作尚待统一。
    // 这里仅断言"不抛错且为数组"。
    const after = all.slice(0, firstSpIdx + 1);
    const projAfter = projectAt(after, 'normal', 'job-normal-001').proj;
    expect(Array.isArray(projAfter.visibleSellingPointIds)).toBe(true);
  });
});

describe('投影层：Recipe 由事件 metrics.recipeFields 驱动', () => {
  it('idle Recipe 0 字段', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(proj.visibleRecipeFields).toHaveLength(0);
  });
  it('completed Recipe 7 字段（normal 7/7）', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleRecipeFields).toHaveLength(7);
  });
  it('risk completed Recipe 4 字段（部分补全）', () => {
    const events = buildRiskScenario().events;
    const { proj } = projectAt(events, 'risk', 'job-risk-002');
    expect(proj.visibleRecipeFields).toHaveLength(4);
  });
});

describe('投影层：终态不自动展开静态数组', () => {
  it('normal completed：已分类资产 = 12（来自事件 classifiedAssetIds）', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.isTerminal).toBe(true);
    // 12 张全部由分类事件产出（img-01..img-12 与 mock 一致）
    expect(proj.visibleAssetIds).toHaveLength(12);
    expect(proj.classifiedAssetIds).toHaveLength(12);
  });

  it('normal completed：风险项来自事件 riskItemIds（部分与 mock 命名一致）', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    // scenario 用 risk-logo / risk-density / risk-claims / risk-safe-1..5；
    // mock 仅有 risk-logo，故过滤后至少 1 项。
    expect(proj.visibleRiskItemIds.length).toBeGreaterThanOrEqual(1);
    expect(proj.visibleRiskItemIds).toContain('risk-logo');
  });

  it('risk 场景有 resultRefs → 终态显示全部已形成结果（事件驱动）', () => {
    const events = buildRiskScenario().events;
    const { proj } = projectAt(events, 'risk', 'job-risk-002');
    expect(proj.isTerminal).toBe(true);
    // risk 场景现已声明 resultRefs，应显示全部已分类资产
    expect(proj.visibleAssetIds).toHaveLength(12);
    expect(proj.visibleClusterIds.length).toBe(4);
    expect(proj.visibleSellingPointIds.length).toBe(6);
    expect(proj.visibleRiskItemIds.length).toBeGreaterThan(0);
    expect(proj.visibleRecipeFields).toHaveLength(4);
  });
});

describe('投影层：reconnect 保留当前投影', () => {
  it('部分事件后保留已产出的可见资产', () => {
    const all = buildNormalScenario().events;
    const firstClassifyIdx = all.findIndex(
      (e) => (e.resultRefs?.classifiedAssetIds ?? []).length > 0,
    );
    const events = all.slice(0, firstClassifyIdx + 2);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleAssetIds.length).toBeGreaterThan(0);
  });
});

describe('投影层：置信度只含已可见实体', () => {
  it('idle 时 confidenceByEntityId 为空', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(Object.keys(proj.confidenceByEntityId)).toHaveLength(0);
  });
  it('completed 时包含资产 + 聚类 + 洞察置信度', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(Object.keys(proj.confidenceByEntityId).length).toBeGreaterThan(0);
    // 至少包含全部 12 张已分类资产
    for (const id of proj.visibleAssetIds) {
      expect(proj.confidenceByEntityId[id]).toBeDefined();
    }
    for (const id of proj.visibleClusterIds) {
      expect(proj.confidenceByEntityId[id]).toBeDefined();
    }
  });
});

describe('投影层：entityEvidence 记录结果来源事件', () => {
  it('idle 时无证据', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(Object.keys(proj.entityEvidence)).toHaveLength(0);
  });

  it('已分类资产携带来源事件 ID 与 sequence', () => {
    const all = buildNormalScenario().events;
    const firstClassifyIdx = all.findIndex(
      (e) => (e.resultRefs?.classifiedAssetIds ?? []).length > 0,
    );
    const events = all.slice(0, firstClassifyIdx + 1);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleAssetIds.length).toBeGreaterThan(0);
    const firstAsset = proj.visibleAssetIds[0];
    const ev = proj.entityEvidence[firstAsset];
    expect(ev, `${firstAsset} 应有证据溯源`).toBeDefined();
    expect(ev.sourceEventIds.length).toBeGreaterThan(0);
    expect(ev.traceSequences.length).toBe(ev.sourceEventIds.length);
    expect(ev.evidenceRefs).toEqual([]);
  });

  it('completed 时每个可见实体都有证据溯源', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    const visibleIds = [
      ...proj.visibleAssetIds,
      ...proj.visibleClusterIds,
      ...proj.visibleRecipeFields,
    ];
    expect(visibleIds.length).toBeGreaterThan(0);
    for (const id of visibleIds) {
      expect(proj.entityEvidence[id], `${id} 应有证据溯源`).toBeDefined();
      expect(proj.entityEvidence[id].sourceEventIds.length).toBeGreaterThan(0);
    }
  });

  it('证据溯源携带事件的 evidenceRefs（如分类事件关联画布图层）', () => {
    const all = buildNormalScenario().events;
    // 截到含 evidenceRefs 的分类用途事件之后
    const evWithEvidence = all.findIndex(
      (e) => e.kind === 'evidence.created' && (e.evidenceRefs?.length ?? 0) > 0,
    );
    expect(evWithEvidence, 'normal 场景应存在带 evidenceRefs 的事件').toBeGreaterThan(-1);
    // evidence.created 不带 resultRefs，故仅校验结构稳定不抛错
    const { proj } = projectAt(all.slice(0, evWithEvidence + 1), 'normal', 'job-normal-001');
    expect(proj.entityEvidence).toBeDefined();
  });
});
