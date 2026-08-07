/**
 * F3 Job Detail 投影层：从 LiveIntelligenceState + CompetitorAnalysisState 推导
 * "任务详情页面当前应显示什么"。
 *
 * 设计原则（与 competitor-analysis-projection 一致，任务书 §七）：
 *   - 展示只从归并态推导，禁止各组件各自维护状态（NG-024）。
 *   - QC / 成本 / 重试 / 路由升级 / 人工动作 全部从 live.trace 扫描（trace 已携带 kind/metrics）。
 *   - 真实分母 / 权威统计来自 live.summaryMetrics 与 live.stages，不从轨迹条数反推。
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
import type { StageId } from '@/types/live-event';
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
      // 阻断 = 该 warning 显式要求人工介入
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

/** 统计单阶段产出的产物 artifactId 列表（扫描 artifact.created 事件 stageId） */
function deriveStageArtifacts(live: LiveIntelligenceState, stageId: StageId): string[] {
  const ids: string[] = [];
  for (const t of live.trace) {
    if (t.stageId !== stageId) continue;
    if (t.kind !== 'artifact.created') continue;
    const metrics = t.metrics as Record<string, unknown> | undefined;
    const refs = metrics?.artifactRefs;
    if (Array.isArray(refs)) {
      for (const id of refs) if (typeof id === 'string') ids.push(id);
    }
  }
  return ids;
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
    artifacts: live.summaryMetrics.artifacts,
    requiresAction: live.requiresAction,
    connection: selectConnectionZh(live).labelZh,
  };
}

/** 阶段节点投影 */
function projectNodes(live: LiveIntelligenceState): JobNodeProjection[] {
  return live.stageOrder.map((stageId) => {
    const stage = live.stages[stageId];
    const nameZh = STAGE_LABEL_ZH[stageId] ?? stageId;
    const { riskStatus } = deriveStageRiskStatus(live, stageId);

    // startedAt / completedAt：扫描该阶段首条 stage.started 与首条 stage.completed
    let startedAt: string | undefined;
    let completedAt: string | undefined;
    let attemptCount = 0;
    for (const t of live.trace) {
      if (t.stageId !== stageId) continue;
      if (t.kind === 'stage.started') {
        attemptCount += 1;
        if (!startedAt) startedAt = t.occurredAt;
      }
      if (t.kind === 'stage.completed' && !completedAt) completedAt = t.occurredAt;
    }
    // stage.started 是 ambient（不进 trace），回退用 trace 中阶段首条事件时间
    if (!startedAt) {
      const first = live.trace.find((t) => t.stageId === stageId);
      if (first) startedAt = first.occurredAt;
    }
    // attemptCount 至少 1（若阶段已被触碰）
    if (attemptCount === 0 && stage.status !== 'pending') attemptCount = 1;

    const progressMode: string =
      stage.status === 'active' && !stage.progress ? 'indeterminate' : 'determinate';

    return {
      stageId,
      nameZh,
      status: stage.status,
      startedAt,
      completedAt,
      elapsedSeconds: undefined,
      progressMode,
      attemptCount,
      findingsProduced: 0,
      artifactsProduced: deriveStageArtifacts(live, stageId),
      riskStatus,
      awaitingReview: stage.status === 'awaiting_review',
    };
  });
}

/** 轨迹条目投影（直接映射 TraceItem） */
function projectTimeline(live: LiveIntelligenceState): JobTimelineItem[] {
  return live.trace.map((t: TraceItem) => ({
    sequence: t.sequence,
    occurredAt: t.occurredAt,
    category: t.category,
    titleZh: t.titleZh,
    summaryZh: t.summaryZh,
    severity: t.severity,
    evidenceRefs: t.evidenceRefs,
  }));
}

/** 产物投影（来自 live.artifacts，回填来源事件信息） */
function projectArtifacts(live: LiveIntelligenceState): ArtifactProjection[] {
  return live.artifacts.map((a) => {
    // 找到产生该 artifactId 的来源事件（artifact.created 且 refs 含 a.artifactId）
    const source = live.trace.find((t) => {
      if (t.kind !== 'artifact.created') return false;
      const metrics = t.metrics as Record<string, unknown> | undefined;
      const refs = metrics?.artifactRefs;
      return Array.isArray(refs) && refs.includes(a.artifactId);
    });
    return {
      artifactId: a.artifactId,
      nameZh: a.titleZh,
      type: 'creative_recipe',
      generatedByStage: source?.stageId,
      createdAt: a.createdAt,
      status: '已生成',
      version: 'v1',
      sourceEventId: source?.eventId ?? '',
      linkedAssetCount: 0,
      previewable: true,
    };
  });
}

/** QC 结果投影（扫描 qc.result.created） */
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
      sourceSequence: t.sequence,
      requiresReview: m.qcReview === true,
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
  // 若未显式给出 delta，则由估算/实际推导
  if (deltaCents === 0 && hasEvents) {
    deltaCents = actualCents - estimatedCents;
  }
  return { estimatedCents, actualCents, deltaCents, currency: 'USD', hasEvents };
}

/** 重试记录投影（扫描 retry.* 事件） */
function projectRetryRecords(live: LiveIntelligenceState): RetryProjection[] {
  const out: RetryProjection[] = [];
  for (const t of live.trace) {
    if (!t.kind?.startsWith('retry.')) continue;
    const m = (t.metrics ?? {}) as Record<string, unknown>;
    const attempt = num(m.attempt) ?? num(m.retryAttempt) ?? out.length + 1;
    const maxAttempts = num(m.maxAttempts) ?? 3;
    out.push({
      attempt,
      maxAttempts,
      reasonZh: str(m.reasonZh) ?? t.summaryZh ?? t.titleZh,
      reasonCode: str(m.reasonCode) ?? 'unknown',
      stageId: t.stageId,
      sequence: t.sequence,
    });
  }
  return out;
}

/** 路由升级投影（扫描 route.upgraded） */
function projectRouteUpgrades(live: LiveIntelligenceState): RouteUpgradeProjection[] {
  const out: RouteUpgradeProjection[] = [];
  for (const t of live.trace) {
    if (t.kind !== 'route.upgraded') continue;
    const m = (t.metrics ?? {}) as Record<string, unknown>;
    out.push({
      fromStrategy: str(m.fromStrategy) ?? '',
      toStrategy: str(m.toStrategy) ?? '',
      reasonZh: str(m.reasonZh) ?? t.summaryZh ?? t.titleZh,
      costDeltaCents: num(m.estimatedCostDeltaCents) ?? num(m.costDeltaCents),
      timeDeltaSeconds: num(m.estimatedTimeDeltaSeconds) ?? num(m.timeDeltaSeconds),
      sequence: t.sequence,
    });
  }
  return out;
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
    qcResults: projectQCResults(live),
    costSummary: projectCostSummary(live),
    retryRecords: projectRetryRecords(live),
    routeUpgrades: projectRouteUpgrades(live),
    humanActions: projectHumanActions(live),
  };
}
