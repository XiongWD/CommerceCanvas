import { useState } from 'react';
import { GlobalRail } from '@/components/layout/GlobalRail';
import { ContextSidebar } from '@/components/layout/ContextSidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { PersistentTaskBar } from '@/components/layout/PersistentTaskBar';
import { CompetitorAnalysisCanvas } from '@/components/competitor/CompetitorAnalysisCanvas';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import {
  useLiveIntelligence,
  DemoControls,
  AmbientStatus,
  AnalysisTrace,
  MilestoneReveal,
} from '@/features/live-intelligence';

/**
 * CommerceCanvas 全局工作台 Shell（F1：接入 Live Intelligence Layer）。
 *
 * 布局柱：
 *   顶部：演示控制 + 环境智能反馈
 *   主体：64px 图标栏 + 244px 上下文栏 + 中央画布（最大）+ 分析轨迹 + 340px 检查器
 *   底部：持续任务面板（紧凑/展开/详情三态）
 *
 * 中央媒体画布始终占最大视觉面积（FD-027）。
 * 所有实时态从单一 useLiveIntelligence 推导（任务书 §七）。
 */
export function App() {
  const state = competitorAnalysisMock;
  const [selectedAssetId, setSelectedAssetId] = useState(state.assets[0].id);
  const live = useLiveIntelligence('normal');

  // Evidence 双向定位：trace 焦点 → 切换资产 + 画布高亮
  const focusedAssetId = live.focus?.assetId ?? selectedAssetId;
  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    live.clearFocus();
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {/* 顶部：演示控制（明确标注演示运行 · 模拟事件流） */}
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
      {/* 环境智能反馈（克制，状态全部来自事件流） */}
      <AmbientStatus state={live.state} />

      {/* 主体行 */}
      <div className="flex min-h-0 flex-1">
        <GlobalRail />
        <ContextSidebar
          state={state}
          selectedAssetId={focusedAssetId}
          onSelectAsset={handleSelectAsset}
        />
        {/* 中央画布：相对定位以承载 MilestoneReveal overlay */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <CompetitorAnalysisCanvas
            assets={state.assets}
            selectedAssetId={focusedAssetId}
            onSelectAsset={handleSelectAsset}
            liveState={live.state}
            focus={live.focus}
            onFocusEvidence={live.focusEvidence}
            onClearFocus={live.clearFocus}
          />
          <MilestoneReveal state={live.state} />
        </div>
        {/* 分析轨迹面板（中央与检查器之间） */}
        <aside
          className="flex shrink-0 flex-col border-l"
          style={{
            width: 280,
            background: 'var(--gc-bg-app)',
            borderColor: 'var(--gc-line)',
          }}
        >
          <AnalysisTrace
            state={live.state}
            highlightedSequence={live.highlightedSequence}
            onFocusEvidence={live.focusEvidence}
          />
        </aside>
        <InspectorPanel state={state} selectedAssetId={focusedAssetId} />
      </div>

      {/* 底部：持续任务面板（三态） */}
      <PersistentTaskBar live={live} />
    </div>
  );
}
