/**
 * 场景 C：断线恢复与事件重放（R1 重写：符合 Last-Event-ID 语义）。
 *
 * 流程：
 *   正常收到业务事件 sequence 1–18
 *   → transport disconnected（不占业务 sequence）
 *   → transport reconnecting
 *   → transport recovered(fromSequence=18, recoveredCount=4)
 *   → 重放缺失事件 sequence 19–22（保留原 eventId 和原 sequence，replayed=true）
 *   → sequence 23 起继续正常实时事件（replayed=false）
 *   → 完成
 *
 * 关键契约：
 *   - 所有业务事件 jobId = job-reconnect-003（与场景 jobId 一致）
 *   - 连接状态用独立 transport 信号（runtime 转换，不计入业务 sequence）
 *   - exactly 4 个 replayed 事件（19–22）
 *   - 23 以后 replayed=false
 *   - Artifact / 里程碑不重复（reducer 去重）
 *
 * 实现：基于 normal 场景事件序列，覆盖 jobId，在 sequence 18 之后插入连接三联
 *       （由 runtime 的 isTransportEvent 识别并转为 transport 信号），
 *       并把 sequence 19–22 标记 replayed=true。
 *       连接三联事件的 sequence 用负数占位（runtime 会转 transport，不进 ledger）。
 */

import type { LiveEventEnvelope } from '@/types/live-event';
import type { ScenarioScript } from './event-simulator';
import { buildNormalScenario } from './scenario-normal';

const RECONNECT_JOB_ID = 'job-reconnect-003';
const DISCONNECT_AFTER = 18;
const REPLAY_GAP = 4; // 缺失 4 个事件（19–22）

export function buildReconnectScenario(): ScenarioScript {
  const base = buildNormalScenario();
  // 1. 覆盖所有业务事件 jobId 为 reconnect jobId
  const events = base.events.map((e) => ({ ...e, jobId: RECONNECT_JOB_ID }));

  const before = events.filter((e) => e.sequence <= DISCONNECT_AFTER);
  const replayed = events
    .filter((e) => e.sequence > DISCONNECT_AFTER && e.sequence <= DISCONNECT_AFTER + REPLAY_GAP)
    .map((e) => ({ ...e, replayed: true }));
  const after = events
    .filter((e) => e.sequence > DISCONNECT_AFTER + REPLAY_GAP)
    .map((e) => ({ ...e, replayed: false }));

  // 连接三联：用负数 sequence（runtime 转为 transport，不进业务 ledger）
  // recovered 携带 fromSequence=18, recoveredCount=4
  const transport: LiveEventEnvelope[] = [
    {
      ...events[0],
      eventId: 'reconnect-disconnect',
      sequence: -1,
      kind: 'connection.disconnected',
      severity: 'warning',
      traceCategory: '系统',
      titleZh: '实时事件连接中断，已保留当前结果',
      summaryZh: '已完成的分析阶段与证据不会丢失',
      stageId: undefined,
      progress: undefined,
      evidenceRefs: undefined,
      artifactRefs: undefined,
      metrics: { elapsedSeconds: 24 },
    },
    {
      ...events[0],
      eventId: 'reconnect-reconnecting',
      sequence: -2,
      kind: 'connection.reconnecting',
      severity: 'warning',
      traceCategory: '系统',
      titleZh: '正在重连事件流',
      summaryZh: '将根据最后序号恢复缺失事件',
      stageId: undefined,
      metrics: { elapsedSeconds: 25 },
    },
    {
      ...events[0],
      eventId: 'reconnect-recovered',
      sequence: -3,
      kind: 'connection.recovered',
      severity: 'success',
      traceCategory: '系统',
      titleZh: `已从第 ${DISCONNECT_AFTER} 个事件后恢复 · 补齐 ${REPLAY_GAP} 个事件`,
      summaryZh: '任务继续执行，事件不重复',
      stageId: undefined,
      metrics: {
        fromSequence: DISCONNECT_AFTER,
        recoveredCount: REPLAY_GAP,
        elapsedSeconds: 27,
      },
    },
  ];

  return {
    scenarioId: 'reconnect',
    jobId: RECONNECT_JOB_ID,
    events: [...before, ...transport, ...replayed, ...after],
  };
}
