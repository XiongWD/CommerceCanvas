import { useState } from 'react';
import { GlobalRail } from '@/components/layout/GlobalRail';
import { ContextSidebar } from '@/components/layout/ContextSidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { PersistentTaskBar } from '@/components/layout/PersistentTaskBar';
import { CompetitorAnalysisCanvas } from '@/components/competitor/CompetitorAnalysisCanvas';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';

/**
 * CommerceCanvas 全局工作台 Shell（任务书 §三 / FD-027）。
 *
 * 布局柱（桌面生产工作台）：
 *   64px 全局图标栏 + 244px 项目上下文栏 + 中央媒体画布（最大）
 *   + 340px 属性检查器 + 44px 底部持续任务栏
 *
 * 中央媒体画布始终占据最大视觉面积（FD-027 / 反模式验收）。
 * 本页面：竞品套图分析 — 分析完成态（F0 静态高保真）。
 */
export function App() {
  const state = competitorAnalysisMock;
  const [selectedAssetId, setSelectedAssetId] = useState(state.assets[0].id);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <GlobalRail />
        <ContextSidebar
          state={state}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
        />
        <CompetitorAnalysisCanvas
          assets={state.assets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
        />
        <InspectorPanel state={state} selectedAssetId={selectedAssetId} />
      </div>
      <PersistentTaskBar task={state.task} />
    </div>
  );
}
