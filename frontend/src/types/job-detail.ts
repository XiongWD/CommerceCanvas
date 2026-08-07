/**
 * F3 Job Detail — 投影层类型契约。
 *
 * 依据：
 *   FD-038  每个核心页面消费同一事件契约，做页面专属呈现
 *   任务书 §七  展示必须从归并态推导，禁止各组件各自维护状态（NG-024）
 *
 * 这些类型只是 Job Detail 页面投影结果的前端契约；
 * 全部字段从 LiveIntelligenceState（单一真实来源）推导，不引入新业务状态。
 */

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
  status: string;
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

import type { EvidenceRef } from '@/types/live-event';

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

/** 产物投影（去重） */
export interface ArtifactProjection {
  artifactId: string;
  nameZh: string;
  type: string;
  generatedByStage?: string;
  createdAt: string;
  status: string;
  version: string;
  sourceEventId: string;
  linkedAssetCount: number;
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
  sourceSequence?: number;
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

/** 重试记录 */
export interface RetryProjection {
  attempt: number;
  maxAttempts: number;
  reasonZh: string;
  reasonCode: string;
  stageId?: string;
  sequence: number;
}

/** 路由策略升级记录 */
export interface RouteUpgradeProjection {
  fromStrategy: string;
  toStrategy: string;
  reasonZh: string;
  costDeltaCents?: number;
  timeDeltaSeconds?: number;
  sequence: number;
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
