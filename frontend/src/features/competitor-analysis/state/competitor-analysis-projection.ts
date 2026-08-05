/**
 * F2-R1 页面投影层：从 LiveIntelligenceState + CompetitorAnalysisState 推导
 * "当前应该可见的结果"。
 *
 * R1.1 核心变更：可见结果只由已应用事件的 resultRefs 驱动。
 *   - idle 时 0 可见（resultRefsAccumulated 为空）。
 *   - running 时只显示已被事件显式产出（classified/cluster/...）的结果。
 *   - completed/awaiting_review 不再自动展开全部静态数组；只显示事件已产出的。
 *   - 可见性来源 = live.resultRefsAccumulated（reducer 已按 category 合并去重）。
 *
 * 旧规则（按里程碑/阶段存在性反推静态数组）已全部移除：
 *   - 不再用 milestones.some(...) 决定聚类/卖点可见性。
 *   - 不再用 stages[...].status 决定卖点可见性。
 *   - 不再用 risks.length + safe 静态顺序决定风险项可见性。
 */

import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';
import type {
  CompetitorAnalysisState,
  ConfidenceInfo,
} from '@/types/competitor-analysis';
import type { EvidenceRef } from '@/types/live-event';

/** Recipe 字段 key（与 RECIPE_FIELDS 对齐） */
export type RecipeFieldKey =
  | 'purpose'
  | 'canvas'
  | 'position'
  | 'ratio'
  | 'background'
  | 'lighting'
  | 'textSafetyZone';

/** 单个可见实体的证据溯源（投影层对外契约） */
export interface EntityEvidenceSummary {
  /** 产生该实体的所有来源事件 ID */
  sourceEventIds: string[];
  /** 这些事件的 sequence（trace 序） */
  traceSequences: number[];
  /** 这些事件携带的证据引用（可定位画布） */
  evidenceRefs: EvidenceRef[];
}

/** 投影结果：页面各区域当前应显示什么 */
export interface CompetitorAnalysisProjection {
  /** 已分析（已分类用途）的资产 ID（由事件 classifiedAssetIds 产出） */
  classifiedAssetIds: string[];
  /** 当前应可见的资产 ID（= 已分类；idle 为空） */
  visibleAssetIds: string[];
  /** 总资产数（占位用） */
  totalAssetCount: number;

  /** 已形成的聚类 ID（由事件 clusterIds 产出，非里程碑） */
  visibleClusterIds: string[];
  /** 已形成的卖点节点 ID（由事件 sellingPointIds 产出） */
  visibleSellingPointIds: string[];
  /** 已形成的套图洞察 ID（由事件 insightIds 产出） */
  visibleInsightIds: string[];
  /** 已发现的风险排除项 ID（由事件 riskItemIds 产出） */
  visibleRiskItemIds: string[];
  /** 已形成的 Recipe 字段（来自 live.recipe，与事件 recipeFields 同源） */
  visibleRecipeFields: RecipeFieldKey[];

  /** 实体 → 置信度（只含已可见的实体） */
  confidenceByEntityId: Record<string, ConfidenceInfo | undefined>;

  /** 已达成的里程碑 ID */
  completedMilestones: string[];

  /** 实体 → 证据溯源（每个可见结果 ID 由哪些事件产生） */
  entityEvidence: Record<string, EntityEvidenceSummary>;

  /** 是否 idle（无任何事件） */
  isIdle: boolean;
  /** 是否 completed / awaiting_review（终态） */
  isTerminal: boolean;
  /** 已处理图片数（来自事件流，真实分母） */
  processedImages: number;
  /** F2-R1.1 §十：风险类别数（来自 summaryMetrics.risks，权威状态） */
  riskCategoryCount: number;
}

/**
 * 推导页面投影。
 * R1.1：可见结果只来自 live.resultRefsAccumulated（reducer 从事件 resultRefs 累积）。
 *   - idle → 全部为空。
 *   - 终态不自动展开静态数组；只显示事件已产出的结果。
 */
export function projectCompetitorAnalysis(
  live: LiveIntelligenceState,
  analysis: CompetitorAnalysisState,
): CompetitorAnalysisProjection {
  const isIdle = live.jobStatus === 'idle';
  const isTerminal =
    live.jobStatus === 'completed' || live.jobStatus === 'awaiting_review';
  const processedImages = live.processedImages;

  const acc = live.resultRefsAccumulated ?? {
    classifiedAssetIds: [],
    clusterIds: [],
    sellingPointIds: [],
    insightIds: [],
    riskItemIds: [],
    recipeFields: [],
  };

  // —— 可见资产 = 事件累积的 classifiedAssetIds；idle = 空 ——
  // 仅保留 mock 中真实存在的资产（事件可能引用 mock 之外的 id）
  const assetIdSet = new Set(analysis.assets.map((a) => a.id));
  const visibleAssetIds = (acc.classifiedAssetIds ?? []).filter((id) =>
    assetIdSet.has(id),
  );
  const classifiedAssetIds = visibleAssetIds;

  // —— 聚类 = 事件累积的 clusterIds（非里程碑）——
  const clusterIdSet = new Set(analysis.clusters.map((c) => c.id));
  const visibleClusterIds = (acc.clusterIds ?? []).filter((id) =>
    clusterIdSet.has(id),
  );

  // —— 卖点 = 事件累积的 sellingPointIds ——
  const sellingPointIdSet = new Set(analysis.sellingPoints.map((s) => s.id));
  const visibleSellingPointIds = (acc.sellingPointIds ?? []).filter((id) =>
    sellingPointIdSet.has(id),
  );

  // —— 套图洞察 = 事件累积的 insightIds ——
  const insightIdSet = new Set(analysis.insights.map((i) => i.id));
  const visibleInsightIds = (acc.insightIds ?? []).filter((id) =>
    insightIdSet.has(id),
  );

  // —— 风险排除项 = 事件累积的 riskItemIds ——
  const allRiskItems = [
    ...analysis.riskExclusion.prohibited,
    ...analysis.riskExclusion.factCheck,
    ...analysis.riskExclusion.safe,
  ];
  const riskIdSet = new Set(allRiskItems.map((r) => r.id));
  const visibleRiskItemIds = (acc.riskItemIds ?? []).filter((id) =>
    riskIdSet.has(id),
  );

  // —— Recipe 字段（来自 live.recipe；与事件 recipeFields 同源）——
  const visibleRecipeFields = (Object.entries(live.recipe) as [RecipeFieldKey, boolean][])
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  // —— 置信度（只含已可见实体）——
  const confidenceByEntityId: Record<string, ConfidenceInfo | undefined> = {};
  for (const assetId of visibleAssetIds) {
    const asset = analysis.assets.find((a) => a.id === assetId);
    if (asset?.confidence) confidenceByEntityId[assetId] = asset.confidence;
  }
  for (const clusterId of visibleClusterIds) {
    const cluster = analysis.clusters.find((c) => c.id === clusterId);
    if (cluster?.borrowability) confidenceByEntityId[clusterId] = cluster.borrowability;
  }
  for (const insightId of visibleInsightIds) {
    const insight = analysis.insights.find((i) => i.id === insightId);
    if (insight?.confidence) confidenceByEntityId[insightId] = insight.confidence;
  }

  // —— 里程碑 ——
  const completedMilestones = live.milestones.map((m) => m.id);

  // —— 实体证据溯源：从 live.entityEvidence 聚合（一个实体可有多来源事件）——
  const source = live.entityEvidence ?? {};
  const allVisibleIds = new Set<string>([
    ...visibleAssetIds,
    ...visibleClusterIds,
    ...visibleSellingPointIds,
    ...visibleInsightIds,
    ...visibleRiskItemIds,
    ...visibleRecipeFields,
  ]);
  const entityEvidence: Record<string, EntityEvidenceSummary> = {};
  for (const id of allVisibleIds) {
    const entries = source[id];
    if (!entries || entries.length === 0) continue;
    const sourceEventIds = entries.map((e) => e.sourceEventId);
    const traceSequences = entries.map((e) => e.sequence);
    const evidenceRefs: EvidenceRef[] = [];
    for (const e of entries) {
      if (e.evidenceRefs) evidenceRefs.push(...e.evidenceRefs);
    }
    entityEvidence[id] = { sourceEventIds, traceSequences, evidenceRefs };
  }

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
    entityEvidence,
    isIdle,
    isTerminal,
    processedImages,
    riskCategoryCount: live.summaryMetrics.risks,
  };
}
