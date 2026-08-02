/**
 * Reducer / 场景确定性 / 去重 / 乱序 / 重放 自动测试。
 * 覆盖任务书 §十三要求的真实逻辑（非静态渲染）。
 */
import { describe, it, expect } from 'vitest';
import { applyEvents } from './live-intelligence-reducer';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildRiskScenario } from '../simulator/scenario-risk';
import { buildReconnectScenario } from '../simulator/scenario-reconnect';
import type { LiveEventEnvelope } from '@/types/live-event';

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

describe('reducer: sequence 应用', () => {
  it('按 sequence 正确应用，lastSequence 跟随', () => {
    const s = applyEvents([
      mkEvent({ eventId: 'a', sequence: 1 }),
      mkEvent({ eventId: 'b', sequence: 2 }),
      mkEvent({ eventId: 'c', sequence: 3 }),
    ]);
    expect(s.receivedCount).toBe(3);
    expect(s.lastSequence).toBe(3);
  });
});

describe('reducer: 重复 eventId 去重', () => {
  it('同一 eventId 不重复计数、不重复插入轨迹', () => {
    const dup = mkEvent({ eventId: 'dup', sequence: 1, titleZh: '重复' });
    const s = applyEvents([dup, dup]);
    expect(s.receivedCount).toBe(1);
    expect(s.trace.filter((t) => t.eventId === 'dup')).toHaveLength(1);
  });
});

describe('reducer: 旧 sequence 不覆盖新状态', () => {
  it('已应用的 sequence 二次到达被丢弃', () => {
    const s = applyEvents([
      mkEvent({ eventId: 'a', sequence: 1 }),
      mkEvent({ eventId: 'b', sequence: 2 }),
      // 故意用新 eventId 但旧 sequence
      mkEvent({ eventId: 'c-old', sequence: 1, titleZh: '旧序号' }),
    ]);
    expect(s.receivedCount).toBe(2);
    expect(s.trace.some((t) => t.eventId === 'c-old')).toBe(false);
  });
});

describe('场景 A 正常完成：确定性 + 终态', () => {
  it('同一场景两次 build 事件序列完全一致', () => {
    const a = buildNormalScenario();
    const b = buildNormalScenario();
    expect(a.events.map((e) => e.eventId)).toEqual(b.events.map((e) => e.eventId));
    expect(a.events.map((e) => e.sequence)).toEqual(b.events.map((e) => e.sequence));
  });

  it('全部应用后终态为 completed，阶段全部完成', () => {
    const s = applyEvents(buildNormalScenario().events, 'normal');
    expect(s.jobStatus).toBe('completed');
    for (const id of s.stageOrder) {
      // build_recipe 在 normal 中完成
      expect(s.stages[id].status).toBe('completed');
    }
    expect(s.artifacts.length).toBeGreaterThanOrEqual(1);
  });

  it('包含里程碑与 24 项发现等业务计数', () => {
    const events = buildNormalScenario().events;
    const hasMilestone = events.some((e) => e.kind === 'milestone.reached');
    const completion = events.find((e) => e.kind === 'job.completed');
    expect(hasMilestone).toBe(true);
    expect(completion?.metrics?.findings).toBe(24);
  });
});

describe('场景 B 高风险：终态为 awaiting_review', () => {
  it('最终状态为 awaiting_review，非全绿 completed', () => {
    const s = applyEvents(buildRiskScenario().events, 'risk');
    expect(s.jobStatus).toBe('awaiting_review');
    expect(s.requiresAction).toBe(true);
  });

  it('确定性：两次 build 一致', () => {
    const a = buildRiskScenario();
    const b = buildRiskScenario();
    expect(a.events.length).toBe(b.events.length);
    expect(a.events.map((e) => e.sequence)).toEqual(b.events.map((e) => e.sequence));
  });
});

describe('场景 C 断线恢复：重放不重复', () => {
  it('包含 disconnected/reconnecting/recovered 三联', () => {
    const events = buildReconnectScenario().events;
    expect(events.some((e) => e.kind === 'connection.disconnected')).toBe(true);
    expect(events.some((e) => e.kind === 'connection.reconnecting')).toBe(true);
    expect(events.some((e) => e.kind === 'connection.recovered')).toBe(true);
  });

  it('重放事件标记 replayed=true', () => {
    const events = buildReconnectScenario().events;
    const replayed = events.filter((e) => e.replayed === true);
    expect(replayed.length).toBeGreaterThan(0);
  });

  it('全部应用后：Artifact 不重复（recipe 草案只 1 个），里程碑不重复', () => {
    const s = applyEvents(buildReconnectScenario().events, 'reconnect');
    const recipeArtifacts = s.artifacts.filter((a) => a.titleZh.includes('Recipe'));
    // reconnect 基于 normal，正常场景只产 1 个 recipe artifact；重放不重复
    expect(recipeArtifacts.length).toBe(1);
    // 4 个里程碑各只 1 次
    expect(s.milestones.length).toBe(4);
    const ids = s.milestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('断线期间已有阶段结果保留（前 18 事件已到达，阶段已完成）', () => {
    const events = buildReconnectScenario().events;
    const beforeDisconnect = events.filter((e) => e.sequence <= 18);
    const s = applyEvents(beforeDisconnect, 'reconnect');
    // 前 18 事件已包含若干阶段完成
    expect(s.trace.length).toBeGreaterThan(0);
    expect(s.receivedCount).toBe(18);
  });
});

describe('里程碑去重显示', () => {
  it('同一 milestone id 即使事件二次到达也只记录一次', () => {
    const e1 = mkEvent({
      eventId: 'm1', sequence: 1, kind: 'milestone.reached',
      titleZh: '用途识别完成', metrics: { milestoneId: 'purpose_classified' },
    } as Partial<LiveEventEnvelope>);
    const e2 = mkEvent({
      eventId: 'm1-dup-seq', sequence: 2, kind: 'milestone.reached',
      titleZh: '用途识别完成', metrics: { milestoneId: 'purpose_classified' },
    } as Partial<LiveEventEnvelope>);
    const s = applyEvents([e1 as LiveEventEnvelope, e2 as LiveEventEnvelope]);
    expect(s.milestones.filter((m) => m.id === 'purpose_classified')).toHaveLength(1);
  });
});

describe('进度模式：determinate vs indeterminate', () => {
  it('determinate 进度携带真实 current/total', () => {
    const s = applyEvents([
      mkEvent({
        eventId: 'p1', sequence: 1, kind: 'stage.started',
        stageId: 'validate_images', titleZh: '开始',
      } as Partial<LiveEventEnvelope>),
      mkEvent({
        eventId: 'p2', sequence: 2, kind: 'stage.progress',
        stageId: 'validate_images', titleZh: '进度',
        progress: { mode: 'determinate', current: 8, total: 12, unitZh: '张' },
      } as Partial<LiveEventEnvelope>),
    ] as unknown as LiveEventEnvelope[]);
    expect(s.stages.validate_images.progress?.total).toBe(12);
  });

  it('indeterminate 不携带百分比分母', () => {
    const s = applyEvents([
      mkEvent({
        eventId: 'i1', sequence: 1, kind: 'stage.progress',
        stageId: 'extract_composition', titleZh: '不确定进度',
        progress: { mode: 'indeterminate' },
      } as Partial<LiveEventEnvelope>),
    ] as unknown as LiveEventEnvelope[]);
    expect(s.stages.extract_composition.progress).toBeUndefined();
  });
});
