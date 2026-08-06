import { useState, useEffect, useMemo, useCallback } from 'react';
import { GlobalRail } from '@/components/layout/GlobalRail';
import { ContextSidebar } from '@/components/layout/ContextSidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { PersistentTaskBar } from '@/components/layout/PersistentTaskBar';
import { CompetitorAnalysisCanvas } from '@/components/competitor/CompetitorAnalysisCanvas';
import { ContactSheetView } from '@/components/competitor/ContactSheetView';
import { ClusterView } from '@/components/competitor/ClusterView';
import { SellingPointSequenceView } from '@/components/competitor/SellingPointSequenceView';
import { CanvasViewSwitcher } from '@/components/competitor/CanvasViewSwitcher';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import {
  useLiveIntelligence,
  DemoControls,
  AmbientStatus,
  AnalysisTrace,
  MilestoneReveal,
} from '@/features/live-intelligence';
import { selectRecipeCompleteness } from '@/features/live-intelligence/state/live-intelligence-selectors';
import { projectCompetitorAnalysis, type RecipeFieldKey } from '@/features/competitor-analysis/state/competitor-analysis-projection';
import { resolveEvidenceFromEntity } from '@/features/competitor-analysis/navigation/analysis-navigation';
import type { CanvasViewMode, InspectorTab } from '@/types/competitor-analysis';

/**
 * F2-R1.2：统一导航控制器 + 完整状态重置 + entityEvidence 追溯。
 */
export function App() {
  const analysisState = competitorAnalysisMock;
  const live = useLiveIntelligence('normal');

  // —— 页面级状态 ——
  const [viewMode, setViewMode] = useState<CanvasViewMode>('single');
  const [selectedAssetId, setSelectedAssetId] = useState(analysisState.assets[0].id);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedSellingPointId, setSelectedSellingPointId] = useState<string | null>(null);
  const [selectedRiskItemId, setSelectedRiskItemId] = useState<string | null>(null);
  const [selectedRecipeField, setSelectedRecipeField] = useState<RecipeFieldKey | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('current-image');
  const [traceCollapsed, setTraceCollapsed] = useState(false);

  // —— 投影层 ——
  const projection = useMemo(
    () => projectCompetitorAnalysis(live.state, analysisState),
    [live.state, analysisState],
  );

  // —— 页面状态完整重置（§九）——
  const sessionKey = `${live.state.jobId}#${live.state.runId}`;
  const [lastSessionKey, setLastSessionKey] = useState(sessionKey);
  useEffect(() => {
    if (sessionKey !== lastSessionKey) {
      setLastSessionKey(sessionKey);
      setSelectedClusterId(null);
      setSelectedSellingPointId(null);
      setSelectedRiskItemId(null);
      setSelectedRecipeField(null);
      setInspectorTab('current-image');
      setViewMode('single');
      setSelectedAssetId(projection.visibleAssetIds[0] ?? analysisState.assets[0].id);
    }
  }, [sessionKey, lastSessionKey, projection.visibleAssetIds, analysisState.assets]);

  // —— 投影后的组件数据 ——
  const visibleAssets = useMemo(
    () => analysisState.assets.filter((a) => projection.visibleAssetIds.includes(a.id)),
    [analysisState.assets, projection.visibleAssetIds],
  );
  const visibleClusters = useMemo(
    () => analysisState.clusters.filter((c) => projection.visibleClusterIds.includes(c.id)),
    [analysisState.clusters, projection.visibleClusterIds],
  );
  const visibleSellingPoints = useMemo(
    () => analysisState.sellingPoints.filter((s) => projection.visibleSellingPointIds.includes(s.id)),
    [analysisState.sellingPoints, projection.visibleSellingPointIds],
  );
  const visibleInsights = useMemo(
    () => analysisState.insights.filter((i) => projection.visibleInsightIds.includes(i.id)),
    [analysisState.insights, projection.visibleInsightIds],
  );
  const visibleRiskItems = useMemo(() => {
    const all = [
      ...analysisState.riskExclusion.prohibited,
      ...analysisState.riskExclusion.factCheck,
      ...analysisState.riskExclusion.safe,
    ];
    return all.filter((r) => projection.visibleRiskItemIds.includes(r.id));
  }, [analysisState.riskExclusion, projection.visibleRiskItemIds]);

  const focusedAssetId = live.focus?.assetId ?? selectedAssetId;

  // —— 统一导航函数（§一）——
  const navigate = useCallback((target: {
    viewMode?: CanvasViewMode;
    assetId?: string;
    clusterId?: string | null;
    sellingPointId?: string | null;
    riskItemId?: string | null;
    recipeField?: RecipeFieldKey | null;
    inspectorTab?: InspectorTab;
    evidence?: { assetId?: string; layer?: string; regionId?: string };
    traceSequence?: number;
  }) => {
    if (target.viewMode) setViewMode(target.viewMode);
    if (target.assetId) setSelectedAssetId(target.assetId);
    if (target.clusterId !== undefined) setSelectedClusterId(target.clusterId);
    if (target.sellingPointId !== undefined) setSelectedSellingPointId(target.sellingPointId);
    if (target.riskItemId !== undefined) setSelectedRiskItemId(target.riskItemId);
    if (target.recipeField !== undefined) setSelectedRecipeField(target.recipeField);
    if (target.inspectorTab) setInspectorTab(target.inspectorTab);
    if (target.evidence) {
      live.focusEvidence({
        assetId: target.evidence.assetId ?? target.assetId ?? '',
        layer: (target.evidence.layer ?? 'subject') as 'subject' | 'logo' | 'safe' | 'guide' | 'text' | 'risk',
        regionId: target.evidence.regionId,
        source: 'trace',
        fromSequence: target.traceSequence,
      });
    }
    if (target.traceSequence !== undefined) live.highlightTraceSequence(target.traceSequence);
  }, [live]);

  const handleSelectAsset = useCallback((id: string) => {
    navigate({ viewMode: 'single', assetId: id, clusterId: null });
    live.clearFocus();
  }, [live, navigate]);

  // —— 风险→Evidence→轨迹（§二）——
  const handleNavigateRisk = useCallback((riskItemId: string) => {
    const evidence = projection.entityEvidence?.[riskItemId];
    const resolved = resolveEvidenceFromEntity(evidence as never);
    navigate({
      viewMode: 'single',
      riskItemId,
      inspectorTab: 'risk-exclusion',
      evidence: resolved.evidence,
      traceSequence: resolved.traceSequence,
      assetId: resolved.evidence?.assetId,
    });
  }, [projection, navigate]);

  // —— Recipe→来源事件（§三）——
  const handleNavigateRecipe = useCallback((field: RecipeFieldKey) => {
    const evidence = projection.entityEvidence?.[field];
    const resolved = resolveEvidenceFromEntity(evidence as never);
    navigate({
      recipeField: field,
      inspectorTab: 'recipe',
      evidence: resolved.evidence,
      traceSequence: resolved.traceSequence,
      assetId: resolved.evidence?.assetId,
      viewMode: resolved.evidence ? 'single' : undefined,
    });
  }, [projection, navigate]);

  // —— 聚类联动（§四）——
  const handleSelectCluster = useCallback((clusterId: string | null) => {
    if (clusterId) {
      const evidence = projection.entityEvidence?.[clusterId];
      const resolved = resolveEvidenceFromEntity(evidence as never);
      navigate({
        clusterId,
        viewMode: 'clusters',
        inspectorTab: 'suite-insights',
        traceSequence: resolved.traceSequence,
      });
    } else {
      navigate({ clusterId: null });
    }
  }, [projection, navigate]);

  // —— 卖点联动（§五）——
  const handleSelectSellingPoint = useCallback((spId: string) => {
    const evidence = projection.entityEvidence?.[spId];
    const resolved = resolveEvidenceFromEntity(evidence as never);
    navigate({
      sellingPointId: spId,
      traceSequence: resolved.traceSequence,
    });
  }, [projection, navigate]);

  const recipeCompleteness = selectRecipeCompleteness(live.state);

  // —— 响应式 ——
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 1366) setTraceCollapsed(true);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      data-selected-cluster-id={selectedClusterId ?? ''}
      data-selected-selling-point-id={selectedSellingPointId ?? ''}
      data-selected-risk-item-id={selectedRiskItemId ?? ''}
      data-selected-recipe-field={selectedRecipeField ?? ''}
      data-focused-evidence-region={live.focus?.regionId ?? ''}
      data-highlighted-trace-sequence={live.highlightedSequence ?? ''}
    >
      <DemoControls
        status={live.simulatorStatus}
        speed={live.speed}
        scenarioId={live.scenarioId}
        onStart={live.start}
        onPause={live.pause}
        onResume={live.resume}
        onRestart={live.restart}
        onSpeed={live.setSpeed}
        onSwitch={live.switchScenario}
      />
      <AmbientStatus state={live.state} />

      <div className="flex min-h-0 flex-1">
        <GlobalRail />
        <ContextSidebar
          key={`context-${sessionKey}`}
          state={analysisState}
          selectedAssetId={focusedAssetId}
          onSelectAsset={handleSelectAsset}
          projection={projection}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div
            className="flex shrink-0 items-center justify-between border-b px-3 py-1.5"
            style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-app)' }}
          >
            <CanvasViewSwitcher mode={viewMode} onChange={setViewMode} />
            {viewMode === 'single' && (
              <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                演示素材 · 模拟分析结果
              </span>
            )}
          </div>

          {viewMode === 'single' && (
            <CompetitorAnalysisCanvas
              assets={analysisState.assets}
              selectedAssetId={focusedAssetId}
              onSelectAsset={handleSelectAsset}
              liveState={live.state}
              focus={live.focus}
              onFocusEvidence={live.focusEvidence}
              onClearFocus={live.clearFocus}
            />
          )}
          {viewMode === 'contact-sheet' && (
            <ContactSheetView
              assets={analysisState.assets}
              selectedAssetId={focusedAssetId}
              onSelectAsset={handleSelectAsset}
              projection={projection}
            />
          )}
          {viewMode === 'clusters' && (
            <ClusterView
              clusters={visibleClusters}
              assets={visibleAssets}
              selectedClusterId={selectedClusterId}
              onSelectCluster={handleSelectCluster}
              onSelectAsset={handleSelectAsset}
            />
          )}
          {viewMode === 'selling-points' && (
            <SellingPointSequenceView
              sellingPoints={visibleSellingPoints}
              assets={visibleAssets}
              onSelectAsset={handleSelectAsset}
              onSelectSellingPoint={handleSelectSellingPoint}
              selectedSellingPointId={selectedSellingPointId}
            />
          )}

          <MilestoneReveal key={sessionKey} state={live.state} />
        </div>

        {!traceCollapsed && (
          <aside
            className="flex shrink-0 flex-col border-l"
            style={{ width: 280, background: 'var(--gc-bg-app)', borderColor: 'var(--gc-line)' }}
          >
            <AnalysisTrace
              key={`trace-${sessionKey}`}
              state={live.state}
              highlightedSequence={live.highlightedSequence}
              onFocusEvidence={live.focusEvidence}
            />
          </aside>
        )}
        {traceCollapsed && (
          <button
            onClick={() => setTraceCollapsed(false)}
            className="flex shrink-0 flex-col items-center justify-center border-l py-2"
            style={{ width: 28, background: 'var(--gc-bg-elev-1)', borderColor: 'var(--gc-line)' }}
            title="展开分析轨迹"
          >
            <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)', writingMode: 'vertical-rl' }}>
              轨迹 {live.state.trace.length}
            </span>
          </button>
        )}

        <InspectorPanel
          state={analysisState}
          selectedAssetId={focusedAssetId}
          recipeCompletenessPct={recipeCompleteness}
          onSelectAsset={handleSelectAsset}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          projection={projection}
          sessionKey={sessionKey}
          liveState={live.state}
          visibleInsights={visibleInsights}
          visibleRiskItems={visibleRiskItems}
          onFocusEvidence={live.focusEvidence}
          onNavigateRisk={handleNavigateRisk}
          onNavigateRecipe={handleNavigateRecipe}
          selectedRiskItemId={selectedRiskItemId}
          selectedRecipeField={selectedRecipeField}
          selectedClusterId={selectedClusterId}
          selectedSellingPointId={selectedSellingPointId}
        />
      </div>

      <PersistentTaskBar live={live} />
    </div>
  );
}
