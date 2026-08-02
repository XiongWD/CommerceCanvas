/**
 * 事件 → 中文展示映射层（Presentation Mapper）。
 *
 * 依据：FD-035 / NG-022 / deployment-boundaries §9.4。
 * 内部英文 kind/stageId 永不直接展示给客户；客户只看中文标题/说明/轨迹类型。
 * 模拟器构造事件时调用本映射，把解析好的中文填入 titleZh/summaryZh/traceCategory。
 */

import type {
  LiveEventEnvelope,
  LiveEventKind,
  TraceCategoryZh,
  EventSeverity,
} from '@/types/live-event';

/** 事件 kind → 客户可见中文轨迹类型（任务书 §8.2 七类） */
const KIND_TO_CATEGORY: Partial<Record<LiveEventKind, TraceCategoryZh>> = {
  'observation.created': '发现',
  'decision.created': '判断',
  'evidence.created': '证据',
  'warning.created': '风险',
  'action.created': '动作',
  'artifact.created': '成果',
  'milestone.reached': '成果',
  'session.started': '系统',
  'stage.queued': '系统',
  'stage.started': '系统',
  'stage.progress': '系统',
  'stage.completed': '系统',
  'stage.failed': '系统',
  'connection.disconnected': '系统',
  'connection.reconnecting': '系统',
  'connection.recovered': '系统',
  'job.completed': '系统',
  'job.failed': '系统',
};

/** kind → 默认严重度 */
const KIND_TO_SEVERITY: Record<LiveEventKind, EventSeverity> = {
  'session.started': 'info',
  'stage.queued': 'info',
  'stage.started': 'info',
  'stage.progress': 'info',
  'stage.completed': 'success',
  'stage.failed': 'error',
  'observation.created': 'info',
  'decision.created': 'info',
  'evidence.created': 'info',
  'warning.created': 'warning',
  'action.created': 'info',
  'artifact.created': 'success',
  'milestone.reached': 'success',
  'connection.disconnected': 'warning',
  'connection.reconnecting': 'warning',
  'connection.recovered': 'success',
  'job.completed': 'success',
  'job.failed': 'error',
};

/** 给一个原始事件骨架补全中文展示字段（模拟器构造事件时调用） */
export function withPresentation(
  partial: Omit<LiveEventEnvelope, 'severity' | 'traceCategory'> & {
    severity?: EventSeverity;
    traceCategory?: TraceCategoryZh;
  },
): LiveEventEnvelope {
  const kind = partial.kind;
  return {
    ...partial,
    severity: partial.severity ?? KIND_TO_SEVERITY[kind],
    traceCategory: partial.traceCategory ?? KIND_TO_CATEGORY[kind],
  };
}

/** 轨迹类型 → 颜色调（Graphite Canvas，FD-027） */
export function categoryTone(c: TraceCategoryZh): {
  color: string;
  bg: string;
} {
  switch (c) {
    case '发现':
      return { color: 'var(--gc-accent-blue)', bg: 'var(--gc-accent-blue-soft)' };
    case '判断':
      return { color: 'var(--gc-accent-purple)', bg: 'var(--gc-accent-purple-soft)' };
    case '证据':
      return { color: 'var(--gc-accent-blue)', bg: 'var(--gc-accent-blue-soft)' };
    case '风险':
      return { color: 'var(--gc-accent-amber)', bg: 'var(--gc-accent-amber-soft)' };
    case '动作':
      return { color: 'var(--gc-text-mid)', bg: 'var(--gc-bg-elev-2)' };
    case '成果':
      return { color: 'var(--gc-accent-green)', bg: 'var(--gc-accent-green-soft)' };
    case '系统':
      return { color: 'var(--gc-text-lo)', bg: 'var(--gc-bg-elev-1)' };
  }
}
