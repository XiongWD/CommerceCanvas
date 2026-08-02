import type { CompetitorAnalysisState, Platform } from '@/types/competitor-analysis';
import { AssetThumbnailList } from '@/components/competitor/AssetThumbnailList';

/**
 * 项目上下文栏（任务书 §6.2）。
 * 220–260px，展示项目 / SKU / 平台 / 分析任务 / 竞品套图缩略图列表与状态。
 * 不依赖远程图片（任务书 §6.2），使用 CSS 占位。
 */

const platformZh: Record<Platform, string> = {
  amazon: 'Amazon 美国站',
  shopify: 'Shopify',
  tiktok_shop: 'TikTok Shop',
};

interface ContextSidebarProps {
  state: CompetitorAnalysisState;
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
}

export function ContextSidebar({
  state,
  selectedAssetId,
  onSelectAsset,
}: ContextSidebarProps) {
  return (
    <aside
      className="flex shrink-0 flex-col border-r"
      style={{
        width: 'var(--gc-ctx-width)',
        background: 'var(--gc-bg-app)',
        borderColor: 'var(--gc-line)',
      }}
    >
      {/* 项目上下文头部 */}
      <header className="px-4 pb-3 pt-4">
        <div className="gc-section-label">项目</div>
        <h1
          className="mt-1.5 text-sm font-semibold"
          style={{ color: 'var(--gc-text-hi)' }}
        >
          {state.projectNameZh}
        </h1>
        <div className="mt-2 flex flex-col gap-1.5">
          <MetaRow label="SKU">
            <span className="gc-mono-chip">{state.sku}</span>
          </MetaRow>
          <MetaRow label="平台">
            <span style={{ color: 'var(--gc-text-mid)' }}>
              {platformZh[state.platform]}
            </span>
          </MetaRow>
          <MetaRow label="分析任务">
            <span style={{ color: 'var(--gc-text-mid)' }}>
              {state.taskNameZh}
            </span>
          </MetaRow>
          <MetaRow label="图片数量">
            <span className="gc-data" style={{ color: 'var(--gc-text-mid)' }}>
              {state.assetCount} 张
            </span>
          </MetaRow>
          <MetaRow label="目标">
            <span style={{ color: 'var(--gc-text-mid)' }}>{state.goalZh}</span>
          </MetaRow>
        </div>
      </header>

      <div className="gc-divider mx-4" />

      {/* 竞品套图缩略图列表 */}
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="gc-section-label">竞品套图</span>
        <span
          className="gc-data text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          风险 {state.task.risks} · 待审 {state.stats.pendingHumanReview}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AssetThumbnailList
          assets={state.assets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={onSelectAsset}
        />
      </div>

      <div className="gc-divider mx-4" />

      {/* 简要统计：可继承 / 不可继承（任务书 §6.2）*/}
      <footer className="grid grid-cols-2 px-4 py-3">
        <StatCell
          tone="blue"
          labelZh="可继承"
          count={state.stats.inheritableCount}
        />
        <StatCell
          tone="red"
          labelZh="禁止继承"
          count={state.stats.prohibitedCount}
        />
      </footer>
    </aside>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
        {label}
      </span>
      <span className="text-right text-xs">{children}</span>
    </div>
  );
}

function StatCell({
  tone,
  labelZh,
  count,
}: {
  tone: 'blue' | 'red';
  labelZh: string;
  count: number;
}) {
  const color =
    tone === 'blue' ? 'var(--gc-accent-blue)' : 'var(--gc-accent-red)';
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="gc-data text-base font-semibold"
        style={{ color }}
      >
        {count}
      </span>
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
        {labelZh}
      </span>
    </div>
  );
}
