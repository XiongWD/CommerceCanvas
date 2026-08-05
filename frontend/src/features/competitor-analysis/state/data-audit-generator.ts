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
  };
}
