/**
 * Live Intelligence Layer — 事件 Envelope（G2-F1 前端原型）。
 *
 * 依据：
 *   FD-031  Live Intelligence Layer 是 MVP 横向能力
 *   FD-032  SSE 是默认传输（本轮用确定性 Event Simulator 替代运输来源，同一 Envelope）
 *   FD-033  业务事件有序、持久、可重放、可与权威快照对账
 *   FD-035  客户可见交互日志是结构化中文叙述，非原始日志
 *   deployment-boundaries §9.2  Envelope 最小字段
 *
 * 内部字段（kind/stageId/eventId 等）允许英文稳定标识；
 * 客户展示必须通过中文映射层（event-presentation-map.ts），禁止直接显示英文 kind。
 */

/** 事件类型：内部稳定英文标识（NG-022：不直接展示给客户） */
export type LiveEventKind =
  | 'session.started'
  | 'stage.queued'
  | 'stage.started'
  | 'stage.progress'
  | 'stage.completed'
  | 'stage.failed'
  | 'stage.awaiting_review'
  | 'observation.created'
  | 'decision.created'
  | 'evidence.created'
  | 'warning.created'
  | 'action.created'
  | 'artifact.created'
  | 'milestone.reached'
  | 'connection.disconnected'
  | 'connection.reconnecting'
  | 'connection.recovered'
  | 'job.completed'
  | 'job.failed'
  // F3 新增事件类型
  | 'qc.result.created'
  | 'cost.estimate.created'
  | 'cost.updated'
  | 'retry.scheduled'
  | 'retry.started'
  | 'retry.completed'
  | 'route.upgraded'
  | 'human.review.requested'
  | 'artifact.linked';

/** 客户可见的中文轨迹类型（8.2 + F3） */
export type TraceCategoryZh =
  | '发现'
  | '判断'
  | '证据'
  | '风险'
  | '动作'
  | '成果'
  | '系统'
  | '质量检查'
  | '成本'
  | '重试';

export type EventSeverity = 'info' | 'success' | 'warning' | 'error';

/** 进度模式（FD-036 / 任务书 §九：禁止无分母伪造百分比） */
export interface ProgressInfo {
  mode: 'determinate' | 'indeterminate';
  /** 已完成数（真实分母存在时） */
  current?: number;
  /** 总数（真实分母） */
  total?: number;
  /** 中文单位，例如「张」「个阶段」 */
  unitZh?: string;
}

/**
 * 证据引用：指向某张资产的某类 Evidence 区域，用于双向定位（任务书 §8.3）。
 *   assetId   资产 ID
 *   layer     证据图层类型（与 competitor-analysis EvidenceKind 对齐）
 *   regionId  具体区域 ID（可选）
 */
export interface EvidenceRef {
  assetId: string;
  layer: 'subject' | 'logo' | 'safe' | 'guide' | 'text' | 'risk';
  regionId?: string;
}

/**
 * 稳定事件 Envelope。
 * 模拟器与未来真实 SSE 共用同一结构；Reducer 只消费此结构。
 */
export interface LiveEventEnvelope {
  /** 全局唯一事件 ID（去重主键） */
  eventId: string;
  /** 严格递增序号（重放/乱序判断） */
  sequence: number;
  /** 发生时间（ISO，模拟器确定性生成，非真实墙钟） */
  occurredAt: string;

  jobId: string;
  taskId?: string;
  /** 阶段稳定 ID（英文，经映射层转中文） */
  stageId?: StageId;

  kind: LiveEventKind;
  severity: EventSeverity;

  /** 客户可见中文标题（已由映射层解析） */
  titleZh: string;
  /** 客户可见中文说明 */
  summaryZh?: string;
  /** 客户可见中文轨迹类型 */
  traceCategory?: TraceCategoryZh;

  progress?: ProgressInfo;

  /**
   * 业务指标（发现数/风险数等，等宽字体展示；recipeFields 为字段名数组）。
   * F3-R1：放宽为允许 boolean（QC `qcReview` 必须是 boolean 而非 string 'true'）。
   */
  metrics?: Record<string, number | string | string[] | boolean>;
  /** 证据引用（点击轨迹定位画布） */
  evidenceRefs?: EvidenceRef[];
  /** 产物引用（artifactId 列表） */
  artifactRefs?: string[];
  /** F2-R1.1：事件明确声明它形成了哪些业务结果（稳定结果 ID 驱动投影） */
  resultRefs?: CompetitorResultRefs;

  /** 是否需要人工介入 */
  requiresAction?: boolean;
  /** 是否为重放事件（断线恢复时标识） */
  replayed?: boolean;
}

/** 竞品套图分析 7 个阶段（任务书 §三 / 计划 §9） */
export type StageId =
  | 'validate_images'
  | 'classify_purpose'
  | 'segment_subject'
  | 'detect_text_logo'
  | 'extract_composition'
  | 'summarize_selling_points'
  | 'build_recipe';

/** 阶段状态 */
export type StageStatus = 'pending' | 'active' | 'completed' | 'failed' | 'awaiting_review';

/** 里程碑 ID（去重显示用） */
export type MilestoneId =
  | 'purpose_classified'
  | 'composition_extracted'
  | 'risk_list_built'
  | 'recipe_generated';

/** 任务整体状态 */
export type JobStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'awaiting_review'
  | 'failed';

/** 连接状态（演示语义，非真实在线） */
export type ConnectionState =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'recovered';

/** 演示场景 ID */
export type ScenarioId = 'normal' | 'risk' | 'reconnect';

/**
 * F2-R1.1：事件产生的业务结果引用。
 * 每个产生业务结果的事件必须明确声明它形成了哪些结果。
 * 投影层从已应用事件的 resultRefs 推导可见实体。
 */
export interface CompetitorResultRefs {
  /** 本次事件分类了哪些资产 */
  classifiedAssetIds?: string[];
  /** 本次事件形成了哪些聚类 */
  clusterIds?: string[];
  /** 本次事件形成了哪些卖点节点 */
  sellingPointIds?: string[];
  /** 本次事件形成了哪些套图洞察 */
  insightIds?: string[];
  /** 本次事件发现了哪些风险排除项 */
  riskItemIds?: string[];
  /** 本次事件标记了哪些 Recipe 字段 */
  recipeFields?: string[];
  /** F3：QC 结果 ID */
  qcResultIds?: string[];
  /** F3：Artifact 关系 ID */
  artifactLinkIds?: string[];
}

// ===== F3 新增类型 =====

/** 质量策略（客户可见中文名，不暴露 Provider/Model ID） */
export type QualityStrategy = '快速' | '均衡' | '高质量' | '商品保真优先' | '文字准确优先';

/** F3 成本指标 */
export interface CostMetrics {
  estimatedCents?: number;
  actualCents?: number;
  deltaCents?: number;
  currency: 'USD';
}

/** F3 重试指标 */
export interface RetryMetrics {
  attempt: number;
  maxAttempts: number;
  reasonCode: string;
  reasonZh: string;
}

/** F3 路由升级指标 */
export interface RouteUpgradeMetrics {
  fromStrategy: QualityStrategy;
  toStrategy: QualityStrategy;
  reasonZh: string;
  estimatedCostDeltaCents?: number;
  estimatedTimeDeltaSeconds?: number;
}

/** F3 QC 结果状态 */
export type QCStatus = 'pass' | 'warning' | 'block';

/** F3 QC 检查项 */
export interface QCResultInfo {
  id: string;
  nameZh: string;
  status: QCStatus;
  targetZh: string;
  reasonZh?: string;
  evidenceCount: number;
  requiresReview: boolean;
}

// ===== F3-R1 审计态类型（reducer 权威归并，不再扫 trace 猜测） =====

/**
 * 单阶段审计态（F3-R1 §二）。
 * 由 stage.queued / started / progress / completed / awaiting_review / retry.* 归并。
 * 客户 trace 继续降噪（stage.* 多为 ambient），但 Job Detail 节点只读权威 audit state。
 */
export interface StageAuditState {
  stageId: StageId;
  /** 首次开始时间（ISO，来自首个 stage.started） */
  firstStartedAt?: string;
  /** 最近一次开始时间（retry 后会被覆盖） */
  lastStartedAt?: string;
  /** 完成时间（ISO，来自 stage.completed / awaiting_review 后定格） */
  completedAt?: string;
  /** 尝试次数（初始执行 + 每次 retry.started 计一次；至少 1 当阶段已开始） */
  attemptCount: number;
  /** 该阶段产出的发现数（observation/decision/evidence.created 计数） */
  findingsProduced: number;
  /** 该阶段产生的 artifactId 列表（来自 artifact.created 的 artifactRefs） */
  artifactIds: string[];
  /** 真实进度类型：determinate / indeterminate */
  progressMode: 'determinate' | 'indeterminate';
  /** 该阶段进度（determinate 时） */
  progress?: { current: number; total: number; unitZh?: string };
}

/**
 * Artifact 审计记录（F3-R1 §四）。
 * 修复 R0 producer(event.artifactRefs) vs projection(metrics.artifactRefs) 字段错配：
 * 统一读 event.artifactRefs，并在 reducer 归并为权威结构，含 lineage。
 */
export interface ArtifactAuditRecord {
  artifactId: string;
  /** 中文名称（来自产生事件 titleZh） */
  nameZh: string;
  /** 类型（用途分类结果 / Evidence 索引 / 构图聚类 / 风险排除清单 / Creative Recipe） */
  type: string;
  /** 生成节点 stageId */
  generatedByStage?: StageId;
  /** 生成时间（ISO） */
  createdAt: string;
  /** 来源事件 ID（必填，非空） */
  sourceEventId: string;
  /** 来源事件 sequence */
  sourceSequence: number;
  /** 版本（如 v1 / 草案） */
  version: string;
  /** 关联的资产 ID 列表 */
  linkedAssetIds: string[];
  /** 父 Artifact ID 列表（lineage 谱系：本 artifact 由哪些 artifact 衍生） */
  parentArtifactIds: string[];
  /** 状态中文：已生成 / 待确认 / 已链接 */
  status: string;
}

/**
 * 单次重试尝试（F3-R1 §六）。
 * 一次 retry.scheduled → retry.started → retry.completed 属于一个 attempt，不是三条重试。
 * 归并键：stageId + attempt。
 */
export interface RetryAttemptState {
  /** 归并键：`${stageId}#${attempt}` */
  key: string;
  stageId?: StageId;
  attempt: number;
  maxAttempts: number;
  reasonCode: string;
  reasonZh: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  /** 状态：scheduled / started / completed */
  status: 'scheduled' | 'started' | 'completed';
  /** 来源事件 sequence（首条） */
  sourceSequence: number;
}

/**
 * 路由升级记录（F3-R1 §七）。
 */
export interface RouteUpgradeRecord {
  fromStrategy: string;
  toStrategy: string;
  reasonZh: string;
  costDeltaCents?: number;
  timeDeltaSeconds?: number;
  sourceEventId: string;
  sourceSequence: number;
}

/**
 * 跨页面导航目标（F3-R1 §八）。
 * 通过 Router state 传递，不依赖临时组件闭包。
 */
export interface CrossPageNavigationTarget {
  jobId: string;
  runId: number;
  assetId?: string;
  evidence?: { assetId?: string; layer?: string; regionId?: string };
  traceSequence?: number;
  qcResultId?: string;
}

/** 阶段状态 → 中文映射（F3-R1 §三：客户模式不得显示英文状态） */
export const STAGE_STATUS_ZH: Record<StageStatus, string> = {
  pending: '等待执行',
  active: '执行中',
  completed: '已完成',
  awaiting_review: '等待人工确认',
  failed: '执行失败',
};

/** 任务状态 → 中文映射 */
export const JOB_STATUS_ZH: Record<JobStatus, string> = {
  idle: '空闲',
  running: '执行中',
  completed: '已完成',
  awaiting_review: '等待人工确认',
  failed: '执行失败',
};
