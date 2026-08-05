/**
 * F2-R1 页面投影层：从 LiveIntelligenceState + CompetitorAnalysisState 推导
 * "当前应该可见的结果"。
 *
 * 核心原则（FD-036 / 任务书 R1 §二）：
 *   - 所有渐进结果只能由已到达事件、EvidenceRef、Recipe 状态、里程碑推导。
 *   - idle 时 0 可见；running 时只显示已处理；completed 全部。
 *   - 禁止组件自行创建 timer；禁止直接渲染完整 mock。
 */

import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';
import type {
  CompetitorAnalysisState,
  ConfidenceInfo,
} from '@/types/competitor-analysis';

/** Recipe 字段 key（与 RECIPE_FIELDS 对齐） */
export type RecipeFieldKey =
  | 'purpose'
  | 'canvas'
  | 'position'
  | 'ratio'
  | 'background'
  | 'lighting'
  | 'textSafetyZone';

/** 投影结果：页面各区域当前应显示什么 */
export interface CompetitorAnalysisProjection {
  /** 已分析（已分类用途）的资产 ID */
  classifiedAssetIds: string[];
  /** 当前应可见的资产 ID（已分类 + idle 为空） */
  visibleAssetIds: string[];
  /** 总资产数（占位用） */
  totalAssetCount: number;

  /** 已形成的聚类 ID（对应里程碑 composition_extracted 后逐个出现） */
  visibleClusterIds: string[];
  /** 已形成的卖点节点 ID（对应阶段 summarize_selling_points + 里程碑后逐项） */
  visibleSellingPointIds: string[];
  /** 已形成的套图洞察 ID（随事件/里程碑逐项） */
  visibleInsightIds: string[];
  /** 已发现的风险排除项 ID（随 warning.created 逐项） */
  visibleRiskItemIds: string[];
  /** 已形成的 Recipe 字段 */
  visibleRecipeFields: RecipeFieldKey[];

  /** 实体 → 置信度（只含已可见的实体） */
  confidenceByEntityId: Record<string, ConfidenceInfo | undefined>;

  /** 已达成的里程碑 ID */
  completedMilestones: string[];

  /** 是否 idle（无任何事件） */
  isIdle: boolean;
  /** 是否 completed / awaiting_review（终态） */
  isTerminal: boolean;
  /** 已处理图片数（来自事件流，真实分母） */
  processedImages: number;
}

/**
 * 推导页面投影。
 * 规则：
 *   - visibleAssetIds：前 processedImages 张（模拟"逐张分析"）；idle=0；终态=全部。
 *   - visibleClusterIds：里程碑 composition_extracted 到达后出现；逐个按事件 metrics.clusterId。
 *   - visibleSellingPointIds：阶段 summarize_selling_points 完成后出现。
 *   - visibleInsightIds：随 observation/decision 事件逐步。
 *   - visibleRiskItemIds：随 warning.created 事件逐步（按 evidenceRefs 匹配 riskExclusion item）。
 *   - visibleRecipeFields：来自 live state.recipe 中已标记为 true 的字段。
 */
export function projectCompetitorAnalysis(
  live: LiveIntelligenceState,
  analysis: CompetitorAnalysisState,
): CompetitorAnalysisProjection {
  const isIdle = live.jobStatus === 'idle';
  const isTerminal =
    live.jobStatus === 'completed' || live.jobStatus === 'awaiting_review';
  const processedImages = live.processedImages;

  // —— 可见资产 ——
  const visibleAssetIds = isIdle
    ? []
    : isTerminal
      ? analysis.assets.map((a) => a.id)
      : analysis.assets.slice(0, Math.max(0, processedImages)).map((a) => a.id);

  const classifiedAssetIds = visibleAssetIds; // 已分类 = 已可见

  // —— 聚类 ——
  // 里程碑 composition_extracted 到达后显示全部聚类（4 个聚类是套图级结论）。
  // 在该里程碑到达前，不显示任何聚类。
  const hasCompositionMilestone = live.milestones.some(
    (m) => m.id === 'composition_extracted',
  );
  const visibleClusterIds = hasCompositionMilestone
    ? analysis.clusters.map((c) => c.id)
    : [];

  // —— 卖点 ——
  // 阶段 summarize_selling_points 完成后出现。
  // 或 build_recipe 开始后（卖点顺序作为 Recipe 的前置）
  const hasRecipeStarted = live.stages.build_recipe.status === 'active' ||
    live.stages.build_recipe.status === 'completed' ||
    live.stages.build_recipe.status === 'awaiting_review';
  const visibleSellingPointIds =
    live.stages.summarize_selling_points.status === 'completed' || hasRecipeStarted || isTerminal
      ? analysis.sellingPoints.map((s) => s.id)
      : [];

  // —— 套图洞察 ——
  // 随用途识别 + 构图里程碑逐步出现。idle = 空。
  const hasPurposeMilestone = live.milestones.some(
    (m) => m.id === 'purpose_classified',
  );
  const visibleInsightIds = isIdle
    ? []
    : hasCompositionMilestone
      ? analysis.insights.map((i) => i.id)
      : hasPurposeMilestone
        ? analysis.insights.slice(0, 2).map((i) => i.id) // 用途分布 + 构图聚类先出现
        : [];

  // —— 风险排除项 ——
  // 随 warning.created 事件逐步出现。每个 warning 匹配 riskExclusion 中的一项。
  const warningCount = live.risks.length;
  // 可安全借鉴项只能在构图判断事件后出现（里程碑 composition_extracted）
  const safeItemsVisible = hasCompositionMilestone || isTerminal;
  const prohibitedItemsVisible = warningCount; // 每个 warning 对应一个 prohibited/factCheck
  // 按"禁止继承先出，待校验后出，可借鉴最后"排序
  const visibleRiskItemIds: string[] = [];
  // 禁止继承项随 warning 出现
  for (let i = 0; i < Math.min(prohibitedItemsVisible, analysis.riskExclusion.prohibited.length); i++) {
    visibleRiskItemIds.push(analysis.riskExclusion.prohibited[i].id);
  }
  // 待事实校验项在风险场景的 build_recipe 阶段后出现
  const hasRiskListMilestone = live.milestones.some((m) => m.id === 'risk_list_built');
  if (hasRiskListMilestone || isTerminal) {
    visibleRiskItemIds.push(...analysis.riskExclusion.factCheck.map((i) => i.id));
  }
  // 可安全借鉴项最后
  if (safeItemsVisible) {
    visibleRiskItemIds.push(...analysis.riskExclusion.safe.map((i) => i.id));
  }

  // —— Recipe 字段 ——
  const visibleRecipeFields = (Object.entries(live.recipe) as [RecipeFieldKey, boolean][])
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  // —— 置信度 ——
  const confidenceByEntityId: Record<string, ConfidenceInfo | undefined> = {};
  // 资产置信度（只含已可见资产）
  for (const assetId of visibleAssetIds) {
    const asset = analysis.assets.find((a) => a.id === assetId);
    if (asset?.confidence) confidenceByEntityId[assetId] = asset.confidence;
  }
  // 聚类置信度
  for (const clusterId of visibleClusterIds) {
    const cluster = analysis.clusters.find((c) => c.id === clusterId);
    if (cluster?.borrowability) confidenceByEntityId[clusterId] = cluster.borrowability;
  }

  // —— 里程碑 ——
  const completedMilestones = live.milestones.map((m) => m.id);

  return {
    classifiedAssetIds,
    visibleAssetIds,
    totalAssetCount: analysis.assets.length,
    visibleClusterIds,
    visibleSellingPointIds,
    visibleInsightIds,
    visibleRiskItemIds,
    visibleRecipeFields,
    confidenceByEntityId,
    completedMilestones,
    isIdle,
    isTerminal,
    processedImages,
  };
}
