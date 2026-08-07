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
  'qc.result.created': '质量检查',
  'cost.estimate.created': '成本',
  'cost.updated': '成本',
  'retry.scheduled': '重试',
  'retry.started': '重试',
  'retry.completed': '重试',
  'route.upgraded': '系统',
  'human.review.requested': '系统',
  'artifact.linked': '成果',
};

/** kind → 默认严重度 */
const KIND_TO_SEVERITY: Record<LiveEventKind, EventSeverity> = {
  'session.started': 'info',
  'stage.queued': 'info',
  'stage.started': 'info',
  'stage.progress': 'info',
  'stage.completed': 'success',
  'stage.failed': 'error',
  'stage.awaiting_review': 'warning',
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
  'qc.result.created': 'info',
  'cost.estimate.created': 'info',
  'cost.updated': 'info',
  'retry.scheduled': 'warning',
  'retry.started': 'info',
  'retry.completed': 'warning',
  'route.upgraded': 'warning',
  'human.review.requested': 'warning',
  'artifact.linked': 'success',
};

/**
 * 事件展示层（R1 §十：收敛客户轨迹）。
 *   ambient  只更新顶部状态栏 / 阶段轨道，不进入客户分析轨迹
 *   trace    进入客户分析轨迹
 *   both     既进轨迹又更新状态
 * 低价值系统事件（stage.queued / 普通 stage.progress / stage.started / stage.completed）
 * 默认只 ambient；高价值业务事件进 trace。
 */
export type EventSurface = 'ambient' | 'trace' | 'both';

const KIND_TO_SURFACE: Record<LiveEventKind, EventSurface> = {
  'session.started': 'both',
  'stage.queued': 'ambient',
  'stage.started': 'ambient',
  'stage.progress': 'ambient',
  'stage.completed': 'ambient',
  'stage.failed': 'trace',
  'stage.awaiting_review': 'trace',
  'observation.created': 'trace',
  'decision.created': 'trace',
  'evidence.created': 'trace',
  'warning.created': 'trace',
  'action.created': 'trace',
  'artifact.created': 'trace',
  'milestone.reached': 'trace',
  'connection.disconnected': 'trace',
  'connection.reconnecting': 'trace',
  'connection.recovered': 'trace',
  'job.completed': 'trace',
  'job.failed': 'trace',
  'qc.result.created': 'trace',
  'cost.estimate.created': 'trace',
  'cost.updated': 'trace',
  'retry.scheduled': 'trace',
  'retry.started': 'trace',
  'retry.completed': 'trace',
  'route.upgraded': 'trace',
  'human.review.requested': 'trace',
  'artifact.linked': 'trace',
};

/** 该事件是否应进入客户分析轨迹 */
export function shouldShowInTrace(kind: LiveEventKind): boolean {
  return KIND_TO_SURFACE[kind] !== 'ambient';
}

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
    case '质量检查':
      return { color: 'var(--gc-accent-green)', bg: 'var(--gc-accent-green-soft)' };
    case '成本':
      return { color: 'var(--gc-accent-blue)', bg: 'var(--gc-accent-blue-soft)' };
    case '重试':
      return { color: 'var(--gc-accent-amber)', bg: 'var(--gc-accent-amber-soft)' };
  }
}
