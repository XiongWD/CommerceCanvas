/**
 * F3-R1 Job Detail 投影层：从 LiveIntelligenceState + CompetitorAnalysisState 推导
 * "任务详情页面当前应显示什么"。
 *
 * R1 关键修复（reviewer 驳回点）：
 *   - 节点时间/attempt/发现数 只读权威 stageAudit（reducer 归并），不再扫 trace 猜测。
 *     原因：stage.* 多为 ambient 不进 trace，扫 trace 拿不到 startedAt/completedAt/attemptCount。
 *   - 节点状态输出中文（STAGE_STATUS_ZH），不直接显示 active/completed 英文。
 *   - Artifact 读权威 artifactAudit（含 lineage），不再错读 metrics.artifactRefs。
 *   - Retry 读权威 retryAttempts（归并键 stageId+attempt），3 个 lifecycle 事件只形成 1 个 attempt。
 *   - Route 读权威 routeUpgradeRecords（含成本+耗时+策略）。
 *   - findingsProduced 来自 stageAudit 真实计数，不再写死 0。
 *
 * 任务书 §七：展示只从归并态推导，禁止各组件各自维护状态（NG-024）。
 * 全部字段从 live（单一真实来源）推导；analysisData 提供 jobNameZh / sku 等元数据。
 */

import type {
  LiveIntelligenceState,
  TraceItem,
} from '@/features/live-intelligence/state/live-intelligence-state';
import { STAGE_LABEL_ZH } from '@/features/live-intelligence/state/live-intelligence-state';
import {
  selectStageProgress,
  selectCurrentStage,
  selectConnectionZh,
  selectJobStatusZh,
} from '@/features/live-intelligence/state/live-intelligence-selectors';
import type { CompetitorAnalysisState } from '@/types/competitor-analysis';
import {
  STAGE_STATUS_ZH,
  type StageId,
  type EvidenceRef,
} from '@/types/live-event';
import type {
  ArtifactProjection,
  CostSummaryProjection,
  HumanActionProjection,
  JobDetailProjection,
  JobNodeProjection,
  JobOverviewProjection,
  JobTimelineItem,
  QCResultProjection,
  RetryProjection,
  RouteUpgradeProjection,
} from '@/types/job-detail';
import type { QCStatus } from '@/types/live-event';

/** 把 metrics 字段安全读为 number */
function num(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** 把 metrics 字段安全读为 string */
function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  return String(v);
}

/** 把 metrics 字段安全读为 boolean */
function bool(v: unknown): boolean {
  return v === true;
}

/** QC 状态归一：仅允许 'pass' | 'warning' | 'block'，其余回退 'pass' */
function normalizeQCStatus(raw: unknown): QCStatus {
  if (raw === 'warning' || raw === 'block') return raw;
  return 'pass';
}

/** 单阶段风险状态：扫描 trace 中该阶段的 warning（普通）/ requiresAction（阻断） */
function deriveStageRiskStatus(
  live: LiveIntelligenceState,
  stageId: StageId,
): { riskStatus: 'none' | 'warning' | 'block'; hasWarning: boolean } {
  let hasWarning = false;
  let hasBlock = false;
  for (const t of live.trace) {
    if (t.stageId !== stageId) continue;
    if (t.kind === 'warning.created') {
      hasWarning = true;
      const metrics = t.metrics as Record<string, unknown> | undefined;
      if (metrics?.requiresAction === true || t.severity === 'error') hasBlock = true;
    }
  }
  // 阶段级显式 awaiting_review 视为阻断
  if (live.stages[stageId]?.status === 'awaiting_review') hasBlock = true;
  return {
    riskStatus: hasBlock ? 'block' : hasWarning ? 'warning' : 'none',
    hasWarning,
  };
}

/** 概览投影 */
function projectOverview(
  live: LiveIntelligenceState,
  analysis: CompetitorAnalysisState,
): JobOverviewProjection {
  const sp = selectStageProgress(live);
  const current = selectCurrentStage(live);
  return {
    jobNameZh: analysis.taskNameZh,
    jobId: live.jobId,
    sku: analysis.sku,
    status: selectJobStatusZh(live),
    currentStageId: current?.id,
    startedAt: live.trace[0]?.occurredAt ?? '',
    elapsedSeconds: live.elapsedSeconds,
    stageProgress: { done: sp.done, total: sp.total },
    imageProgress: { processed: live.processedImages, total: live.totalImages },
    findings: live.summaryMetrics.findings,
    risks: live.summaryMetrics.risks,
    // F3-R2 P0-2：使用唯一权威 artifactMetrics，不再用 summaryMetrics.artifacts（口径冲突）
    artifacts: live.artifactMetrics.total,
    requiresAction: live.requiresAction,
    connection: selectConnectionZh(live).labelZh,
  };
}

/**
 * 阶段节点投影（F3-R1：只读权威 stageAudit，不再扫 trace 猜测）。
 * - startedAt/completedAt/attemptCount/findingsProduced/artifactIds 全部来自 stageAudit。
 * - status 来自 live.stages（阶段状态机），经 STAGE_STATUS_ZH 映射为中文。
 */
function projectNodes(live: LiveIntelligenceState): JobNodeProjection[] {
  return live.stageOrder.map((stageId) => {
    const stage = live.stages[stageId];
    const audit = live.stageAudit[stageId];
    const nameZh = STAGE_LABEL_ZH[stageId] ?? stageId;
    const { riskStatus } = deriveStageRiskStatus(live, stageId);

    // 时间与尝试次数来自权威 audit state
    const startedAt = audit?.firstStartedAt;
    const completedAt = audit?.completedAt;
    // attemptCount：已开始的阶段至少 1（risk build_recipe 初始 + 1 retry = 2）
    let attemptCount = audit?.attemptCount ?? 0;
    if (attemptCount === 0 && stage.status !== 'pending') attemptCount = 1;

    // 已用时间：completedAt - firstStartedAt（若都存在）
    let elapsedSeconds: number | undefined;
    if (audit?.firstStartedAt && audit?.completedAt) {
      const start = Date.parse(audit.firstStartedAt);
      const end = Date.parse(audit.completedAt);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
        elapsedSeconds = Math.round((end - start) / 1000);
      }
    }

    const progressMode: string = audit?.progressMode ?? 'determinate';

    return {
      stageId,
      nameZh,
      // F3-R1 §三：客户模式显示中文状态，不显示英文 active/completed/awaiting_review
      status: STAGE_STATUS_ZH[stage.status] ?? stage.status,
      statusRaw: stage.status,
      startedAt,
      completedAt,
      elapsedSeconds,
      progressMode,
      attemptCount,
      // F3-R1：findingsProduced 来自权威 audit 真实计数，不再写死 0
      findingsProduced: audit?.findingsProduced ?? 0,
      artifactsProduced: audit?.artifactIds.slice() ?? [],
      riskStatus,
      awaitingReview: stage.status === 'awaiting_review',
    };
  });
}

/** 轨迹条目投影（直接映射 TraceItem，含 evidenceRefs 用于跨页定位） */
function projectTimeline(live: LiveIntelligenceState): JobTimelineItem[] {
  return live.trace.map((t: TraceItem) => ({
    sequence: t.sequence,
    occurredAt: t.occurredAt,
    category: t.category,
    titleZh: t.titleZh,
    summaryZh: t.summaryZh,
    severity: t.severity,
    evidenceRefs: t.evidenceRefs as EvidenceRef[] | undefined,
  }));
}

/**
 * 产物投影（F3-R1 / F3-R2 P0-1：读权威 artifactAudit，含 lineage 与真实 producer）。
 * 不再扫 trace 错读 metrics.artifactRefs；artifactAudit 由 reducer 归并 event.artifactRefs。
 * F3-R2 P0-1：producer 来自 producerStageId（仅 artifact.created 设置，linked 不覆盖）。
 */
function projectArtifacts(live: LiveIntelligenceState): ArtifactProjection[] {
  const records = Object.values(live.artifactAudit);
  // 按 producerSequence 排序，保证稳定展示顺序
  records.sort((a, b) => a.producerSequence - b.producerSequence);
  return records.map((a) => ({
    artifactId: a.artifactId,
    nameZh: a.nameZh,
    type: a.type,
    // F3-R2 P0-1：producer = 真实生产阶段（producerStageId），非 linked stage
    generatedByStage: a.producerStageId,
    role: a.role,
    createdAt: a.createdAt,
    status: a.status,
    version: a.version,
    // sourceEventId 必填非空（audit 记录在 reducer 中已保证）
    sourceEventId: a.sourceEventId,
    sourceSequence: a.sourceSequence,
    linkedAssetCount: a.linkedAssetIds.length,
    parentArtifactIds: a.parentArtifactIds.slice(),
    previewable: true,
  }));
}

/**
 * QC 结果投影（扫 qc.result.created 事件，保留 sourceEventId/sourceSequence/evidenceRefs）。
 * F3-R1 §五：qcReview 必须是 boolean（reducer 已接收 boolean，不再 string）。
 */
function projectQCResults(live: LiveIntelligenceState): QCResultProjection[] {
  const out: QCResultProjection[] = [];
  for (const t of live.trace) {
    if (t.kind !== 'qc.result.created') continue;
    const m = (t.metrics ?? {}) as Record<string, unknown>;
    const id = str(m.qcId);
    if (!id) continue;
    out.push({
      id,
      nameZh: str(m.qcName) ?? t.titleZh,
      status: normalizeQCStatus(m.qcStatus),
      targetZh: str(m.qcTarget) ?? '',
      reasonZh: str(m.qcReason) || undefined,
      evidenceCount: num(m.qcEvidence) ?? 0,
      sourceEventId: t.eventId,
      sourceSequence: t.sequence,
      evidenceRefs: t.evidenceRefs as EvidenceRef[] | undefined,
      requiresReview: bool(m.qcReview),
    });
  }
  return out;
}

/** 成本汇总投影（累积 cost.estimate.created + cost.updated） */
function projectCostSummary(live: LiveIntelligenceState): CostSummaryProjection {
  let estimatedCents = 0;
  let actualCents = 0;
  let deltaCents = 0;
  let hasEvents = false;
  for (const t of live.trace) {
    if (t.kind !== 'cost.estimate.created' && t.kind !== 'cost.updated') continue;
    hasEvents = true;
    const m = (t.metrics ?? {}) as Record<string, unknown>;
    const est = num(m.estimatedCents);
    const act = num(m.actualCents);
    const delta = num(m.deltaCents);
    if (est !== undefined) estimatedCents = est;
    if (act !== undefined) actualCents = act;
    if (delta !== undefined) deltaCents += delta;
  }
  if (deltaCents === 0 && hasEvents) {
    deltaCents = actualCents - estimatedCents;
  }
  return { estimatedCents, actualCents, deltaCents, currency: 'USD', hasEvents };
}

/**
 * 重试记录投影（F3-R1 §六：读权威 retryAttempts，归并键 stageId+attempt）。
 * 一次 lifecycle(scheduled→started→completed) 只形成 1 个 attempt，不再 3 事件当 3 次。
 */
function projectRetryRecords(live: LiveIntelligenceState): RetryProjection[] {
  const attempts = Object.values(live.retryAttempts);
  attempts.sort((a, b) => a.sourceSequence - b.sourceSequence);
  return attempts.map((a) => ({
    key: a.key,
    stageId: a.stageId,
    attempt: a.attempt,
    maxAttempts: a.maxAttempts,
    reasonZh: a.reasonZh,
    reasonCode: a.reasonCode,
    scheduledAt: a.scheduledAt,
    startedAt: a.startedAt,
    completedAt: a.completedAt,
    status: a.status,
    sourceSequence: a.sourceSequence,
  }));
}

/**
 * 路由升级投影（F3-R1 §七：读权威 routeUpgradeRecords，含成本+耗时+策略）。
 * 不能只显示成本。
 */
function projectRouteUpgrades(live: LiveIntelligenceState): RouteUpgradeProjection[] {
  return live.routeUpgradeRecords.map((r) => ({
    fromStrategy: r.fromStrategy,
    toStrategy: r.toStrategy,
    reasonZh: r.reasonZh,
    costDeltaCents: r.costDeltaCents,
    timeDeltaSeconds: r.timeDeltaSeconds,
    sourceEventId: r.sourceEventId,
    sourceSequence: r.sourceSequence,
  }));
}

/** 人工动作投影（扫描 human.review.requested，含 requiresAction 事件） */
function projectHumanActions(live: LiveIntelligenceState): HumanActionProjection[] {
  const out: HumanActionProjection[] = [];
  for (const t of live.trace) {
    if (t.kind === 'human.review.requested' || (t.metrics as { requiresAction?: unknown } | undefined)?.requiresAction === true) {
      out.push({
        titleZh: t.titleZh,
        summaryZh: t.summaryZh,
        requiresAction: true,
        sequence: t.sequence,
      });
    }
  }
  return out;
}

/**
 * 推导 Job Detail 页面投影。
 * 全部字段从 live（单一真实来源）推导；analysisData 提供 jobNameZh / sku 等元数据。
 */
export function projectJobDetail(
  live: LiveIntelligenceState,
  analysisData: CompetitorAnalysisState,
): JobDetailProjection {
  return {
    overview: projectOverview(live, analysisData),
    nodes: projectNodes(live),
    timelineItems: projectTimeline(live),
    artifacts: projectArtifacts(live),
    // F3-R2 P0-2：唯一权威 artifactMetrics，与 Overview / Persistent Task / Audit 同源
    artifactMetrics: live.artifactMetrics,
    qcResults: projectQCResults(live),
    costSummary: projectCostSummary(live),
    retryRecords: projectRetryRecords(live),
    routeUpgrades: projectRouteUpgrades(live),
    humanActions: projectHumanActions(live),
  };
}
