/**
 * 场景 C：断线恢复与事件重放（任务书 §六）。
 *
 * 模拟流程：
 *   事件正常到达（前 N 个）
 *   → 连接中断（disconnected）
 *   → UI 保留已完成结果
 *   → 正在重连（reconnecting）
 *   → 从最后 sequence 恢复（recovered，携带 fromSequence / recoveredCount）
 *   → 重放缺失事件（replayed=true，不重复里程碑/Artifact）
 *   → 继续完成
 *
 * 用户必须能看到：
 *   "实时事件连接中断，已保留当前结果"
 *   "正在从第 18 个事件后恢复"
 *   "已恢复 4 个缺失事件，任务继续执行"
 *
 * 实现：基于 normal 场景事件序列，在第 18 个事件后插入连接中断三联事件，
 *       然后把后续事件标记 replayed=true 重新发出。
 */

import type { LiveEventEnvelope } from '@/types/live-event';
import type { ScenarioScript } from './event-simulator';
import { buildNormalScenario } from './scenario-normal';

export function buildReconnectScenario(): ScenarioScript {
  const base = buildNormalScenario();
  const events = base.events;

  // 断点：在第 18 个事件（sequence 18）之后中断。
  // 重定义为 disconnect 场景的 jobId。
  const disconnectAt = 18;
  const before = events.filter((e) => e.sequence <= disconnectAt);
  const missing = events.filter((e) => e.sequence > disconnectAt);

  // 构造连接三联事件（用新的 sequence 段，避免与 base 冲突）。
  // sequence 从 base 最大值 +1 开始。
  let nextSeq = events[events.length - 1].sequence + 1;

  const connectionTriple: LiveEventEnvelope[] = [
    {
      ...cloneShell(events[0], nextSeq++),
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
      ...cloneShell(events[0], nextSeq++),
      kind: 'connection.reconnecting',
      severity: 'warning',
      traceCategory: '系统',
      titleZh: '正在重连事件流',
      summaryZh: '将根据最后序号恢复缺失事件',
      stageId: undefined,
      metrics: { elapsedSeconds: 25 },
    },
    {
      ...cloneShell(events[0], nextSeq++),
      kind: 'connection.recovered',
      severity: 'success',
      traceCategory: '系统',
      titleZh: `已从第 ${disconnectAt} 个事件后恢复 · 补齐 ${missing.length} 个事件`,
      summaryZh: '任务继续执行，事件不重复',
      stageId: undefined,
      metrics: {
        fromSequence: disconnectAt,
        recoveredCount: missing.length,
        elapsedSeconds: 27,
      },
    },
  ];

  // 缺失事件重放：标记 replayed=true，并重新分配 sequence（继续递增），
  // eventId 保持原值——这样 reducer 的 eventId 去重 + sequence 去重双重生效，
  // 即使 base 事件曾经到达也不会重复计数（实际上 base 后半段未到达，所以会正常补齐）。
  const replayed: LiveEventEnvelope[] = missing.map((e, i) => ({
    ...e,
    sequence: nextSeq + i,
    replayed: true,
  }));

  return {
    scenarioId: 'reconnect',
    jobId: 'job-reconnect-003',
    events: [...before, ...connectionTriple, ...replayed],
  };
}

function cloneShell(template: LiveEventEnvelope, sequence: number) {
  return {
    eventId: `evt-r-${String(sequence).padStart(3, '0')}`,
    sequence,
    occurredAt: template.occurredAt,
    jobId: template.jobId,
  };
}
