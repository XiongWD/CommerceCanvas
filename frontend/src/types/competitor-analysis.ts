/**
 * 竞品套图分析 — 前端最小类型契约（G2 前端原型）。
 *
 * 依据：
 *   FD-031  Live Intelligence Layer 是 MVP 横向能力
 *   FD-038  每个核心页面消费同一事件契约，做页面专属呈现
 *   PRD-F-045 事件至少区分 发现/依据/决策/警告/动作/产物/里程碑
 *   计划 §5  ExecutionEventKind 中文事件分类
 *
 * 这些类型仅为前端原型消费，不代表后端 Schema 已冻结（见 future-contract-notes.md）。
 * 客户界面只消费 `customer` 可见性事件，禁止直接显示原始诊断日志（NG-022）。
 */

/** 平台目标（FD-008：MVP 平台 = Amazon / Shopify / TikTok Shop） */
export type Platform = 'amazon' | 'shopify' | 'tiktok_shop';

/** 图片用途分类（mvp-prd §15、计划 §9 演示脚本） */
export type ImageRole = '主图' | '场景图' | '卖点图' | '细节图' | '参数图';

/**
 * 证据区域种类。
 *   subject  商品主体识别区
 *   logo     Logo / 文字风险框（禁止继承）
 *   safe     主体安全区
 *   guide    构图辅助线
 */
export type EvidenceKind = 'subject' | 'logo' | 'safe' | 'guide';

/**
 * 证据区域：归一化坐标（0–1），与画布尺寸解耦。
 * 来源于 L1 视觉检测，是可被定位的真实证据（NG-022 / FD-036）。
 */
export interface EvidenceRegion {
  id: string;
  kind: EvidenceKind;
  /** 归一化 x / y / 宽 / 高，相对画布左上角 */
  x: number;
  y: number;
  w: number;
  h: number;
  /** 中文业务标注，例如"商品主体""竞品 Logo""安全区""三分线" */
  labelZh: string;
  /** 可选置信度（0–1），用于"依据"类证据；不显示伪百分比（NG-023） */
  confidence?: number;
}

/** 竞品单张图片 */
export interface CompetitorAsset {
  id: string;
  /** 文件名（允许英文技术标识，FD-034） */
  filename: string;
  role: ImageRole;
  /** 分析状态：演示数据为完成态 */
  status: '已完成' | '待人工确认';
  riskCount: number;
  /** 证据区域集合 */
  evidences: EvidenceRegion[];
  /** 缩略图配色（CSS 占位，不依赖远程链接，任务书 §6.2） */
  thumbPalette: { from: string; to: string };
}

/** 分析摘要项（右侧检查器） */
export interface SummaryField {
  labelZh: string;
  valueZh: string;
}

/** 视觉语言项 */
export interface VisualLanguageField {
  labelZh: string;
  valueZh: string;
}

/** Creative Recipe 草案结构（计划 §9 / mvp-prd §7.2 同类借用） */
export interface CreativeRecipeDraft {
  /** 用途，中文 */
  purposeZh: string;
  /** 画布尺寸 px */
  canvas: { width: number; height: number };
  /** 商品位置中文描述 */
  productPositionZh: string;
  /** 商品占比区间（百分比） */
  productRatio: { min: number; max: number };
  /** 背景中文描述 */
  backgroundZh: string;
  /** 光线中文描述 */
  lightingZh: string;
  /** 文字安全区（百分比） */
  textSafetyZonePct: number;
}

/** 持续任务面板静态完成态（FD-037，本任务不实现真实 SSE） */
export interface TaskSnapshot {
  /** 任务名（中文） */
  nameZh: string;
  /** 已完成 / 总数（真实分母，PRD-F-046） */
  stages: { done: number; total: number };
  /** 发现项总数 */
  findings: number;
  /** 风险项总数 */
  risks: number;
  /** 已生成的产物数量 */
  artifacts: number;
  /** 用时 mm:ss（真实演示值，非随机） */
  elapsedZh: string;
  /** 状态：完成态 */
  phaseZh: string;
  /** 实时连接占位（本任务静态，不实现 SSE） */
  connectionZh: string;
  /** Worker 状态占位 */
  workerZh: string;
}

/** 竞品套图分析页面整体模型 */
export interface CompetitorAnalysisState {
  /** 当前项目中文名 */
  projectNameZh: string;
  /** SKU（允许英文技术标识） */
  sku: string;
  platform: Platform;
  /** 分析任务中文名 */
  taskNameZh: string;
  /** 图片数量 */
  assetCount: number;
  /** 分析目标（中文） */
  goalZh: string;
  /** 竞品图片集合 */
  assets: CompetitorAsset[];
  /** 分析摘要字段 */
  summary: SummaryField[];
  /** 视觉语言字段 */
  visualLanguage: VisualLanguageField[];
  /** 可继承内容（中文列表） */
  inheritableZh: string[];
  /** 禁止继承内容（中文列表） */
  prohibitedZh: string[];
  /** Creative Recipe 草案 */
  recipe: CreativeRecipeDraft;
  /** 持续任务面板静态完成态 */
  task: TaskSnapshot;
  /** 统计 */
  stats: {
    inheritableCount: number;
    prohibitedCount: number;
    pendingHumanReview: number;
  };
}
