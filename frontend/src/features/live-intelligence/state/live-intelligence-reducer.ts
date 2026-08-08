/**
 * Live Intelligence 归并 Reducer（R1 完全重写）。
 *
 * R1 修复的关键不变量：
 *   1. 去重索引属于状态（state.ledger），不是默认参数或闭包 → 真实 React 与测试同一路径。
 *   2. 有序缓冲：1→3→2 时，3 暂存；2 到达后先应用 2 再 flush 3。lastContiguousSequence 无缺口。
 *   3. 旧事件不回退阶段：已 completed 的阶段不被迟到的 stage.started 改回 active。
 *   4. 纯函数 + 完全不可变：每次返回新对象，绝不修改入参 state（stages/数组/ledger 均新建）。
 *   5. 连接状态用独立 transport action，不占用业务 sequence。
 *   6. 业务统计（summaryMetrics）由明确事件更新，不从轨迹条数反推。
 */

import type { CompetitorResultRefs, LiveEventEnvelope, StageId, StageStatus, MilestoneId } from '@/types/live-event';
import type {
  StageAuditState,
  ArtifactAuditRecord,
  RetryAttemptState,
  RouteUpgradeRecord,
  ArtifactMetrics,
} from '@/types/live-event';
import { shouldShowInTrace } from '../mappings/event-presentation-map';
import {
  createInitialState,
  RECIPE_FIELDS,
  type LiveIntelligenceState,
  type TraceItem,
  type RecipeProgress,
  type EntityEvidenceEntry,
} from './live-intelligence-state';

/** 传输事件（R1.1 P0-1）：独立于业务 sequence，但仍进入客户分析轨迹） */
export interface TransportEvent {
  eventId: string;
  occurredAt: string;
  kind: 'connection.disconnected' | 'connection.reconnecting' | 'connection.recovered';
  titleZh: string;
  summaryZh?: string;
  fromSequence?: number;
  recoveredCount?: number;
}

/** Reducer 动作：业务事件 + 独立传输信号（F2 §3.1：保留原 eventId/occurredAt） + 重置 */
export type LiveAction =
  | { type: 'apply_event'; event: LiveEventEnvelope }
  | {
      type: 'transport_disconnected';
      eventId: string;
      occurredAt: string;
    }
  | {
      type: 'transport_reconnecting';
      eventId: string;
      occurredAt: string;
    }
  | {
      type: 'transport_recovered';
      eventId: string;
      occurredAt: string;
      fromSequence: number;
      recoveredCount: number;
    }
  | { type: 'apply_transport_event'; event: TransportEvent }
  | { type: 'reset'; scenario: string; jobId: string };

/**
 * 单一 reducer，用于 useReducer 与 applyEvents（测试）。
 * 无默认参数、无闭包；去重信息全部来自 state.ledger。
 */
export function liveReducer(state: LiveIntelligenceState, action: LiveAction): LiveIntelligenceState {
  switch (action.type) {
    case 'reset':
      // R1.1：runId 递增（restart 语义），里程碑展示会话键 = jobId + runId
      return { ...createInitialState(action.scenario), jobId: action.jobId, runId: state.runId + 1 };
    case 'transport_disconnected':
      return applyTransport(state, {
        eventId: action.eventId,
        occurredAt: action.occurredAt,
        kind: 'connection.disconnected',
        titleZh: '实时事件连接中断，已保留当前结果',
      });
    case 'transport_reconnecting':
      return applyTransport(state, {
        eventId: action.eventId,
        occurredAt: action.occurredAt,
        kind: 'connection.reconnecting',
        titleZh: '正在重连事件流',
      });
    case 'transport_recovered':
      return applyTransport(state, {
        eventId: action.eventId,
        occurredAt: action.occurredAt,
        kind: 'connection.recovered',
        titleZh: `已从第 ${action.fromSequence} 个事件后恢复 · 补齐 ${action.recoveredCount} 个事件`,
        summaryZh: '任务继续执行，事件不重复',
        fromSequence: action.fromSequence,
        recoveredCount: action.recoveredCount,
      });
    case 'apply_transport_event':
      return applyTransport(state, action.event);
    case 'apply_event':
      return ingestEvent(state, action.event);
  }
}

/**
 * 应用传输事件（R1.1 P0-1）：
 *   - 更新 connection / recoveryInfo
 *   - 向 trace 追加一条「系统」记录（客户可见）
 *   - 按 eventId 去重（ledger.seenEventIds）
 *   - 不修改业务 ledger.lastContiguousSequence / pendingBySequence
 */
function applyTransport(state: LiveIntelligenceState, ev: TransportEvent): LiveIntelligenceState {
  // 按 eventId 去重
  if (state.ledger.seenEventIds[ev.eventId]) return state;
  const seen = { ...state.ledger.seenEventIds, [ev.eventId]: true };

  let connection = state.connection;
  let recoveryInfo = state.recoveryInfo;
  if (ev.kind === 'connection.disconnected') connection = 'disconnected';
  else if (ev.kind === 'connection.reconnecting') connection = 'reconnecting';
  else if (ev.kind === 'connection.recovered') {
    connection = 'recovered';
    recoveryInfo = {
      fromSequence: ev.fromSequence ?? 0,
      recoveredCount: ev.recoveredCount ?? 0,
    };
  }

  const item: TraceItem = {
    eventId: ev.eventId,
    sequence: 0, // 传输事件不占业务 sequence；用 occurredAt 排序在业务事件之后
    occurredAt: ev.occurredAt,
    category: '系统',
    titleZh: ev.titleZh,
    summaryZh: ev.summaryZh,
    severity: ev.kind === 'connection.recovered' ? 'success' : 'warning',
    replayed: false,
  };
  const trace = state.trace.concat(item);

  return {
    ...state,
    connection,
    recoveryInfo,
    trace,
    ledger: { ...state.ledger, seenEventIds: seen },
  };
}

/**
 * 摄入一个事件：去重 → 有序缓冲 → 连续应用 → 不可变返回。
 */
function ingestEvent(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  const ledger = state.ledger;

  // —— 去重：同一 eventId 或同一 sequence 已处理过 → 直接返回原状态 ——
  if (ledger.seenEventIds[event.eventId]) return state;
  // 同 sequence 二次到达（不同 eventId）也算重复，不应用
  // （已应用或已在 pending 中）
  const seqInPending = ledger.pendingBySequence[event.sequence] !== undefined;
  const seqApplied = event.sequence <= ledger.lastContiguousSequence;
  if (seqApplied || seqInPending) {
    // 仍标记 eventId 已见，避免再次进入
    return {
      ...state,
      ledger: {
        ...ledger,
        seenEventIds: { ...ledger.seenEventIds, [event.eventId]: true },
      },
    };
  }

  // —— 有序缓冲：若该 sequence 不是下一个期望的连续序号，暂存 ——
  const expected = ledger.lastContiguousSequence + 1;
  let working: LiveIntelligenceState = state;

  if (event.sequence !== expected) {
    // 缺口：暂存到 pending，等待中间序号到达
    const pending = { ...ledger.pendingBySequence, [event.sequence]: event };
    const seen = { ...ledger.seenEventIds, [event.eventId]: true };
    return {
      ...state,
      receivedCount: state.receivedCount + 1,
      ledger: { ...ledger, seenEventIds: seen, pendingBySequence: pending },
    };
  }

  // 该事件是下一个连续序号 → 应用，然后尝试 flush pending
  // 收集本次需要连续应用的事件序列（从 event 开始，连带 pending 中后续）
  const toApply: LiveEventEnvelope[] = [event];
  let cursor = event.sequence + 1;
  // 拷贝 pending（稍后移除已应用的）
  const pendingCopy = { ...ledger.pendingBySequence };
  while (pendingCopy[cursor] !== undefined) {
    toApply.push(pendingCopy[cursor]);
    delete pendingCopy[cursor];
    cursor += 1;
  }

  // 标记 eventId 已见
  const seen: Record<string, boolean> = { ...ledger.seenEventIds };
  for (const e of toApply) {
    seen[e.eventId] = true;
  }

  // 起始 working state：浅拷贝顶层 + 已更新 ledger 的 pending 部分
  // receivedCount 累加本次摄入（含 pending 暂存的那次已在上面 +1 过；这里要补正：
  // 实际上 event 这一次还没计入 receivedCount，pending 中被 flush 的也没计入过。
  // 为避免重复，统一在 applyOne 内不增 receivedCount，在此处统一计 toApply.length）。
  // 注意：若 event 曾进入 pending 分支再被 flush，上面 pending 分支已 +1；
  // 但当前路径 event 是首次到达且连续，未 +1，pending 内的事件在被暂存时已 +1。
  // 为简化与正确，这里按"本次新应用的事件数"修正 receivedCount：
  //   新到达 event：+1（pending 中 flush 的在暂存时已 +1，不重复）
  // 所以只对 event 本身 +1。
  const receivedDelta = 1;

  working = {
    ...state,
    ledger: {
      seenEventIds: seen,
      pendingBySequence: pendingCopy,
      lastContiguousSequence: ledger.lastContiguousSequence,
    },
    receivedCount: state.receivedCount + receivedDelta,
  };

  for (const e of toApply) {
    working = applyOneImmutable(working, e);
    // 推进连续游标
    working = {
      ...working,
      ledger: { ...working.ledger, lastContiguousSequence: e.sequence },
    };
  }

  return working;
}

/**
 * 把单个事件合并进状态（不可变：所有变更均新建对象/数组）。
 * 调用方负责 sequence 连续性与去重。
 */
function applyOneImmutable(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  let next: LiveIntelligenceState = { ...state };

  // —— 轨迹：仅客户可见事件入轨迹（surface !== 'ambient'）——
  if (event.traceCategory && shouldShowInTrace(event.kind)) {
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
      // F3：携带原始 kind/stageId/metrics，供 Job Detail 投影层扫描
      kind: event.kind,
      stageId: event.stageId,
      metrics: event.metrics,
    };
    const trace = state.trace.concat(item);
    trace.sort((a, b) => a.sequence - b.sequence);
    next.trace = trace;
  }

  // —— 阶段状态机（不可变：新建 stages）——
  if (event.stageId) {
    next = applyStageImmutable(next, event);
  }

  // —— 已用时间 ——
  if (event.metrics?.elapsedSeconds !== undefined) {
    next.elapsedSeconds = Math.max(next.elapsedSeconds, Number(event.metrics.elapsedSeconds));
  }
  // 活跃节点 / 已处理图片
  if (event.metrics?.activeNodes !== undefined) {
    next.activeNodes = Number(event.metrics.activeNodes);
  }
  if (event.progress?.mode === 'determinate' && event.stageId === 'validate_images') {
    next.processedImages = Math.max(next.processedImages, event.progress.current ?? 0);
  }

  // —— Artifact 去重 ——
  if (event.kind === 'artifact.created' && event.artifactRefs?.length) {
    const artifacts = state.artifacts.slice();
    for (const aid of event.artifactRefs) {
      if (!artifacts.some((a) => a.artifactId === aid)) {
        artifacts.push({
          artifactId: aid,
          titleZh: event.titleZh,
          createdAt: event.occurredAt,
          fromSequence: event.sequence,
        });
      }
    }
    next.artifacts = artifacts;
  }

  // —— 风险归并 ——
  if (event.kind === 'warning.created') {
    const risks = state.risks.slice();
    const rid = event.evidenceRefs?.[0]?.regionId ?? event.eventId;
    if (!risks.some((r) => r.id === rid)) {
      risks.push({
        id: rid,
        titleZh: event.titleZh,
        severity: event.severity === 'error' ? 'error' : 'warning',
        evidenceRefs: event.evidenceRefs,
        requiresAction: event.requiresAction === true,
      });
    }
    next.risks = risks;
  }
  if (event.requiresAction) {
    next.requiresAction = true;
    next.actionPromptZh = event.summaryZh ?? event.titleZh;
  }

  // —— 里程碑：去重（同一 milestone id 只记录一次；重放不重复弹）——
  if (event.kind === 'milestone.reached' && event.metrics?.milestoneId) {
    const mid = String(event.metrics.milestoneId) as MilestoneId;
    if (!state.milestones.some((m) => m.id === mid)) {
      next.milestones = state.milestones.concat({
        id: mid,
        titleZh: event.titleZh,
        summaryZh: event.summaryZh,
        sequence: event.sequence,
      });
    }
    // shownMilestoneIds 按 jobId#runId 分组（R1.1：runId 递增后可重显相同里程碑）
    if (event.replayed !== true) {
      const sessionKey = `${state.jobId || 'default'}#${state.runId}`;
      const shown = state.shownMilestoneIds[sessionKey] ?? [];
      if (!shown.includes(mid)) {
        next.shownMilestoneIds = {
          ...state.shownMilestoneIds,
          [sessionKey]: shown.concat(mid),
        };
      }
    }
  }

  // —— Creative Recipe 字段（recipeFields 数组，逐字段标记）——
  if (event.metrics?.recipeFields && Array.isArray(event.metrics.recipeFields)) {
    const recipe = { ...state.recipe };
    for (const f of event.metrics.recipeFields) {
      if ((RECIPE_FIELDS as readonly string[]).includes(String(f))) {
        recipe[f as keyof RecipeProgress] = true;
      }
    }
    next.recipe = recipe;
  } else if (event.metrics?.recipeField) {
    // 兼容旧单字段
    const f = String(event.metrics.recipeField);
    if ((RECIPE_FIELDS as readonly string[]).includes(f)) {
      next.recipe = { ...state.recipe, [f as keyof RecipeProgress]: true };
    }
  }

  // —— F2-R1.1：累积事件 resultRefs（按 category 合并去重，供投影层读取）——
  if (event.resultRefs) {
    const acc: CompetitorResultRefs = {
      ...(next.resultRefsAccumulated ??
        createInitialState('').resultRefsAccumulated),
    };
    for (const key of Object.keys(event.resultRefs) as (keyof CompetitorResultRefs)[]) {
      const incoming = event.resultRefs[key];
      if (!incoming || !Array.isArray(incoming)) continue;
      const existing = new Set(acc[key] ?? []);
      for (const id of incoming) existing.add(id);
      acc[key] = [...existing];
    }
    next.resultRefsAccumulated = acc;

    // 同步维护 entityEvidence：每个结果 ID 记录其所有来源事件
    const evidence: Record<string, EntityEvidenceEntry[]> = {};
    for (const [id, entries] of Object.entries(next.entityEvidence)) {
      evidence[id] = entries.slice();
    }
    for (const key of Object.keys(event.resultRefs) as (keyof CompetitorResultRefs)[]) {
      const incoming = event.resultRefs[key];
      if (!incoming || !Array.isArray(incoming)) continue;
      for (const id of incoming) {
        const entry: EntityEvidenceEntry = {
          category: key,
          sourceEventId: event.eventId,
          sequence: event.sequence,
          evidenceRefs: event.evidenceRefs,
        };
        const existing = evidence[id];
        // 去重：同一事件对同一实体不重复记录
        if (existing && existing.some((e) => e.sourceEventId === entry.sourceEventId)) {
          continue;
        }
        evidence[id] = existing ? existing.concat(entry) : [entry];
      }
    }
    next.entityEvidence = evidence;
  }

  // —— 权威业务统计（由明确事件更新，不从轨迹反推）——
  if (event.metrics?.findings !== undefined) {
    next.summaryMetrics = { ...next.summaryMetrics, findings: Number(event.metrics.findings) };
  }
  if (event.metrics?.risks !== undefined) {
    next.summaryMetrics = { ...next.summaryMetrics, risks: Number(event.metrics.risks) };
  }
  if (event.metrics?.artifacts !== undefined) {
    // F3-R3 §7：metrics.artifacts 语义 = 最终产物数（= artifactMetrics.final），非 total。
    // 不再与 artifacts.length 取 max（那是 total 口径，会造成 final vs total 语义冲突）。
    // 权威 total 由 state.artifactMetrics 维护，Overview/Task/Audit 全部读 artifactMetrics。
    next.summaryMetrics = { ...next.summaryMetrics, artifacts: Number(event.metrics.artifacts) };
  }
  if (event.metrics?.blockingConflicts !== undefined) {
    next.summaryMetrics = { ...next.summaryMetrics, blockingConflicts: Number(event.metrics.blockingConflicts) };
  }
  // risks.length 与 summaryMetrics.risks 对账：始终以 max 同步
  // （artifacts 不再对账，避免 final vs total 口径冲突）
  next.summaryMetrics = {
    ...next.summaryMetrics,
    risks: Math.max(next.summaryMetrics.risks, next.risks.length),
  };

  // ===== F3-R1 审计态归并（权威来源，Job Detail 只读这些，不再扫 trace 猜测） =====
  next = applyStageAudit(next, event);
  next = applyArtifactAudit(next, event);
  next = applyRetryAttempt(next, event);
  next = applyRouteUpgrade(next, event);
  // F3-R2 P0-2：artifactAudit 变更后同步派生唯一权威 artifactMetrics
  if (next.artifactAudit !== state.artifactAudit) {
    next.artifactMetrics = deriveArtifactMetrics(next.artifactAudit);
  }

  // —— 任务终态 ——
  if (event.kind === 'job.completed') {
    next.jobStatus = next.requiresAction ? 'awaiting_review' : 'completed';
    next.activeNodes = 0;
  } else if (event.kind === 'job.failed') {
    next.jobStatus = 'failed';
    next.activeNodes = 0;
  } else if (event.kind === 'session.started') {
    next.jobStatus = 'running';
    next.activeNodes = 3;
    if (event.jobId) next.jobId = event.jobId;
  }

  return next;
}

/**
 * F3-R2 P0-2：从 artifactAudit 派生唯一权威 Artifact Metrics。
 * 所有展示产物数量的地方必须读这里的结果，不得各自 count。
 *   total       = artifactAudit 长度
 *   intermediate = role === 'intermediate'
 *   final        = role === 'final'
 */
function deriveArtifactMetrics(audit: Record<string, ArtifactAuditRecord>): ArtifactMetrics {
  const records = Object.values(audit);
  let intermediate = 0;
  let final = 0;
  for (const r of records) {
    if (r.role === 'final') final += 1;
    else intermediate += 1;
  }
  return { total: records.length, intermediate, final };
}

/**
 * F3-R1 §二：阶段审计态归并。
 * 把 stage.queued/started/progress/completed/awaiting_review/failed 与 retry.* 归并到 stageAudit。
 * 客户 trace 继续降噪（stage.* 多为 ambient），但 Job Detail 节点只读 stageAudit，不扫 trace。
 *
 * 关键契约（risk 场景）：
 *   build_recipe 初始执行 + 1 次 retry → attemptCount = 2
 */
function applyStageAudit(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  if (!event.stageId) {
    // 无阶段事件不更新 stageAudit（但发现数可能影响全局，此处只处理有 stageId 的）
    // 仍允许 observation/decision/evidence.created 无 stageId 时不更新
    return state;
  }
  const stageId = event.stageId as StageId;
  const audit = state.stageAudit[stageId];
  if (!audit) return state;

  let updated: StageAuditState | null = null;
  const touch = () => {
    if (!updated) updated = {
      ...audit,
      artifactIds: audit.artifactIds.slice(),
      sourceEventIds: audit.sourceEventIds.slice(),
      sourceSequences: audit.sourceSequences.slice(),
    };
  };

  // F3-R2 P0-4：归属该 stage 的真实事件累计（去重）
  // 任何带 stageId 的事件都算该 stage 的 source event（包括 retry.*）
  if (!audit.sourceEventIds.includes(event.eventId)) {
    touch();
    updated!.sourceEventIds.push(event.eventId);
    if (!updated!.sourceSequences.includes(event.sequence)) {
      updated!.sourceSequences.push(event.sequence);
    }
  }

  switch (event.kind) {
    case 'stage.started': {
      touch();
      updated!.attemptCount += 1;
      if (!updated!.firstStartedAt) updated!.firstStartedAt = event.occurredAt;
      updated!.lastStartedAt = event.occurredAt;
      updated!.progressMode = event.progress?.mode === 'indeterminate' ? 'indeterminate' : 'determinate';
      if (event.progress?.mode === 'determinate') {
        updated!.progress = {
          current: event.progress.current ?? 0,
          total: event.progress.total ?? 0,
          unitZh: event.progress.unitZh,
        };
      }
      break;
    }
    case 'stage.progress': {
      touch();
      updated!.lastStartedAt = updated!.lastStartedAt ?? event.occurredAt;
      updated!.progressMode = event.progress?.mode === 'indeterminate' ? 'indeterminate' : 'determinate';
      if (event.progress?.mode === 'determinate') {
        updated!.progress = {
          current: event.progress.current ?? updated!.progress?.current ?? 0,
          total: event.progress.total ?? updated!.progress?.total ?? 0,
          unitZh: event.progress.unitZh,
        };
      }
      break;
    }
    case 'stage.completed':
    case 'stage.awaiting_review':
    case 'stage.failed': {
      touch();
      if (!updated!.completedAt) updated!.completedAt = event.occurredAt;
      break;
    }
    case 'retry.started': {
      // retry.started 也算一次 attempt（首次 stage.started 已 +1，retry 再 +1）
      // 但首次 started 已经计数；为避免重复，只在 attempt 已>0 时根据 metrics.attempt 校正
      touch();
      const m = (event.metrics ?? {}) as Record<string, unknown>;
      const attemptNum = typeof m.attempt === 'number' ? m.attempt : updated!.attemptCount + 1;
      updated!.attemptCount = Math.max(updated!.attemptCount, attemptNum + 1);
      updated!.lastStartedAt = event.occurredAt;
      break;
    }
    default:
      break;
  }

  // 发现数：observation/decision/evidence.created 在该阶段产出
  if (
    event.stageId &&
    (event.kind === 'observation.created' ||
      event.kind === 'decision.created' ||
      event.kind === 'evidence.created')
  ) {
    touch();
    updated!.findingsProduced += 1;
  }

  // 该阶段产出的 artifact（来自 artifact.created 的 artifactRefs —— 注意：是 event.artifactRefs，非 metrics）
  if (event.kind === 'artifact.created' && event.artifactRefs?.length) {
    touch();
    for (const aid of event.artifactRefs) {
      if (!updated!.artifactIds.includes(aid)) updated!.artifactIds.push(aid);
    }
  }

  if (!updated) return state;
  return { ...state, stageAudit: { ...state.stageAudit, [stageId]: updated } };
}

/**
 * F3-R1 §四 / F3-R2 P0-1：Artifact 审计记录归并。
 *
 * F3-R2 P0-1 关键修复：
 *   producer（生产）vs linked（关联）必须区分。
 *   - artifact.created 才设置 producerStageId / producerEventId / role。
 *     producer 由真正生成/定稿该 Artifact 的事件决定。
 *   - artifact.linked 只追加 linkedAssetIds / parentArtifactIds（lineage 衍生关系），
 *     绝不覆盖 producerStageId / producerEventId / role。
 *   - 若 artifact.linked 先于 artifact.created 到达（仅 producer 未定），producer 暂为 undefined，
 *     后续 artifact.created 到达时补齐。
 *
 * role 语义：intermediate（中间产物）/ final（最终产物）。
 *   默认：type === 'Creative Recipe' 或 metrics.artifactRole === 'final' → final；否则 intermediate。
 */
function applyArtifactAudit(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  const m = (event.metrics ?? {}) as Record<string, unknown>;

  if (event.kind === 'artifact.created' && event.artifactRefs?.length) {
    const audit = { ...state.artifactAudit };
    const typeZh = typeof m.artifactType === 'string' ? m.artifactType : 'creative_recipe';
    const version = typeof m.version === 'string' ? m.version : 'v1';
    const statusZh = typeof m.artifactStatus === 'string' ? m.artifactStatus : '已生成';
    const parents = Array.isArray(m.parentArtifactIds) ? (m.parentArtifactIds as string[]) : [];
    const linked = Array.isArray(m.linkedAssetIds) ? (m.linkedAssetIds as string[]) : [];
    // role：优先 metrics.artifactRole，否则 type==='Creative Recipe' → final，否则 intermediate
    const role: 'intermediate' | 'final' =
      m.artifactRole === 'final' ? 'final' :
      m.artifactRole === 'intermediate' ? 'intermediate' :
      typeZh === 'Creative Recipe' ? 'final' : 'intermediate';
    for (const aid of event.artifactRefs) {
      const existing = audit[aid];
      if (existing) {
        // artifact.created 到达但记录已存在（可能由先前 linked 创建）：
        // 补齐 producer（linked 不可覆盖 producer，但 created 才是权威生产事件）
        audit[aid] = {
          ...existing,
          producerStageId: existing.producerStageId ?? event.stageId,
          producerEventId: existing.producerEventId || event.eventId,
          producerSequence: existing.producerSequence || event.sequence,
          // created 权威覆盖 nameZh/type/status（生产语义优先于 linked）
          nameZh: event.titleZh,
          type: typeZh,
          status: statusZh,
          role,
        };
      } else {
        const rec: ArtifactAuditRecord = {
          artifactId: aid,
          nameZh: event.titleZh,
          type: typeZh,
          producerStageId: event.stageId,
          producerEventId: event.eventId,
          producerSequence: event.sequence,
          createdAt: event.occurredAt,
          sourceEventId: event.eventId,
          sourceSequence: event.sequence,
          version,
          role,
          linkedAssetIds: linked.slice(),
          parentArtifactIds: parents.slice(),
          status: statusZh,
        };
        audit[aid] = rec;
      }
    }
    return { ...state, artifactAudit: audit };
  }

  if (event.kind === 'artifact.linked' && event.artifactRefs?.length) {
    const audit = { ...state.artifactAudit };
    const linked = Array.isArray(m.linkedAssetIds) ? (m.linkedAssetIds as string[]) : [];
    const parents = Array.isArray(m.parentArtifactIds) ? (m.parentArtifactIds as string[]) : [];
    for (const aid of event.artifactRefs) {
      const existing = audit[aid];
      if (existing) {
        // linked 只追加 lineage，不覆盖 producer / role（F3-R2 P0-1 核心）
        const mergedLinked = [...existing.linkedAssetIds];
        for (const l of linked) if (!mergedLinked.includes(l)) mergedLinked.push(l);
        const mergedParents = [...existing.parentArtifactIds];
        for (const p of parents) if (!mergedParents.includes(p)) mergedParents.push(p);
        audit[aid] = { ...existing, linkedAssetIds: mergedLinked, parentArtifactIds: mergedParents };
      } else {
        // artifact.linked 先于 created 到达：producer 暂为 undefined（待 created 补齐）
        // 不设 producerEventId（空串表示未定），让 created 后续补齐
        audit[aid] = {
          artifactId: aid,
          nameZh: typeof m.artifactName === 'string' ? m.artifactName : aid,
          type: typeof m.artifactType === 'string' ? m.artifactType : 'linked',
          producerStageId: undefined,
          producerEventId: '',
          producerSequence: 0,
          createdAt: event.occurredAt,
          sourceEventId: event.eventId,
          sourceSequence: event.sequence,
          version: typeof m.version === 'string' ? m.version : 'v1',
          role: 'intermediate',
          linkedAssetIds: linked.slice(),
          parentArtifactIds: parents.slice(),
          status: '已链接',
        };
      }
    }
    return { ...state, artifactAudit: audit };
  }

  return state;
}

/**
 * F3-R1 §六：重试尝试归并。
 * 一次 retry.scheduled → retry.started → retry.completed 属于一个 attempt（归并键 stageId+attempt），
 * 不是三条重试。risk 场景必须 retryAttempts.length === 1 且 build_recipe.attemptCount === 2。
 */
function applyRetryAttempt(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  if (!event.kind.startsWith('retry.')) return state;
  const m = (event.metrics ?? {}) as Record<string, unknown>;
  const stageId = event.stageId;
  const attempt = typeof m.attempt === 'number' ? m.attempt : 1;
  const maxAttempts = typeof m.maxAttempts === 'number' ? m.maxAttempts : 3;
  const reasonCode = typeof m.reasonCode === 'string' ? m.reasonCode : 'UNKNOWN';
  const reasonZh = typeof m.reasonZh === 'string' ? m.reasonZh : event.titleZh;
  const key = stageId ? `${stageId}#${attempt}` : `#${attempt}`;

  const existing = state.retryAttempts[key];
  const base: RetryAttemptState = existing ?? {
    key,
    stageId,
    attempt,
    maxAttempts,
    reasonCode,
    reasonZh,
    status: 'scheduled',
    sourceSequence: event.sequence,
  };

  const updated: RetryAttemptState = { ...base };
  if (event.kind === 'retry.scheduled') {
    updated.status = 'scheduled';
    updated.scheduledAt = event.occurredAt;
    if (!existing) updated.sourceSequence = event.sequence;
  } else if (event.kind === 'retry.started') {
    updated.status = 'started';
    updated.startedAt = event.occurredAt;
    if (!existing) updated.sourceSequence = event.sequence;
  } else if (event.kind === 'retry.completed') {
    updated.status = 'completed';
    updated.completedAt = event.occurredAt;
    if (!existing) updated.sourceSequence = event.sequence;
  }

  return {
    ...state,
    retryAttempts: { ...state.retryAttempts, [key]: updated },
  };
}

/**
 * F3-R1 §七：路由升级记录归并。
 * 必须含 from/to 策略 + 中文原因 + 成本影响 + 耗时影响（不能只显示成本）。
 */
function applyRouteUpgrade(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  if (event.kind !== 'route.upgraded') return state;
  const m = (event.metrics ?? {}) as Record<string, unknown>;
  const rec: RouteUpgradeRecord = {
    fromStrategy: typeof m.fromStrategy === 'string' ? m.fromStrategy : '',
    toStrategy: typeof m.toStrategy === 'string' ? m.toStrategy : '',
    reasonZh: typeof m.reasonZh === 'string' ? m.reasonZh : event.summaryZh ?? event.titleZh,
    costDeltaCents: typeof m.estimatedCostDeltaCents === 'number' ? m.estimatedCostDeltaCents : undefined,
    timeDeltaSeconds: typeof m.estimatedTimeDeltaSeconds === 'number' ? m.estimatedTimeDeltaSeconds : undefined,
    sourceEventId: event.eventId,
    sourceSequence: event.sequence,
  };
  return { ...state, routeUpgradeRecords: [...state.routeUpgradeRecords, rec] };
}

/**
 * 阶段状态机（不可变）。旧事件不回退阶段：
 *   已 completed/awaiting_review 的阶段，迟到的 stage.started/queued 不改回 active/pending。
 */
function applyStageImmutable(state: LiveIntelligenceState, event: LiveEventEnvelope): LiveIntelligenceState {
  const stageId = event.stageId as StageId;
  const stage = state.stages[stageId];
  if (!stage) return state;

  const noRollback = (s: StageStatus) => s === 'completed' || s === 'awaiting_review' || s === 'failed';

  let newStatus: StageStatus = stage.status;
  let newProgress = stage.progress;

  switch (event.kind) {
    case 'stage.queued':
      if (!noRollback(stage.status)) newStatus = 'pending';
      break;
    case 'stage.started':
      if (!noRollback(stage.status)) newStatus = 'active';
      break;
    case 'stage.progress':
      if (!noRollback(stage.status)) {
        newStatus = 'active';
        if (event.progress?.mode === 'determinate') {
          newProgress = {
            current: event.progress.current ?? stage.progress?.current ?? 0,
            total: event.progress.total ?? stage.progress?.total ?? 0,
            unitZh: event.progress.unitZh,
          };
        }
      }
      break;
    case 'stage.completed':
      // completed 可从 active/pending 进入；已 awaiting_review/failed 不被覆盖
      if (stage.status !== 'awaiting_review' && stage.status !== 'failed') {
        newStatus = 'completed';
      }
      break;
    case 'stage.failed':
      newStatus = 'failed';
      break;
    default:
      break;
  }

  // 显式 awaiting_review 事件（risk 场景用）
  if (event.kind === 'stage.awaiting_review') {
    newStatus = 'awaiting_review';
  }

  // 仅当变化时才新建 stages 对象（不可变）
  if (newStatus === stage.status && newProgress === stage.progress) return state;

  const newStage = { ...stage, status: newStatus };
  if (newProgress !== stage.progress) newStage.progress = newProgress;
  const stages = { ...state.stages, [stageId]: newStage };
  return { ...state, stages };
}

/**
 * 便捷：批量应用事件序列（测试与"立即完成"演示）。
 * 使用与 useReducer 完全相同的 liveReducer，确保同一归并路径。
 */
export function applyEvents(events: LiveEventEnvelope[], scenario = 'normal'): LiveIntelligenceState {
  let state: LiveIntelligenceState = createInitialState(scenario);
  for (const e of events) {
    state = liveReducer(state, { type: 'apply_event', event: e });
  }
  return state;
}
