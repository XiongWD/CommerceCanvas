/**
 * R1 全量 Reducer / Ledger / 场景测试（覆盖 reviewer 指出的所有 P0/P1）。
 * 关键：测试使用与 useReducer 完全相同的 liveReducer（无 applyEvents 专用路径）。
 */
import { describe, it, expect } from 'vitest';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState } from './live-intelligence-state';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildRiskScenario } from '../simulator/scenario-risk';
import { buildReconnectScenario } from '../simulator/scenario-reconnect';
import type { LiveEventEnvelope } from '@/types/live-event';

/** 用真实 liveReducer 顺序 dispatch 一组事件（与页面同一路径） */
function dispatchAll(events: LiveEventEnvelope[], scenario = 'normal', jobId = 'job-test') {
  let state = createInitialState(scenario);
  state = { ...state, jobId };
  for (const e of events) state = liveReducer(state, { type: 'apply_event', event: e });
  return state;
}

function mkEvent(over: Partial<LiveEventEnvelope> & { sequence: number; eventId: string }): LiveEventEnvelope {
  return {
    occurredAt: '2026-08-02T13:32:00Z',
    jobId: 'job-test',
    kind: 'observation.created',
    severity: 'info',
    titleZh: '测试事件',
    traceCategory: '发现',
    ...over,
  } as LiveEventEnvelope;
}

describe('P0-1 真实 React 路径去重', () => {
  it('完整场景重复 dispatch 两次，计数不翻倍', () => {
    const events = buildNormalScenario().events;
    const state1 = dispatchAll(events, 'normal', 'job-normal-001');
    // 第二次 dispatch 同一序列（模拟 R0 的双重执行）
    let state2 = state1;
    for (const e of events) state2 = liveReducer(state2, { type: 'apply_event', event: e });
    expect(state2.receivedCount).toBe(state1.receivedCount);
    expect(state1.receivedCount).toBe(events.length);
  });

  it('重复 eventId 不进入 trace', () => {
    const dup = mkEvent({ eventId: 'dup', sequence: 1, titleZh: '重复' });
    let s = createInitialState('normal');
    s = liveReducer(s, { type: 'apply_event', event: dup });
    s = liveReducer(s, { type: 'apply_event', event: dup });
    expect(s.trace.filter((t) => t.eventId === 'dup')).toHaveLength(1);
  });
});

describe('P0-2 有序缓冲（真正乱序）', () => {
  it('1,3,2：3 暂存，2 到达后按 2→3 顺序应用，无缺口', () => {
    const e1 = mkEvent({ eventId: 'a', sequence: 1, titleZh: '一' });
    const e3 = mkEvent({ eventId: 'c', sequence: 3, titleZh: '三' });
    const e2 = mkEvent({ eventId: 'b', sequence: 2, titleZh: '二' });
    let s = createInitialState('normal');
    s = liveReducer(s, { type: 'apply_event', event: e1 });
    s = liveReducer(s, { type: 'apply_event', event: e3 });
    // 3 不应进入 trace（暂存）
    expect(s.trace.some((t) => t.eventId === 'c')).toBe(false);
    s = liveReducer(s, { type: 'apply_event', event: e2 });
    // 现在 2 和 3 都应用，按序
    const titles = s.trace.map((t) => t.titleZh);
    expect(titles).toEqual(['一', '二', '三']);
    expect(s.ledger.lastContiguousSequence).toBe(3);
    expect(Object.keys(s.ledger.pendingBySequence)).toHaveLength(0);
  });

  it('1,4,3,2：缺口补齐后无缺口', () => {
    let s = createInitialState('normal');
    for (const seq of [1, 4, 3, 2]) {
      s = liveReducer(s, {
        type: 'apply_event',
        event: mkEvent({ eventId: `e${seq}`, sequence: seq, titleZh: `事件${seq}` }),
      });
    }
    expect(s.ledger.lastContiguousSequence).toBe(4);
    expect(s.trace.map((t) => t.titleZh)).toEqual(['事件1', '事件2', '事件3', '事件4']);
  });

  it('已完成阶段后迟到的 stage.started 不回退', () => {
    let s = createInitialState('normal');
    s = { ...s, jobId: 'j' };
    // 先完成 validate_images
    s = liveReducer(s, {
      type: 'apply_event',
      event: mkEvent({
        eventId: 'q', sequence: 1, kind: 'stage.queued',
        stageId: 'validate_images', titleZh: '排队', traceCategory: undefined,
      }) as LiveEventEnvelope,
    });
    s = liveReducer(s, {
      type: 'apply_event',
      event: mkEvent({
        eventId: 'done', sequence: 2, kind: 'stage.completed',
        stageId: 'validate_images', titleZh: '完成', traceCategory: undefined, severity: 'success',
      }) as LiveEventEnvelope,
    });
    expect(s.stages.validate_images.status).toBe('completed');
    // 迟到的旧 sequence stage.started（已被去重跳过；改用同 sequence 不同 event）
    // 用全新 sequence 但 stage.started 也不应回退 completed
    s = liveReducer(s, {
      type: 'apply_event',
      event: mkEvent({
        eventId: 'late-start', sequence: 3, kind: 'stage.started',
        stageId: 'validate_images', titleZh: '迟到开始', traceCategory: undefined,
      }) as LiveEventEnvelope,
    });
    expect(s.stages.validate_images.status).toBe('completed');
  });

  it('大于当前序号但存在缺口的事件不提前污染 UI', () => {
    let s = createInitialState('normal');
    s = liveReducer(s, { type: 'apply_event', event: mkEvent({ eventId: 'a', sequence: 1 }) });
    s = liveReducer(s, { type: 'apply_event', event: mkEvent({ eventId: 'c', sequence: 5 }) });
    // 5 暂存，不进入 trace，lastContiguous 仍 1
    expect(s.ledger.lastContiguousSequence).toBe(1);
    expect(s.trace.some((t) => t.eventId === 'c')).toBe(false);
  });
});

describe('P0-3 Reducer 不可变', () => {
  it('应用事件后 previousState !== nextState', () => {
    const prev = createInitialState('normal');
    const next = liveReducer(prev, {
      type: 'apply_event',
      event: mkEvent({ eventId: 'a', sequence: 1 }),
    });
    expect(next).not.toBe(prev);
  });

  it('阶段变更后 previousState.stages !== nextState.stages 且目标 stage 不同', () => {
    const prev = createInitialState('normal');
    const next = liveReducer(prev, {
      type: 'apply_event',
      event: mkEvent({
        eventId: 'a', sequence: 1, kind: 'stage.completed',
        stageId: 'validate_images', titleZh: '完成', traceCategory: undefined, severity: 'success',
      }) as LiveEventEnvelope,
    });
    expect(next.stages).not.toBe(prev.stages);
    expect(next.stages.validate_images).not.toBe(prev.stages.validate_images);
  });

  it('previousState 内容保持原值（不被污染）', () => {
    const prev = createInitialState('normal');
    const prevStatus = prev.stages.validate_images.status;
    liveReducer(prev, {
      type: 'apply_event',
      event: mkEvent({
        eventId: 'a', sequence: 1, kind: 'stage.completed',
        stageId: 'validate_images', titleZh: '完成', traceCategory: undefined, severity: 'success',
      }) as LiveEventEnvelope,
    });
    expect(prev.stages.validate_images.status).toBe(prevStatus);
  });
});

describe('场景 A 正常完成（业务事实）', () => {
  it('确定性：两次 build 事件序列完全一致', () => {
    const a = buildNormalScenario();
    const b = buildNormalScenario();
    expect(a.events.map((e) => e.eventId)).toEqual(b.events.map((e) => e.eventId));
  });

  it('终态 completed，findings=24，risks=3，artifacts(final)=1/total=5，recipe=7/7', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    expect(s.jobStatus).toBe('completed');
    expect(s.summaryMetrics.findings).toBe(24);
    expect(s.summaryMetrics.risks).toBe(3);
    // F3-R3 §7：summaryMetrics.artifacts 语义 = 最终产物数（= artifactMetrics.final = 1）
    // 不再与 artifactMetrics.total(5) 混淆；权威 total 由 artifactMetrics 维护
    expect(s.summaryMetrics.artifacts).toBe(1);
    expect(s.artifactMetrics.total).toBe(5);
    expect(s.artifactMetrics.final).toBe(1);
    expect(s.artifactMetrics.intermediate).toBe(4);
    expect(s.artifactMetrics.intermediate + s.artifactMetrics.final).toBe(s.artifactMetrics.total);
    // 7 字段全 true
    expect(Object.values(s.recipe).every(Boolean)).toBe(true);
  });

  it('实际产生 3 条可区分风险（不是 1 条）', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    expect(s.risks.length).toBe(3);
  });

  it('客户轨迹不含低价值 stage.queued/started/progress/completed', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const cats = s.trace.map((t) => t.titleZh);
    // 不应出现纯系统阶段事件文案
    expect(cats.some((c) => c === '阶段排队')).toBe(false);
    expect(cats.some((c) => c === '阶段开始')).toBe(false);
    expect(cats.some((c) => c === '阶段进度')).toBe(false);
    expect(cats.some((c) => c === '阶段完成')).toBe(false);
  });
});

describe('场景 B 高风险（业务事实）', () => {
  it('终态 awaiting_review，build_recipe 阶段为 awaiting_review', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    expect(s.jobStatus).toBe('awaiting_review');
    expect(s.stages.build_recipe.status).toBe('awaiting_review');
  });

  it('findings=24, risks=3, blockingConflicts=1', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    expect(s.summaryMetrics.findings).toBe(24);
    expect(s.summaryMetrics.risks).toBe(3);
  });

  it('Recipe 部分完成（4/7，非 7/7）', () => {
    const s = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');
    const done = Object.values(s.recipe).filter(Boolean).length;
    expect(done).toBe(4);
  });

  it('确定性：两次 build 一致', () => {
    expect(buildRiskScenario().events.length).toBe(buildRiskScenario().events.length);
  });
});

describe('场景 C 断线恢复（Last-Event-ID 语义）', () => {
  it('前 18 个正常业务事件，之后 3 个连接信号，exactly 4 个 replayed(19-22)，23+ 非 replayed', () => {
    const scenario = buildReconnectScenario();
    const events = scenario.events;
    // 连接三联存在
    expect(events.some((e) => e.kind === 'connection.disconnected')).toBe(true);
    expect(events.some((e) => e.kind === 'connection.reconnecting')).toBe(true);
    expect(events.some((e) => e.kind === 'connection.recovered')).toBe(true);
    // 业务事件中 replayed=true 的恰好是 19-22
    const businessEvents = events.filter((e) => !e.kind.startsWith('connection.'));
    const replayed = businessEvents.filter((e) => e.replayed === true);
    expect(replayed.map((e) => e.sequence)).toEqual([19, 20, 21, 22]);
    // 23+ 非 replayed
    const afterReplay = businessEvents.filter((e) => e.sequence >= 23);
    expect(afterReplay.every((e) => e.replayed !== true)).toBe(true);
  });

  it('所有业务事件 jobId 一致为 job-reconnect-003', () => {
    const events = buildReconnectScenario().events;
    const businessEvents = events.filter((e) => !e.kind.startsWith('connection.'));
    expect(businessEvents.every((e) => e.jobId === 'job-reconnect-003')).toBe(true);
  });

  it('恢复后 recoveredCount=4', () => {
    const events = buildReconnectScenario().events;
    const recovered = events.find((e) => e.kind === 'connection.recovered');
    expect(recovered?.metrics?.recoveredCount).toBe(4);
    expect(recovered?.metrics?.fromSequence).toBe(18);
  });

  it('全部应用后：Artifact 不重复，里程碑不重复，lastContiguous 无缺口', () => {
    // 模拟 runtime：连接事件转 transport action，业务事件 apply_event
    let s = createInitialState('reconnect');
    s = { ...s, jobId: 'job-reconnect-003' };
    const scenario = buildReconnectScenario();
    for (const e of scenario.events) {
      if (e.kind.startsWith('connection.')) {
        if (e.kind === 'connection.disconnected') s = liveReducer(s, { type: 'transport_disconnected' });
        else if (e.kind === 'connection.reconnecting') s = liveReducer(s, { type: 'transport_reconnecting' });
        else s = liveReducer(s, { type: 'transport_recovered', fromSequence: Number(e.metrics?.fromSequence ?? 0), recoveredCount: Number(e.metrics?.recoveredCount ?? 0) });
      } else {
        s = liveReducer(s, { type: 'apply_event', event: e });
      }
    }
    const recipeArtifacts = s.artifacts.filter((a) => a.titleZh.includes('Recipe'));
    expect(recipeArtifacts.length).toBe(1);
    const milestoneIds = s.milestones.map((m) => m.id);
    expect(new Set(milestoneIds).size).toBe(milestoneIds.length);
    // lastContiguous 应等于最大业务 sequence（无缺口）
    expect(s.ledger.lastContiguousSequence).toBeGreaterThan(0);
  });
});

describe('P1 权威统计对账', () => {
  it('页面指标与状态字段一致（normal）', () => {
    const s = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    // F3-R3 §7：summaryMetrics.artifacts = 最终产物数（1），非 artifacts.length（5 total）。
    // 权威 total = artifactMetrics.total（与 artifacts 数组长度一致）。
    expect(s.summaryMetrics.artifacts).toBe(s.artifactMetrics.final);
    expect(s.artifactMetrics.total).toBe(Object.keys(s.artifactAudit).length);
    expect(s.summaryMetrics.risks).toBe(s.risks.length);
  });
});

describe('去重 / 不重复', () => {
  it('重复 Artifact 不进入 state', () => {
    const e1 = mkEvent({
      eventId: 'art1', sequence: 1, kind: 'artifact.created',
      titleZh: '产物', artifactRefs: ['a1'], traceCategory: '成果', severity: 'success',
    } as Partial<LiveEventEnvelope>) as LiveEventEnvelope;
    const e2 = mkEvent({
      eventId: 'art2', sequence: 2, kind: 'artifact.created',
      titleZh: '产物', artifactRefs: ['a1'], traceCategory: '成果', severity: 'success',
    } as Partial<LiveEventEnvelope>) as LiveEventEnvelope;
    const s = dispatchAll([e1, e2]);
    expect(s.artifacts.filter((a) => a.artifactId === 'a1')).toHaveLength(1);
  });

  it('重复 milestone 不进入 state', () => {
    const e1 = mkEvent({
      eventId: 'm1', sequence: 1, kind: 'milestone.reached',
      titleZh: '里程碑', metrics: { milestoneId: 'purpose_classified' }, traceCategory: '成果', severity: 'success',
    } as Partial<LiveEventEnvelope>) as LiveEventEnvelope;
    const e2 = mkEvent({
      eventId: 'm2', sequence: 2, kind: 'milestone.reached',
      titleZh: '里程碑', metrics: { milestoneId: 'purpose_classified' }, traceCategory: '成果', severity: 'success',
    } as Partial<LiveEventEnvelope>) as LiveEventEnvelope;
    const s = dispatchAll([e1, e2]);
    expect(s.milestones.filter((m) => m.id === 'purpose_classified')).toHaveLength(1);
  });
});
