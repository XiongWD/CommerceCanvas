import { useState } from 'react';
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
import type { CanvasViewMode, InspectorTab } from '@/types/competitor-analysis';

/**
 * CommerceCanvas 全局工作台 Shell（F2：竞品套图分析完整展示页深化）。
 *
 * 布局柱：
 *   顶部：演示控制 + 环境智能反馈
 *   主体：64px 图标栏 + 244px 上下文栏（Product Master + 分组筛选 + 套图统计）
 *         + 中央画布（最大，4 种查看模式）+ 分析轨迹 + 340px 检查器（4 Tab）
 *   底部：持续任务面板
 */
export function App() {
  const state = competitorAnalysisMock;
  const live = useLiveIntelligence('normal');

  // 页面级状态：中央查看模式 + 选中资产 + 选中聚类 + 检查器 Tab
  const [viewMode, setViewMode] = useState<CanvasViewMode>('single');
  const [selectedAssetId, setSelectedAssetId] = useState(state.assets[0].id);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('current-image');

  // Evidence 双向定位：trace 焦点 → 切换资产 + 画布高亮
  const focusedAssetId = live.focus?.assetId ?? selectedAssetId;
  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setViewMode('single');
    live.clearFocus();
  };

  // 聚类选择 → 切换检查器到洞察 Tab
  const handleSelectCluster = (clusterId: string | null) => {
    setSelectedClusterId(clusterId);
    if (clusterId) setInspectorTab('suite-insights');
  };

  const recipeCompleteness = selectRecipeCompleteness(live.state);
  const isIdle = live.state.jobStatus === 'idle';

  // 渐进页面（§九）：idle 时不显示最终结论，套图总览只显示已处理图片
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* 顶部：演示控制 */}
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

      {/* 主体行 */}
      <div className="flex min-h-0 flex-1">
        <GlobalRail />
        <ContextSidebar
          state={state}
          selectedAssetId={focusedAssetId}
          onSelectAsset={handleSelectAsset}
        />

        {/* 中央分析工作区：4 种查看模式 */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* 模式切换器 */}
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

          {/* 模式内容 */}
          {viewMode === 'single' && (
            <CompetitorAnalysisCanvas
              assets={state.assets}
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
              assets={state.assets}
              selectedAssetId={focusedAssetId}
              onSelectAsset={handleSelectAsset}
              liveState={live.state}
              isIdle={isIdle}
            />
          )}
          {viewMode === 'clusters' && (
            <ClusterView
              clusters={state.clusters}
              assets={state.assets}
              selectedClusterId={selectedClusterId}
              onSelectCluster={handleSelectCluster}
            />
          )}
          {viewMode === 'selling-points' && (
            <SellingPointSequenceView
              sellingPoints={state.sellingPoints}
              assets={state.assets}
              onSelectAsset={handleSelectAsset}
            />
          )}

          <MilestoneReveal key={`${live.state.jobId}#${live.state.runId}`} state={live.state} />
        </div>

        {/* 分析轨迹面板 */}
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

        <InspectorPanel
          state={state}
          selectedAssetId={focusedAssetId}
          recipeCompletenessPct={recipeCompleteness}
          onSelectAsset={handleSelectAsset}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
        />
      </div>

      <PersistentTaskBar live={live} />
    </div>
  );
}
