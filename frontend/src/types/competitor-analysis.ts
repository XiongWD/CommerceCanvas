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
 *   text     OCR 文字块（F2 §5.1）
 *   risk     风险区域（F2 §5.1）
 */
export type EvidenceKind = 'subject' | 'logo' | 'safe' | 'guide' | 'text' | 'risk';

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

/** 单张图片的视觉语言摘要（右侧检查器「当前图片分析」） */
export interface AssetVisualLanguage {
  /** 主光 */
  keyLightZh: string;
  /** 轮廓光 */
  rimLightZh: string;
  /** 色调 */
  toneZh: string;
  /** 景深 */
  depthZh: string;
}

/**
 * 竞品单张图片。
 *
 * 每张图片携带自身分析摘要（P3 同步要求）：
 *   图片用途 / 构图模式 / 商品占比 / 镜头角度 / 背景类型 / 视觉语言 / 风险项 / 证据区域。
 * 选中任意缩略图后，右侧检查器消费当前资产的这些字段同步更新。
 */
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

  /** 演示素材路径（本地 SVG，不依赖远程链接，任务书 §6.2）*/
  src: string;
  /** 缩略图配色（派生差异，肉眼可辨）*/
  thumbPalette: { from: string; to: string };
  /** 缩略图裁切偏移（对象位置，用于复用素材产生可见差异）*/
  thumbFocus?: { x: number; y: number; scale: number };

  /** —— 单图分析摘要（右侧「当前图片分析」消费）—— */
  purposeZh: string; // 图片用途
  compositionZh: string; // 构图模式
  productRatioPct: number; // 商品占比（百分比，真实分母）
  cameraAngleZh: string; // 镜头角度
  backgroundZh: string; // 背景类型
  visualLanguage: AssetVisualLanguage; // 视觉语言摘要
  /** 风险项中文描述列表（与 riskCount 对应）*/
  risksZh: string[];

  /** —— F2 扩展字段（§5.1 / §八）—— */
  /** 所属构图聚类 ID（关联 CompositionCluster.id） */
  clusterId: string;
  /** 该资产分析置信度（有业务语义，非装饰性百分比） */
  confidence: ConfidenceInfo;
  /** 关联的卖点节点 ID 列表（关联 SellingPointNode.id） */
  sellingPointIds: string[];
  /** 关联的套图洞察 ID 列表（关联 SuiteInsight.id） */
  insightIds: string[];
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
  // —— F2 扩展 ——
  /** Product Master 摘要（§4.1） */
  productMaster: ProductMaster;
  /** 构图聚类（§5.3） */
  clusters: CompositionCluster[];
  /** 卖点顺序（§5.4） */
  sellingPoints: SellingPointNode[];
  /** 风险排除清单（§7.4） */
  riskExclusion: RiskExclusionList;
  /** 套图洞察（§7.2） */
  insights: SuiteInsight[];
}

// ===== F2 新增类型 =====

/** 中央查看模式（§五） */
export type CanvasViewMode = 'single' | 'contact-sheet' | 'clusters' | 'selling-points';

/** 右侧检查器 Tab（§七） */
export type InspectorTab = 'current-image' | 'suite-insights' | 'recipe' | 'risk-exclusion';

/** 置信度等级（§八） */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'pending';

/** 置信度信息（§八：有业务语义，非装饰性百分比） */
export interface ConfidenceInfo {
  level: ConfidenceLevel;
  /** 辅助百分比（0–100，仅参考） */
  percent: number;
  /** 中文依据（点击置信度展示） */
  basisZh: string;
}

/** Product Master 摘要（§4.1） */
export interface ProductMaster {
  productNameZh: string;
  sku: string;
  categoryZh: string;
  /** 商品形态，例如「开放式耳机」 */
  formFactorZh: string;
  /** 主色 */
  primaryColorZh: string;
  /** 材质 */
  materialZh: string;
  /** 核心身份特征 */
  identityFeaturesZh: string[];
  /** 禁止变化属性 */
  prohibitedChangesZh: string[];
}

/** 构图聚类（§5.3） */
export interface CompositionCluster {
  id: string;
  /** 聚类名，例如「A：右侧主体 / 左侧文案」 */
  nameZh: string;
  /** 包含的资产 ID */
  assetIds: string[];
  /** 构图特征 */
  compositionFeaturesZh: string[];
  /** 适合的图片槽位 */
  suitableSlotsZh: string[];
  /** 可借鉴程度 */
  borrowability: ConfidenceInfo;
  /** 风险提示 */
  riskNoteZh?: string;
}

/** 卖点顺序节点（§5.4） */
export interface SellingPointNode {
  id: string;
  /** 卖点名，例如「续航」 */
  nameZh: string;
  /** 顺序（从 1 起） */
  order: number;
  /** 关联资产 ID */
  assetIds: string[];
  /** 使用的构图模式 */
  compositionZh: string;
  /** 使用的光线语言 */
  lightingZh: string;
  /** 是否可继承 */
  inheritable: boolean;
  /** 是否需要 Product Master 事实校验 */
  needsFactCheck: boolean;
}

/** 风险排除项（§7.4） */
export interface RiskExclusionItem {
  id: string;
  /** 分类：禁止继承 / 待事实校验 / 可安全借鉴 */
  category: 'prohibited' | 'fact-check' | 'safe';
  /** 名称 */
  nameZh: string;
  /** 原因 */
  reasonZh: string;
  /** 证据数量 */
  evidenceCount: number;
  /** 关联资产 ID */
  assetIds: string[];
  /** 是否需要人工确认 */
  needsReview: boolean;
}

/** 风险排除清单（§7.4） */
export interface RiskExclusionList {
  prohibited: RiskExclusionItem[];
  factCheck: RiskExclusionItem[];
  safe: RiskExclusionItem[];
}

/** 套图洞察项（§7.2） */
export interface SuiteInsight {
  id: string;
  /** 洞察类别 */
  categoryZh: string;
  /** 结论中文 */
  conclusionZh: string;
  /** 关联资产 ID（可定位到图片） */
  assetIds: string[];
  /** 置信度 */
  confidence: ConfidenceInfo;
}

/** 单个资产扩展字段（F2 §5.1/§八） */
export interface AssetF2Extension {
  /** 聚类 ID */
  clusterId: string;
  /** 置信度 */
  confidence: ConfidenceInfo;
  /** 关联卖点 ID */
  sellingPointIds: string[];
  /** 关联套图结论 ID */
  insightIds: string[];
}

