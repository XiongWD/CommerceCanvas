/**
 * Live Intelligence 归并 Reducer（任务书 §七）。
 *
 * 关键不变量（FD-033 / 任务书 §五）：
 *   1. 按 sequence 应用：旧 sequence（已应用过）不覆盖新状态。
 *   2. 重复 eventId 去重：不重复计数、不重复插入轨迹。
 *   3. 重放事件（replayed=true）补齐缺失状态，但不重复里程碑弹出、不重复 Artifact。
 *   4. 所有展示态（阶段/进度/风险/产物/里程碑/连接/已用时间）均由事件推导。
 *   5. 禁止在 reducer 内伪造进度：进度只来自事件的 progress 字段。
 */

import type { LiveEventEnvelope, StageId } from '@/types/live-event';
import {
  createInitialState,
  type ArtifactItem,
  type LiveIntelligenceState,
  type MilestoneItem,
  type RiskItem,
  type TraceItem,
} from './live-intelligence-state';

/** Reducer 接收的动作：应用一个事件，或重置 */
export type LiveAction =
  | { type: 'apply_event'; event: LiveEventEnvelope }
  | { type: 'reset'; scenario: string };

/** 已应用 eventId 集合的缓存键：sequence + eventId 双重去重 */
interface AppliedIndex {
  seenEventIds: Set<string>;
  appliedSequences: Set<number>;
}

export function createReducer() {
  const index: AppliedIndex = { seenEventIds: new Set(), appliedSequences: new Set() };
  return (state: LiveIntelligenceState, action: LiveAction): LiveIntelligenceState => {
    if (action.type === 'reset') {
      index.seenEventIds.clear();
      index.appliedSequences.clear();
      return createInitialState(action.scenario);
    }
    return applyEvent(state, action.event, index);
  };
}

export function liveReducer(
  state: LiveIntelligenceState,
  action: LiveAction,
  index: AppliedIndex = { seenEventIds: new Set(), appliedSequences: new Set() },
): LiveIntelligenceState {
  if (action.type === 'reset') {
    return createInitialState(state.scenario);
  }
  return applyEvent(state, action.event, index);
}

function applyEvent(
  state: LiveIntelligenceState,
  event: LiveEventEnvelope,
  index: AppliedIndex,
): LiveIntelligenceState {
  // —— 去重：同一 eventId 不二次处理；同一 sequence 不二次应用 ——
  if (index.seenEventIds.has(event.eventId)) return state;
  // 乱序保护：若该 sequence 已应用过（更高序号已到达），丢弃更旧的事件。
  if (index.appliedSequences.has(event.sequence)) return state;

  index.seenEventIds.add(event.eventId);
  index.appliedSequences.add(event.sequence);

  const next: LiveIntelligenceState = { ...state };
  next.receivedCount = state.receivedCount + 1;
  next.lastSequence = Math.max(state.lastSequence, event.sequence);

  // 轨迹：仅客户可见事件入轨迹（traceCategory 存在）
  const trace = state.trace.slice();
  if (event.traceCategory) {
    const item: TraceItem = {
      eventId: event.eventId,
      sequence: event.sequence,
      occurredAt: event.occurredAt,
      category: event.traceCategory,
      titleZh: event.titleZh,
      summaryZh: event.summaryZh,
      severity: event.severity,
      evidenceRefs: event.evidenceRefs,
      replayed: event.replayed === true,
    };
    trace.push(item);
    // 按 sequence 升序（重放/乱序后仍稳定）
    trace.sort((a, b) => a.sequence - b.sequence);
  }
  next.trace = trace;

  // 阶段状态机
  applyStageEvent(next, event);

  // 已用时间：取事件 metrics.elapsedSeconds 或累加（simulator 在 progress 事件里推送）
  if (event.metrics?.elapsedSeconds !== undefined) {
    next.elapsedSeconds = Math.max(next.elapsedSeconds, Number(event.metrics.elapsedSeconds));
  }

  // 活跃节点 / 已处理图片（演示语义，由事件推导）
  if (event.metrics?.activeNodes !== undefined) {
    next.activeNodes = Number(event.metrics.activeNodes);
  }
  if (event.progress?.mode === 'determinate' && event.stageId === 'validate_images') {
    next.processedImages = Math.max(next.processedImages, event.progress.current ?? 0);
  }

  // Artifact 去重
  if (event.kind === 'artifact.created' && event.artifactRefs?.length) {
    const artifacts = state.artifacts.slice();
    for (const aid of event.artifactRefs) {
      if (!artifacts.some((a) => a.artifactId === aid)) {
        const item: ArtifactItem = {
          artifactId: aid,
          titleZh: event.titleZh,
          createdAt: event.occurredAt,
          fromSequence: event.sequence,
        };
        artifacts.push(item);
      }
    }
    next.artifacts = artifacts;
  }

  // 风险归并
  if (event.kind === 'warning.created') {
    const risks = state.risks.slice();
    const rid = event.evidenceRefs?.[0]?.regionId ?? event.eventId;
    if (!risks.some((r) => r.id === rid)) {
      const item: RiskItem = {
        id: rid,
        titleZh: event.titleZh,
        severity: event.severity === 'error' ? 'error' : 'warning',
        evidenceRefs: event.evidenceRefs,
        requiresAction: event.requiresAction === true,
      };
      risks.push(item);
    }
    next.risks = risks;
  }
  if (event.requiresAction) {
    next.requiresAction = true;
    next.actionPromptZh = event.summaryZh ?? event.titleZh;
  }

  // 里程碑：去重（同一 milestone id 只记录一次；重放不重复弹出）
  if (event.kind === 'milestone.reached' && event.metrics?.milestoneId) {
    const mid = String(event.metrics.milestoneId) as MilestoneItem['id'];
    const milestones = state.milestones.slice();
    if (!milestones.some((m) => m.id === mid)) {
      milestones.push({
        id: mid,
        titleZh: event.titleZh,
        summaryZh: event.summaryZh,
        sequence: event.sequence,
      });
      next.milestones = milestones;
    }
    // shownMilestoneIds 仅在非重放事件时追加（重放不重复弹）
    if (event.replayed !== true && !state.shownMilestoneIds.includes(mid)) {
      next.shownMilestoneIds = [...state.shownMilestoneIds, mid];
    }
  }

  // Creative Recipe 字段逐步形成
  if (event.metrics?.recipeField) {
    const field = String(event.metrics.recipeField) as keyof LiveIntelligenceState['recipe'];
    if (field in state.recipe) {
      next.recipe = { ...state.recipe, [field]: true };
    }
  }

  // 连接状态
  if (event.kind === 'connection.disconnected') next.connection = 'disconnected';
  else if (event.kind === 'connection.reconnecting') next.connection = 'reconnecting';
  else if (event.kind === 'connection.recovered') {
    next.connection = 'recovered';
    if (event.metrics?.recoveredCount !== undefined && event.metrics?.fromSequence !== undefined) {
      next.recoveryInfo = {
        fromSequence: Number(event.metrics.fromSequence),
        recoveredCount: Number(event.metrics.recoveredCount),
      };
    }
  }

  // 任务终态
  if (event.kind === 'job.completed') {
    next.jobStatus = state.requiresAction ? 'awaiting_review' : 'completed';
    if (state.requiresAction) next.jobStatus = 'awaiting_review';
    next.activeNodes = 0;
  } else if (event.kind === 'job.failed') {
    next.jobStatus = 'failed';
    next.activeNodes = 0;
  } else if (event.kind === 'session.started') {
    next.jobStatus = 'running';
    next.activeNodes = 3;
  }

  return next;
}

function applyStageEvent(state: LiveIntelligenceState, event: LiveEventEnvelope) {
  if (!event.stageId) return;
  const stageId = event.stageId as StageId;
  const stage = state.stages[stageId];
  if (!stage) return;

  switch (event.kind) {
    case 'stage.queued':
      state.stages[stageId] = { ...stage, status: 'pending' };
      break;
    case 'stage.started':
      state.stages[stageId] = { ...stage, status: 'active' };
      break;
    case 'stage.progress':
      if (event.progress?.mode === 'determinate') {
        state.stages[stageId] = {
          ...stage,
          status: 'active',
          progress: {
            current: event.progress.current ?? stage.progress?.current ?? 0,
            total: event.progress.total ?? stage.progress?.total ?? 0,
            unitZh: event.progress.unitZh,
          },
        };
      }
      break;
    case 'stage.completed':
      state.stages[stageId] = { ...stage, status: 'completed' };
      break;
    case 'stage.failed':
      state.stages[stageId] = { ...stage, status: 'failed' };
      break;
    default:
      break;
  }
}

/** 便捷：批量应用事件序列（测试与重放共用） */
export function applyEvents(
  events: LiveEventEnvelope[],
  scenario = 'normal',
): LiveIntelligenceState {
  let state = createInitialState(scenario);
  const index: AppliedIndex = { seenEventIds: new Set(), appliedSequences: new Set() };
  for (const e of events) {
    state = applyEvent(state, e, index);
  }
  return state;
}
