/**
 * F2-R1.1 §十二：共享 data-audit 生成函数。
 * Vitest 与截图脚本调用同一函数，禁止在 capture 脚本中写死数字。
 */

import type { CompetitorAnalysisState } from '@/types/competitor-analysis';
import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';

export interface DataAuditResult {
  generatedAt: string;
  assets: { count: number; uniqueSrc: number };
  roles: Record<string, number>;
  clusters: number;
  brandAssets: number;
  riskCategories: number;
  riskEvidenceCount: number;
  recipe: { normal: string; risk: string };
  sourceEventCoverage: {
    classifiedAssets: number;
    clusters: number;
    sellingPoints: number;
    insights: number;
    riskItems: number;
  };
  navigationCoverage: {
    risks: { total: number; withTrace: number; withEvidence: number; missingIds: string[] };
    recipeFields: { total: number; withTrace: number; missingIds: string[] };
    clusters: { total: number; withTrace: number; withInsights: number; missingIds: string[] };
    sellingPoints: { total: number; withTrace: number; withAssets: number; missingIds: string[] };
  };
  missingEntityIds: string[];
}

export function generateCompetitorDataAudit(
  analysisData: CompetitorAnalysisState,
  normalFinalState: LiveIntelligenceState,
  riskFinalState: LiveIntelligenceState,
): DataAuditResult {
  const assets = analysisData.assets;
  const uniqueSrc = new Set(assets.map((a) => a.src)).size;

  const roles: Record<string, number> = {};
  for (const a of assets) roles[a.role] = (roles[a.role] ?? 0) + 1;

  const brandAssets = assets.reduce((sum, a) => sum + a.riskCount, 0);

  const normalRecipeFields = Object.values(normalFinalState.recipe).filter(Boolean).length;
  const riskRecipeFields = Object.values(riskFinalState.recipe).filter(Boolean).length;

  // resultRefs coverage
  const acc = normalFinalState.resultRefsAccumulated;
  const sourceEventCoverage = {
    classifiedAssets: acc?.classifiedAssetIds?.length ?? 0,
    clusters: acc?.clusterIds?.length ?? 0,
    sellingPoints: acc?.sellingPointIds?.length ?? 0,
    insights: acc?.insightIds?.length ?? 0,
    riskItems: acc?.riskItemIds?.length ?? 0,
  };

  // —— F2-R1.3-E1 §3 navigationCoverage ——
  const entityEv = normalFinalState.entityEvidence ?? {};
  const accRiskIds = acc?.riskItemIds ?? [];
  const accClusterIds = acc?.clusterIds ?? [];
  const accSPIds = acc?.sellingPointIds ?? [];
  const allRiskItems = [
    ...analysisData.riskExclusion.prohibited,
    ...analysisData.riskExclusion.factCheck,
    ...analysisData.riskExclusion.safe,
  ];

  // helper: entityEvidence is Record<string, EntityEvidenceEntry[]>
  const hasTrace = (id: string) => {
    const entries = entityEv[id];
    return entries && entries.length > 0 && entries.some((e) => e.sequence > 0);
  };
  const hasEvidence = (id: string) => {
    const entries = entityEv[id];
    return entries && entries.length > 0 && entries.some((e) => e.evidenceRefs && e.evidenceRefs.length > 0);
  };

  const navRisksMissing: string[] = [];
  let risksWithTrace = 0, risksWithEvidence = 0;
  for (const r of allRiskItems) {
    if (!accRiskIds.includes(r.id)) continue;
    if (hasTrace(r.id)) risksWithTrace++;
    else navRisksMissing.push(r.id);
    if (hasEvidence(r.id)) risksWithEvidence++;
  }

  const recipeKeys = ['purpose', 'canvas', 'position', 'ratio', 'background', 'lighting', 'textSafetyZone'] as const;
  const visibleRecipeKeys = recipeKeys.filter((k) => normalFinalState.recipe[k]);
  const navRecipeMissing: string[] = [];
  let recipeWithTrace = 0;
  for (const k of visibleRecipeKeys) {
    if (hasTrace(k)) recipeWithTrace++;
    else navRecipeMissing.push(k);
  }

  const navClusterMissing: string[] = [];
  let clustersWithTrace = 0, clustersWithInsights = 0;
  for (const c of analysisData.clusters) {
    if (!accClusterIds.includes(c.id)) continue;
    if (hasTrace(c.id)) clustersWithTrace++;
    else navClusterMissing.push(c.id);
    if (c.assetIds.length > 0) clustersWithInsights++;
  }

  const navSPMissing: string[] = [];
  let spWithTrace = 0, spWithAssets = 0;
  for (const sp of analysisData.sellingPoints) {
    if (!accSPIds.includes(sp.id)) continue;
    if (hasTrace(sp.id)) spWithTrace++;
    else navSPMissing.push(sp.id);
    if (sp.assetIds.length > 0) spWithAssets++;
  }

  const allMockIds = [
    ...assets.map((a) => a.id),
    ...analysisData.clusters.map((c) => c.id),
    ...analysisData.sellingPoints.map((s) => s.id),
    ...analysisData.insights.map((i) => i.id),
    ...allRiskItems.map((r) => r.id),
  ];
  const coveredInNormal = new Set([
    ...(acc?.classifiedAssetIds ?? []),
    ...(acc?.clusterIds ?? []),
    ...(acc?.sellingPointIds ?? []),
    ...(acc?.insightIds ?? []),
    ...(acc?.riskItemIds ?? []),
  ]);
  const missingEntityIds = allMockIds.filter((id) => !coveredInNormal.has(id));

  return {
    generatedAt: new Date().toISOString(),
    assets: { count: assets.length, uniqueSrc },
    roles,
    clusters: analysisData.clusters.length,
    brandAssets,
    riskCategories: normalFinalState.summaryMetrics.risks,
    riskEvidenceCount: brandAssets,
    recipe: {
      normal: `${normalRecipeFields}/7`,
      risk: `${riskRecipeFields}/7`,
    },
    sourceEventCoverage,
    navigationCoverage: {
      risks: { total: accRiskIds.length, withTrace: risksWithTrace, withEvidence: risksWithEvidence, missingIds: navRisksMissing },
      recipeFields: { total: visibleRecipeKeys.length, withTrace: recipeWithTrace, missingIds: navRecipeMissing },
      clusters: { total: accClusterIds.length, withTrace: clustersWithTrace, withInsights: clustersWithInsights, missingIds: navClusterMissing },
      sellingPoints: { total: accSPIds.length, withTrace: spWithTrace, withAssets: spWithAssets, missingIds: navSPMissing },
    },
    missingEntityIds,
  };
}
