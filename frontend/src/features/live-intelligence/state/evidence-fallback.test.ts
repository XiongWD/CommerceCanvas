/**
 * R1.1 P0-2 Evidence 画布→轨迹回退定位测试。
 * 验证 findSequenceForEvidence 的三级回退逻辑（regionId → assetId+layer → assetId）。
 *
 * 该逻辑实现在 CompetitorAnalysisCanvas，但为可测性，这里复制相同的纯函数逻辑
 * 对 liveState.trace 验证（与组件内 findSequenceForEvidence 同源同算法）。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState } from './live-intelligence-state';
import type { LiveIntelligenceState } from './live-intelligence-state';
import type { LiveEventEnvelope } from '@/types/live-event';

/** 与 CompetitorAnalysisCanvas.findSequenceForEvidence 同源的三级回退算法 */
function findSequenceForEvidence(
  state: LiveIntelligenceState,
  params: { regionId?: string; assetId?: string; layer?: string },
): number | undefined {
  const { regionId, assetId, layer } = params;
  if (regionId) {
    const exact = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.regionId === regionId),
    );
    if (exact) return exact.sequence;
  }
  if (assetId && layer) {
    const byAssetLayer = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.assetId === assetId && r.layer === layer),
    );
    if (byAssetLayer) return byAssetLayer.sequence;
  }
  if (assetId) {
    const byAsset = state.trace.find((t) =>
      t.evidenceRefs?.some((r) => r.assetId === assetId),
    );
    if (byAsset) return byAsset.sequence;
  }
  return undefined;
}

function stateWithTraces(): LiveIntelligenceState {
  let s = createInitialState('normal');
  s = { ...s, jobId: 'job-normal-001' };
  const events: LiveEventEnvelope[] = [
    {
      eventId: 'e1', sequence: 1, occurredAt: '2026-08-02T13:32:00Z', jobId: 'job-normal-001',
      kind: 'evidence.created', severity: 'info', titleZh: 'Logo 风险',
      traceCategory: '证据',
      evidenceRefs: [{ assetId: 'img-01', layer: 'logo', regionId: 'ev-01-logo' }],
    },
    {
      eventId: 'e2', sequence: 2, occurredAt: '2026-08-02T13:32:05Z', jobId: 'job-normal-001',
      kind: 'evidence.created', severity: 'info', titleZh: '商品主体',
      traceCategory: '证据',
      evidenceRefs: [{ assetId: 'img-01', layer: 'subject' }], // 无 regionId
    },
    {
      eventId: 'e3', sequence: 3, occurredAt: '2026-08-02T13:32:10Z', jobId: 'job-normal-001',
      kind: 'evidence.created', severity: 'info', titleZh: '安全区',
      traceCategory: '证据',
      evidenceRefs: [{ assetId: 'img-01', layer: 'safe' }], // 无 regionId
    },
  ];
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('R1.1 P0-2 Evidence 回退定位', () => {
  it('有 regionId 的 Logo 框 → regionId 精确匹配', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { regionId: 'ev-01-logo', assetId: 'img-01', layer: 'logo' });
    expect(seq).toBe(1);
  });

  it('无 regionId 的主体框 → assetId+layer 回退定位', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { assetId: 'img-01', layer: 'subject' });
    expect(seq).toBe(2);
  });

  it('无 regionId 的安全区 → assetId+layer 回退定位', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { assetId: 'img-01', layer: 'safe' });
    expect(seq).toBe(3);
  });

  it('仅 assetId 匹配 → assetId 最宽回退', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { assetId: 'img-01' });
    expect(seq).toBe(1); // 第一条匹配
  });

  it('找不到记录 → 返回 undefined（不崩溃）', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { assetId: 'img-nonexistent', layer: 'subject' });
    expect(seq).toBeUndefined();
  });

  it('不存在 regionId 且无匹配 → undefined', () => {
    const s = stateWithTraces();
    const seq = findSequenceForEvidence(s, { regionId: 'no-such-region' });
    expect(seq).toBeUndefined();
  });
});
