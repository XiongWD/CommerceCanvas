/**
 * F2 §3.2 Evidence 定位 Selector 测试（使用生产函数，不再复制算法）。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState, type LiveIntelligenceState } from './live-intelligence-state';
import { findSequenceForEvidence, findTraceBySequence } from './evidence-selectors';
import type { LiveEventEnvelope } from '@/types/live-event';

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
      evidenceRefs: [{ assetId: 'img-01', layer: 'subject' }],
    },
    {
      eventId: 'e3', sequence: 3, occurredAt: '2026-08-02T13:32:10Z', jobId: 'job-normal-001',
      kind: 'evidence.created', severity: 'info', titleZh: '安全区',
      traceCategory: '证据',
      evidenceRefs: [{ assetId: 'img-01', layer: 'safe' }],
    },
  ];
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('F2 §3.2 Evidence Selector（生产函数）', () => {
  it('regionId 精确匹配', () => {
    const s = stateWithTraces();
    expect(findSequenceForEvidence(s, { regionId: 'ev-01-logo', assetId: 'img-01', layer: 'logo' })).toBe(1);
  });
  it('无 regionId 的主体框 → assetId+layer 回退', () => {
    const s = stateWithTraces();
    expect(findSequenceForEvidence(s, { assetId: 'img-01', layer: 'subject' })).toBe(2);
  });
  it('安全区 → assetId+layer 回退', () => {
    const s = stateWithTraces();
    expect(findSequenceForEvidence(s, { assetId: 'img-01', layer: 'safe' })).toBe(3);
  });
  it('仅 assetId → 最宽回退', () => {
    const s = stateWithTraces();
    expect(findSequenceForEvidence(s, { assetId: 'img-01' })).toBe(1);
  });
  it('找不到 → undefined（不崩溃）', () => {
    const s = stateWithTraces();
    expect(findSequenceForEvidence(s, { assetId: 'img-x', layer: 'subject' })).toBeUndefined();
  });
  it('findTraceBySequence 返回对应条目', () => {
    const s = stateWithTraces();
    const t = findTraceBySequence(s, 2);
    expect(t?.titleZh).toBe('商品主体');
    expect(findTraceBySequence(s, 999)).toBeUndefined();
    expect(findTraceBySequence(s, undefined)).toBeUndefined();
  });
});
