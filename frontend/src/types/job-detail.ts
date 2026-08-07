/**
 * F3-R1 Job Detail — 投影层类型契约。
 *
 * 依据：
 *   FD-038  每个核心页面消费同一事件契约，做页面专属呈现
 *   任务书 §七  展示必须从归并态推导，禁止各组件各自维护状态（NG-024）
 *
 * R1 修复：节点/QC/Artifact/Retry/Route 字段全部来自 reducer 权威审计态，
 * 不再扫 trace 猜测。sourceEventId/sourceSequence 必填非空，便于对账与跨页定位。
 * 这些类型只是 Job Detail 页面投影结果的前端契约；
 * 全部字段从 LiveIntelligenceState（单一真实来源）推导，不引入新业务状态。
 */

import type { EvidenceRef, StageStatus } from '@/types/live-event';

/** 任务总览（顶部 Header） */
export interface JobOverviewProjection {
  jobNameZh: string;
  jobId: string;
  sku: string;
  /** 来自 live.jobStatus，经中文映射层展示 */
  status: string;
  currentStageId?: string;
  startedAt: string;
  elapsedSeconds: number;
  stageProgress: { done: number; total: number };
  imageProgress: { processed: number; total: number };
  findings: number;
  risks: number;
  artifacts: number;
  requiresAction: boolean;
  connection: string;
}

/** 单个阶段节点（阶段轨道） */
export interface JobNodeProjection {
  stageId: string;
  nameZh: string;
  /** 中文状态（等待执行/执行中/已完成/等待人工确认/执行失败） */
  status: string;
  /** 原始状态键（pending/active/completed/awaiting_review/failed），用于样式判断 */
  statusRaw: StageStatus;
  startedAt?: string;
  completedAt?: string;
  elapsedSeconds?: number;
  progressMode: string;
  attemptCount: number;
  findingsProduced: number;
  artifactsProduced: string[];
  riskStatus: 'none' | 'warning' | 'block';
  awaitingReview: boolean;
}

/** 分析轨迹条目（与客户可见事件一一对应） */
export interface JobTimelineItem {
  sequence: number;
  occurredAt: string;
  category: string;
  titleZh: string;
  summaryZh?: string;
  severity: string;
  evidenceRefs?: EvidenceRef[];
}

/**
 * 产物投影（去重，含 lineage）。
 * F3-R1 §四：sourceEventId 必填非空；parentArtifactIds 表达谱系。
 */
export interface ArtifactProjection {
  artifactId: string;
  nameZh: string;
  type: string;
  generatedByStage?: string;
  createdAt: string;
  status: string;
  version: string;
  /** 来源事件 ID（必填非空） */
  sourceEventId: string;
  sourceSequence: number;
  linkedAssetCount: number;
  /** 父 Artifact ID 列表（lineage 谱系） */
  parentArtifactIds: string[];
  previewable: boolean;
}

/** 单个 QC 检查结果 */
export interface QCResultProjection {
  id: string;
  nameZh: string;
  status: 'pass' | 'warning' | 'block';
  targetZh: string;
  reasonZh?: string;
  evidenceCount: number;
  /** 来源事件 ID（跨页定位用） */
  sourceEventId?: string;
  sourceSequence?: number;
  /** 该 QC 的差异化 Evidence（跨页定位到具体图片/图层） */
  evidenceRefs?: EvidenceRef[];
  /** F3-R1 §五：必须 boolean（R0 错用 string） */
  requiresReview: boolean;
}

/** 成本汇总（估算 / 实际 / 差额） */
export interface CostSummaryProjection {
  estimatedCents: number;
  actualCents: number;
  deltaCents: number;
  currency: 'USD';
  hasEvents: boolean;
}

/**
 * 重试记录（F3-R1 §六：一次 lifecycle 一个 attempt）。
 * 归并键 stageId+attempt，3 个 lifecycle 事件只形成 1 条。
 */
export interface RetryProjection {
  /** 归并键 `${stageId}#${attempt}` */
  key: string;
  stageId?: string;
  attempt: number;
  maxAttempts: number;
  reasonZh: string;
  reasonCode: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  status: 'scheduled' | 'started' | 'completed';
  sourceSequence: number;
}

/** 路由策略升级记录（含成本+耗时+策略） */
export interface RouteUpgradeProjection {
  fromStrategy: string;
  toStrategy: string;
  reasonZh: string;
  costDeltaCents?: number;
  timeDeltaSeconds?: number;
  sourceEventId: string;
  sourceSequence: number;
}

/** 人工介入动作 */
export interface HumanActionProjection {
  titleZh: string;
  summaryZh?: string;
  requiresAction: boolean;
  sequence: number;
}

/** Job Detail 页面整体投影 */
export interface JobDetailProjection {
  overview: JobOverviewProjection;
  nodes: JobNodeProjection[];
  timelineItems: JobTimelineItem[];
  artifacts: ArtifactProjection[];
  qcResults: QCResultProjection[];
  costSummary: CostSummaryProjection;
  retryRecords: RetryProjection[];
  routeUpgrades: RouteUpgradeProjection[];
  humanActions: HumanActionProjection[];
}
