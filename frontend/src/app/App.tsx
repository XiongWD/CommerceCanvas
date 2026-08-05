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
import { projectCompetitorAnalysis } from '@/features/competitor-analysis/state/competitor-analysis-projection';
import type { CanvasViewMode, InspectorTab } from '@/types/competitor-analysis';

/**
 * CommerceCanvas F2-R1：竞品套图分析完整展示页（投影驱动渐进页面）。
 *
 * 核心修复：所有结果通过 projectCompetitorAnalysis 投影层推导，
 * 不直接渲染完整 mock。idle 时不显示终态，结果随事件逐步形成。
 */
export function App() {
  const analysisState = competitorAnalysisMock;
  const live = useLiveIntelligence('normal');

  // —— 页面级状态 ——
  const [viewMode, setViewMode] = useState<CanvasViewMode>('single');
  const [selectedAssetId, setSelectedAssetId] = useState(analysisState.assets[0].id);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('current-image');
  const [traceCollapsed, setTraceCollapsed] = useState(false);

  // —— 投影层：从 live state 推导可见结果 ——
  const projection = useMemo(
    () => projectCompetitorAnalysis(live.state, analysisState),
    [live.state, analysisState],
  );

  // —— 页面状态重置：scenarioId 或 runId 变化时 ——
  const sessionKey = `${live.state.jobId}#${live.state.runId}`;
  const [lastSessionKey, setLastSessionKey] = useState(sessionKey);
  useEffect(() => {
    if (sessionKey !== lastSessionKey) {
      setLastSessionKey(sessionKey);
      setSelectedClusterId(null);
      setInspectorTab('current-image');
      setViewMode('single');
      // selectedAssetId 回到第一个或第一个已处理
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

  // —— Evidence focus ——
  const focusedAssetId = live.focus?.assetId ?? selectedAssetId;

  const handleSelectAsset = useCallback((id: string) => {
    setSelectedAssetId(id);
    setViewMode('single');
    setSelectedClusterId(null);
    live.clearFocus();
  }, [live]);

  const handleSelectCluster = useCallback((clusterId: string | null) => {
    setSelectedClusterId(clusterId);
    if (clusterId) {
      setInspectorTab('suite-insights');
      // 中央切换到聚类模式
      setViewMode('clusters');
    }
  }, []);

  const recipeCompleteness = selectRecipeCompleteness(live.state);

  // —— 响应式：检测窗口宽度，窄屏自动折叠轨迹 ——
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth <= 1366) setTraceCollapsed(true);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
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
          state={analysisState}
          selectedAssetId={focusedAssetId}
          onSelectAsset={handleSelectAsset}
          projection={projection}
        />

        {/* 中央分析工作区 */}
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
            />
          )}

          <MilestoneReveal key={sessionKey} state={live.state} />
        </div>

        {/* 分析轨迹（可折叠） */}
        {!traceCollapsed && (
          <aside
            className="flex shrink-0 flex-col border-l"
            style={{ width: 280, background: 'var(--gc-bg-app)', borderColor: 'var(--gc-line)' }}
          >
            <AnalysisTrace
              state={live.state}
              highlightedSequence={live.highlightedSequence}
              onFocusEvidence={live.focusEvidence}
            />
          </aside>
        )}
        {/* 折叠后的窄栏：展开按钮 */}
        {traceCollapsed && (
          <button
            onClick={() => setTraceCollapsed(false)}
            className="flex shrink-0 flex-col items-center justify-center border-l py-2"
            style={{
              width: 28,
              background: 'var(--gc-bg-elev-1)',
              borderColor: 'var(--gc-line)',
            }}
            title="展开分析轨迹"
          >
            <span
              className="gc-data text-2xs"
              style={{ color: 'var(--gc-text-faint)', writingMode: 'vertical-rl' }}
            >
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
        />
      </div>

      <PersistentTaskBar live={live} />
    </div>
  );
}
