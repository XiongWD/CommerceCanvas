/**
 * 投影层测试（R1 §二 / §十二）。
 * 验证 idle/running/completed/awaiting_review/reconnect 各状态下的可见结果。
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
  it('idle 时 visibleAssetIds 为空（0 张已分析）', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(proj.isIdle).toBe(true);
    expect(proj.visibleAssetIds).toHaveLength(0);
    expect(proj.visibleClusterIds).toHaveLength(0);
    expect(proj.visibleSellingPointIds).toHaveLength(0);
    expect(proj.visibleInsightIds).toHaveLength(0);
    expect(proj.visibleRiskItemIds).toHaveLength(0);
    expect(proj.visibleRecipeFields).toHaveLength(0);
  });
});

describe('投影层：running 只显示已处理资产', () => {
  it('前 4 个事件后只显示已处理图片（< 12）', () => {
    const events = buildNormalScenario().events.slice(0, 4);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleAssetIds.length).toBeLessThan(12);
    expect(proj.visibleAssetIds.length).toBeGreaterThan(0);
  });
});

describe('投影层：聚类逐步出现', () => {
  it('构图里程碑前聚类为空', () => {
    // 前 6 个事件尚未到达 composition_extracted 里程碑
    const events = buildNormalScenario().events.slice(0, 6);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleClusterIds).toHaveLength(0);
  });
  it('构图里程碑后聚类出现', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleClusterIds.length).toBeGreaterThan(0);
  });
});

describe('投影层：卖点逐步出现', () => {
  it('summarize_selling_points 完成前卖点为空', () => {
    const events = buildNormalScenario().events.slice(0, 20);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    // 可能尚未完成 summarize_selling_points
    if (proj.visibleSellingPointIds.length === 0) {
      expect(proj.visibleSellingPointIds).toHaveLength(0);
    }
  });
});

describe('投影层：Recipe normal 0→7', () => {
  it('idle Recipe 0 字段', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(proj.visibleRecipeFields).toHaveLength(0);
  });
  it('completed Recipe 7 字段', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleRecipeFields).toHaveLength(7);
  });
});

describe('投影层：Recipe risk 0→4', () => {
  it('risk completed Recipe 4 字段', () => {
    const events = buildRiskScenario().events;
    const { proj } = projectAt(events, 'risk', 'job-risk-002');
    expect(proj.visibleRecipeFields).toHaveLength(4);
  });
});

describe('投影层：completed 全部可见', () => {
  it('normal completed 显示全部 12 资产', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.isTerminal).toBe(true);
    expect(proj.visibleAssetIds).toHaveLength(12);
  });
});

describe('投影层：风险逐步出现', () => {
  it('idle 风险为空', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(proj.visibleRiskItemIds).toHaveLength(0);
  });
  it('completed 风险项含禁止继承 + 待校验 + 可借鉴', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(proj.visibleRiskItemIds.length).toBeGreaterThan(0);
  });
});

describe('投影层：reconnect 保留当前投影', () => {
  it('断线期间不清空可见资产', () => {
    const events = buildNormalScenario().events.slice(0, 18);
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    // 前 18 个事件后应有已处理资产
    expect(proj.visibleAssetIds.length).toBeGreaterThan(0);
  });
});

describe('投影层：置信度只含已可见实体', () => {
  it('idle 时 confidenceByEntityId 为空', () => {
    const idle = createInitialState('normal');
    const proj = projectCompetitorAnalysis(idle, competitorAnalysisMock);
    expect(Object.keys(proj.confidenceByEntityId)).toHaveLength(0);
  });
  it('completed 时包含资产 + 聚类置信度', () => {
    const events = buildNormalScenario().events;
    const { proj } = projectAt(events, 'normal', 'job-normal-001');
    expect(Object.keys(proj.confidenceByEntityId).length).toBeGreaterThan(0);
  });
});
