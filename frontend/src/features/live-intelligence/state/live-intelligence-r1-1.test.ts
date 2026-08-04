/**
 * R1.1 收尾测试：transport 入 trace / runId / restart 清空 / blockingConflicts。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState } from './live-intelligence-state';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildRiskScenario } from '../simulator/scenario-risk';
import type { LiveEventEnvelope } from '@/types/live-event';

function dispatchAll(events: LiveEventEnvelope[], scenario = 'normal', jobId = 'job-test') {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('R1.1 P0-1 transport 进入客户分析轨迹', () => {
  it('disconnected/reconnecting/recovered 共 3 条系统轨迹，顺序正确', () => {
    let s = createInitialState('reconnect');
    s = { ...s, jobId: 'job-reconnect-003', runId: 1 };
    s = liveReducer(s, { type: 'transport_disconnected', eventId: 'td-1', occurredAt: '2026-08-02T13:32:20Z' });
    s = liveReducer(s, { type: 'transport_reconnecting', eventId: 'tr-1', occurredAt: '2026-08-02T13:32:21Z' });
    s = liveReducer(s, { type: 'transport_recovered', eventId: 'trec-1', occurredAt: '2026-08-02T13:32:22Z', fromSequence: 18, recoveredCount: 4 });
    const sysTrace = s.trace.filter((t) => t.category === '系统');
    expect(sysTrace.length).toBe(3);
    expect(sysTrace[0].titleZh).toContain('中断');
    expect(sysTrace[1].titleZh).toContain('重连');
    expect(sysTrace[2].titleZh).toContain('恢复');
  });

  it('recovered 文案包含「补齐 4 个事件」', () => {
    let s = createInitialState('reconnect');
    s = liveReducer(s, { type: 'transport_recovered', eventId: 'trec-2', occurredAt: '2026-08-02T13:32:22Z', fromSequence: 18, recoveredCount: 4 });
    const recovered = s.trace.find((t) => t.titleZh.includes('恢复'));
    expect(recovered?.titleZh).toContain('补齐 4 个事件');
  });

  it('重复 transport event 不重复（eventId 去重）', () => {
    let s = createInitialState('reconnect');
    s = liveReducer(s, { type: 'transport_disconnected', eventId: 'td-dup', occurredAt: '2026-08-02T13:32:20Z' });
    const after1 = s.trace.length;
    s = liveReducer(s, { type: 'transport_disconnected', eventId: 'td-dup', occurredAt: '2026-08-02T13:32:20Z' });
    expect(s.trace.length).toBe(after1);
  });

  it('transport 不影响业务 lastContiguousSequence', () => {
    let s = createInitialState('reconnect');
    s = liveReducer(s, {
      type: 'apply_event',
      event: {
        eventId: 'b1', sequence: 1, occurredAt: '2026-08-02T13:32:00Z', jobId: 'j',
        kind: 'observation.created', severity: 'info', titleZh: '业务1', traceCategory: '发现',
      } as LiveEventEnvelope,
    });
    const beforeTransport = s.ledger.lastContiguousSequence;
    s = liveReducer(s, { type: 'transport_disconnected', eventId: 'td-seq', occurredAt: '2026-08-02T13:32:20Z' });
    s = liveReducer(s, { type: 'transport_recovered', eventId: 'trec-seq', occurredAt: '2026-08-02T13:32:22Z', fromSequence: 1, recoveredCount: 0 });
    expect(s.ledger.lastContiguousSequence).toBe(beforeTransport);
  });
});

describe('R1.1 P1-1 runId 与 restart 里程碑重显', () => {
  it('reset（restart）后 runId 递增', () => {
    let s = createInitialState('normal');
    s = { ...s, jobId: 'job-normal-001' };
    const r0 = s.runId;
    s = liveReducer(s, { type: 'reset', scenario: 'normal', jobId: 'job-normal-001' });
    expect(s.runId).toBe(r0 + 1);
  });

  it('restart 后 trace/ledger/milestones 清空，可重新演示', () => {
    const s1 = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    expect(s1.trace.length).toBeGreaterThan(0);
    const s2 = liveReducer(s1, { type: 'reset', scenario: 'normal', jobId: 'job-normal-001' });
    expect(s2.trace.length).toBe(0);
    expect(s2.milestones.length).toBe(0);
    expect(Object.keys(s2.ledger.seenEventIds).length).toBe(0);
    expect(s2.receivedCount).toBe(0);
  });

  it('restart 后再 dispatch 同场景事件，正常进入（不被旧 ledger 去重）', () => {
    const s1 = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    let s2 = liveReducer(s1, { type: 'reset', scenario: 'normal', jobId: 'job-normal-001' });
    for (const e of buildNormalScenario().events) s2 = liveReducer(s2, { type: 'apply_event', event: e });
    expect(s2.receivedCount).toBe(buildNormalScenario().events.length);
  });

  it('shownMilestoneIds 按 jobId#runId 分组，新 run 可重显', () => {
    let s = createInitialState('normal');
    s = { ...s, jobId: 'job-normal-001', runId: 1 };
    s = liveReducer(s, {
      type: 'apply_event',
      event: {
        eventId: 'm1', sequence: 1, occurredAt: '2026-08-02T13:32:00Z', jobId: 'job-normal-001',
        kind: 'milestone.reached', severity: 'success', titleZh: '用途识别完成',
        traceCategory: '成果', metrics: { milestoneId: 'purpose_classified' },
      } as LiveEventEnvelope,
    });
    expect((s.shownMilestoneIds['job-normal-001#1'] ?? []).includes('purpose_classified')).toBe(true);
    // reset → runId=2
    s = liveReducer(s, { type: 'reset', scenario: 'normal', jobId: 'job-normal-001' });
    expect((s.shownMilestoneIds['job-normal-001#2'] ?? []).length).toBe(0);
  });
});

describe('R1.1 blockingConflicts 从 state 对账', () => {
  it('normal blockingConflicts = 0', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    expect(s.summaryMetrics.blockingConflicts).toBe(0);
  });

  it('risk blockingConflicts = 1', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    expect(s.summaryMetrics.blockingConflicts).toBe(1);
  });
});
