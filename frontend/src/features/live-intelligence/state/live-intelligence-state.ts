/**
 * Live Intelligence 归并状态（单一真实来源，任务书 §七）。
 *
 * 所有展示（画布阶段、底部进度、检查器结论）必须从本状态推导，
 * 禁止各组件各自维护阶段/进度/任务状态（NG-024）。
 *
 * R1 关键修复：
 *   - 去重索引（EventLedger）属于归并状态本身，而非 reducer 默认参数或闭包
 *   - 因此 React useReducer 与测试 applyEvents 走完全相同的纯函数路径
 */

import type {
  ConnectionState,
  JobStatus,
  StageId,
  StageStatus,
  MilestoneId,
} from '@/types/live-event';
import type { LiveEventEnvelope } from '@/types/live-event';

/** 单个阶段归并态 */
export interface StageState {
  id: StageId;
  status: StageStatus;
  /** 阶段内进度（仅当事件携带 determinate progress 时有意义） */
  progress?: { current: number; total: number; unitZh?: string };
}

/** 分析轨迹条目（仅客户可见事件，按 sequence 升序） */
export interface TraceItem {
  eventId: string;
  sequence: number;
  occurredAt: string;
  category: NonNullable<LiveEventEnvelope['traceCategory']>;
  titleZh: string;
  summaryZh?: string;
  severity: LiveEventEnvelope['severity'];
  evidenceRefs?: LiveEventEnvelope['evidenceRefs'];
  /** 是否为重放事件（视觉降权） */
  replayed: boolean;
}

/** Artifact 归并项（去重） */
export interface ArtifactItem {
  artifactId: string;
  titleZh: string;
  createdAt: string;
  /** 关联事件 sequence，便于追溯 */
  fromSequence: number;
}

/** 风险归并项 */
export interface RiskItem {
  id: string;
  titleZh: string;
  severity: 'warning' | 'error';
  evidenceRefs?: LiveEventEnvelope['evidenceRefs'];
  requiresAction: boolean;
}

/** 里程碑归并项（去重显示） */
export interface MilestoneItem {
  id: MilestoneId;
  titleZh: string;
  summaryZh?: string;
  sequence: number;
}

/** Creative Recipe 字段完成度（逐步形成，任务书 §三） */
export interface RecipeProgress {
  purpose: boolean;
  canvas: boolean;
  position: boolean;
  ratio: boolean;
  background: boolean;
  lighting: boolean;
  textSafetyZone: boolean;
}

/** 权威业务统计（任务书 §八：不从轨迹条数反推；R1.1 增 blockingConflicts） */
export interface SummaryMetrics {
  findings: number;
  risks: number;
  artifacts: number;
  blockingConflicts: number;
}

/**
 * 事件账本：去重 + 有序缓冲，属于归并状态（R1 P0-1/P0-2）。
 *   seenEventIds           已应用过的 eventId（去重主键）
 *   pendingBySequence      乱序到达但尚未能连续应用的事件（缺口后的）
 *   lastContiguousSequence 已连续应用到的最高 sequence（1..N 无缺口）
 */
export interface EventLedger {
  seenEventIds: Record<string, boolean>;
  pendingBySequence: Record<number, LiveEventEnvelope>;
  lastContiguousSequence: number;
}

/** 归并后的完整状态 */
export interface LiveIntelligenceState {
  /** 当前运行场景 */
  scenario: string;
  /** jobId（重置组件展示记录用） */
  jobId: string;
  /** 运行实例标识（R1.1：restart/switchScenario 递增；里程碑展示会话键的一部分） */
  runId: number;
  jobStatus: JobStatus;
  connection: ConnectionState;

  /** 已接收事件总数（去重后，含 pending） */
  receivedCount: number;
  /** 已用时间（秒，由事件流推导，非墙钟） */
  elapsedSeconds: number;

  /** 事件账本（去重 + 有序缓冲，属于状态） */
  ledger: EventLedger;

  /** 7 阶段归并态 */
  stages: Record<StageId, StageState>;
  /** 阶段顺序（展示用） */
  stageOrder: StageId[];

  /** 分析轨迹（仅客户可见事件，按 sequence 升序） */
  trace: TraceItem[];
  /** 里程碑（已达成，按 sequence 升序） */
  milestones: MilestoneItem[];
  /** 已显示过的里程碑 ID（按 jobId 分组：重放不重复弹，切场景可重显） */
  shownMilestoneIds: Record<string, MilestoneId[]>;
  /** Artifact（去重） */
  artifacts: ArtifactItem[];
  /** 风险项 */
  risks: RiskItem[];

  /** 权威业务统计（任务书 §八） */
  summaryMetrics: SummaryMetrics;

  /** 当前活跃分析节点数（由事件推导，演示语义） */
  activeNodes: number;
  /** 已处理图片数（真实分母 12） */
  processedImages: number;
  /** 总图片数（真实分母） */
  totalImages: number;

  /** 是否需要人工介入 */
  requiresAction: boolean;
  /** 人工介入提示中文 */
  actionPromptZh?: string;

  /** 当前选中的证据焦点（双向定位，本地 UI 状态，由 hook 合并） */
  focusedEvidence?: {
    assetId: string;
    layer: 'subject' | 'logo' | 'safe' | 'guide' | 'text' | 'risk';
    regionId?: string;
    source: 'trace' | 'canvas';
    fromSequence?: number;
  };

  /** Creative Recipe 完成度 */
  recipe: RecipeProgress;

  /** 最近一次断线恢复信息（中文展示） */
  recoveryInfo?: {
    fromSequence: number;
    recoveredCount: number;
  };
}

/** 阶段中文展示名（映射层的一部分，与 event-presentation-map 协同） */
export const STAGE_LABEL_ZH: Record<StageId, string> = {
  validate_images: '校验竞品图片',
  classify_purpose: '识别图片用途',
  segment_subject: '分离商品与背景',
  detect_text_logo: '检测文字、Logo 和型号',
  extract_composition: '提取构图与视觉语言',
  summarize_selling_points: '归纳卖点顺序',
  build_recipe: '形成套图 Creative Recipe',
};

export const STAGE_ORDER: StageId[] = [
  'validate_images',
  'classify_purpose',
  'segment_subject',
  'detect_text_logo',
  'extract_composition',
  'summarize_selling_points',
  'build_recipe',
];

/** Recipe 字段名顺序（用于 recipeFields 数组标记） */
export const RECIPE_FIELDS: (keyof RecipeProgress)[] = [
  'purpose',
  'canvas',
  'position',
  'ratio',
  'background',
  'lighting',
  'textSafetyZone',
];

/** 初始空状态（idle） */
export function createInitialState(scenario = 'normal'): LiveIntelligenceState {
  const stages = {} as Record<StageId, StageState>;
  for (const id of STAGE_ORDER) {
    stages[id] = { id, status: 'pending' };
  }
  return {
    scenario,
    jobId: '',
    runId: 1,
    jobStatus: 'idle',
    connection: 'connected',
    receivedCount: 0,
    elapsedSeconds: 0,
    ledger: {
      seenEventIds: {},
      pendingBySequence: {},
      lastContiguousSequence: 0,
    },
    stages,
    stageOrder: STAGE_ORDER,
    trace: [],
    milestones: [],
    shownMilestoneIds: {},
    artifacts: [],
    risks: [],
    summaryMetrics: { findings: 0, risks: 0, artifacts: 0, blockingConflicts: 0 },
    activeNodes: 0,
    processedImages: 0,
    totalImages: 12,
    requiresAction: false,
    recipe: {
      purpose: false,
      canvas: false,
      position: false,
      ratio: false,
      background: false,
      lighting: false,
      textSafetyZone: false,
    },
  };
}

