/**
 * F2-R1.2 统一页面导航控制器。
 * 所有跨区域跳转必须走一个 navigate(target)。
 */

import type { CanvasViewMode, InspectorTab } from '@/types/competitor-analysis';
import type { EvidenceLookup } from '@/features/live-intelligence/state/evidence-selectors';
import type { RecipeFieldKey } from '@/features/competitor-analysis/state/competitor-analysis-projection';

export interface AnalysisNavigationTarget {
  viewMode?: CanvasViewMode;
  assetId?: string;
  clusterId?: string | null;
  sellingPointId?: string | null;
  insightId?: string;
  riskItemId?: string | null;
  recipeField?: RecipeFieldKey | null;
  inspectorTab?: InspectorTab;
  evidence?: EvidenceLookup;
  traceSequence?: number;
}

export type NavigationDispatcher = (target: AnalysisNavigationTarget) => void;

/**
 * 从 entityEvidence 提取最佳 Evidence lookup。
 * 优先选带 regionId 的 evidenceRef，否则 assetId+layer 回退。
 */
export function resolveEvidenceFromEntity(
  entityEvidence: { sourceEventIds: string[]; traceSequences: number[]; evidenceRefs: { assetId: string; layer: string; regionId?: string }[] } | undefined,
): { evidence?: EvidenceLookup; traceSequence?: number } {
  if (!entityEvidence) return {};
  // 优先 regionId
  const withRegion = entityEvidence.evidenceRefs.find((r) => r.regionId);
  if (withRegion) {
    return {
      evidence: { regionId: withRegion.regionId, assetId: withRegion.assetId, layer: withRegion.layer as EvidenceLookup['layer'] },
      traceSequence: entityEvidence.traceSequences[0],
    };
  }
  // 回退 assetId+layer
  const first = entityEvidence.evidenceRefs[0];
  if (first) {
    return {
      evidence: { assetId: first.assetId, layer: first.layer as EvidenceLookup['layer'] },
      traceSequence: entityEvidence.traceSequences[0],
    };
  }
  // 无 evidence，只返回 trace
  return { traceSequence: entityEvidence.traceSequences[0] };
}
