/**
 * Live Intelligence 选择器（纯函数，从归并态推导展示值）。
 * 组件只消费选择器，不直接重复计算业务状态（任务书 §七）。
 */

import type { LiveIntelligenceState } from './live-intelligence-state';
import type { ProgressInfo } from '@/types/live-event';

/** 已完成阶段数 / 总数（真实分母） */
export function selectStageProgress(s: LiveIntelligenceState) {
  const total = s.stageOrder.length;
  const done = s.stageOrder.filter((id) => {
    const st = s.stages[id].status;
    return st === 'completed' || st === 'awaiting_review';
  }).length;
  return { done, total };
}

/** 当前阶段（第一个非 completed） */
export function selectCurrentStage(s: LiveIntelligenceState) {
  const id = s.stageOrder.find((sid) => {
    const st = s.stages[sid].status;
    return st === 'active' || st === 'pending';
  });
  return id ? s.stages[id] : undefined;
}

/**
 * 当前进度模式（任务书 §九）：
 *   - 若当前阶段有 determinate progress → 显示真实百分比
 *   - 否则 indeterminate（只显示阶段名 + 已用时，禁止伪造百分比）
 */
export function selectProgressMode(s: LiveIntelligenceState): ProgressInfo {
  const current = selectCurrentStage(s);
  if (current?.progress && current.progress.total > 0) {
    return {
      mode: 'determinate',
      current: current.progress.current,
      total: current.progress.total,
      unitZh: current.progress.unitZh,
    };
  }
  // 阶段级 determinate：已完成阶段 / 总阶段（job 级粗粒度，真实分母）
  if (s.jobStatus === 'running' || s.jobStatus === 'awaiting_review') {
    const sp = selectStageProgress(s);
    if (sp.total > 0) {
      return { mode: 'determinate', current: sp.done, total: sp.total, unitZh: '个阶段' };
    }
  }
  return { mode: 'indeterminate' };
}

/** 最近 N 条关键事件（展开任务面板用） */
export function selectRecentTrace(s: LiveIntelligenceState, n = 3) {
  return s.trace.slice(-n).reverse();
}

/** 阶段节点列表（带中文标签与状态） */
export function selectStageNodes(s: LiveIntelligenceState) {
  return s.stageOrder.map((id) => ({
    id,
    status: s.stages[id].status,
    progress: s.stages[id].progress,
  }));
}

/** 连接状态中文（演示语义） */
export function selectConnectionZh(s: LiveIntelligenceState): {
  labelZh: string;
  tone: 'neutral' | 'amber' | 'green';
} {
  switch (s.connection) {
    case 'disconnected':
      return { labelZh: '实时事件已中断 · 保留当前结果', tone: 'amber' };
    case 'reconnecting':
      return { labelZh: '正在重连事件流', tone: 'amber' };
    case 'recovered':
      return {
        labelZh: s.recoveryInfo
          ? `已从第 ${s.recoveryInfo.fromSequence} 个事件后恢复 · 补齐 ${s.recoveryInfo.recoveredCount} 个事件`
          : '事件流已恢复',
        tone: 'green',
      };
    default:
      return { labelZh: '实时事件 · 演示', tone: 'neutral' };
  }
}

/** 任务终态中文 */
export function selectJobStatusZh(s: LiveIntelligenceState): string {
  switch (s.jobStatus) {
    case 'idle':
      return '待开始';
    case 'running':
      return '分析进行中';
    case 'completed':
      return '分析完成';
    case 'awaiting_review':
      return '分析完成 · 等待人工确认';
    case 'failed':
      return '分析失败';
  }
}

/** Creative Recipe 完成度百分比（真实分母 7 字段） */
export function selectRecipeCompleteness(s: LiveIntelligenceState): number {
  const fields = Object.values(s.recipe);
  const done = fields.filter(Boolean).length;
  return Math.round((done / fields.length) * 100);
}

/** 已用时间格式化 mm:ss */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
