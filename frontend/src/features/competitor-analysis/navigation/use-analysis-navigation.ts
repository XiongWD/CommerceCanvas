/**
 * F2-R1.2 useAnalysisNavigation：绑定页面状态 setters + live focus。
 * 组件通过 navigate(target) 执行所有跨区域跳转。
 */

import { useCallback } from 'react';
import type { AnalysisNavigationTarget, NavigationDispatcher } from './analysis-navigation';
import type { CanvasViewMode, InspectorTab } from '@/types/competitor-analysis';
import type { EvidenceFocus } from '@/features/live-intelligence/useLiveIntelligence';
import type { RecipeFieldKey } from '@/features/competitor-analysis/state/competitor-analysis-projection';

interface UseAnalysisNavigationArgs {
  setViewMode: (m: CanvasViewMode) => void;
  setSelectedAssetId: (id: string) => void;
  setSelectedClusterId: (id: string | null) => void;
  setSelectedSellingPointId: (id: string | null) => void;
  setSelectedRiskItemId: (id: string | null) => void;
  setSelectedRecipeField: (f: RecipeFieldKey | null) => void;
  setInspectorTab: (t: InspectorTab) => void;
  focusEvidence: (f: EvidenceFocus) => void;
  highlightTraceSequence: (seq: number | undefined) => void;
}

export function useAnalysisNavigation(args: UseAnalysisNavigationArgs): NavigationDispatcher {
  return useCallback((target: AnalysisNavigationTarget) => {
    if (target.viewMode) args.setViewMode(target.viewMode);
    if (target.assetId) args.setSelectedAssetId(target.assetId);
    if (target.clusterId !== undefined) args.setSelectedClusterId(target.clusterId);
    if (target.sellingPointId !== undefined) args.setSelectedSellingPointId(target.sellingPointId);
    if (target.riskItemId !== undefined) args.setSelectedRiskItemId(target.riskItemId);
    if (target.recipeField !== undefined) args.setSelectedRecipeField(target.recipeField);
    if (target.inspectorTab) args.setInspectorTab(target.inspectorTab);
    if (target.evidence) {
      args.focusEvidence({
        assetId: target.evidence.assetId ?? target.assetId ?? '',
        layer: (target.evidence.layer ?? 'subject') as EvidenceFocus['layer'],
        regionId: target.evidence.regionId,
        source: 'trace',
        fromSequence: target.traceSequence,
      });
    }
    if (target.traceSequence !== undefined) args.highlightTraceSequence(target.traceSequence);
  }, [args]);
}
