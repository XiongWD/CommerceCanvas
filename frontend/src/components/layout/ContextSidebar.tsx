/**
 * 项目上下文栏（F2 §四）。
 * 244px，展示 Product Master 摘要 + 素材分组筛选 + 套图统计 + 竞品套图缩略图列表。
 */
import { useState, useMemo } from 'react';
import type { CompetitorAnalysisState, Platform, ImageRole } from '@/types/competitor-analysis';
import { ProductMasterSummary } from '@/components/competitor/ProductMasterSummary';
import { AssetThumbnailList } from '@/components/competitor/AssetThumbnailList';
import type { CompetitorAnalysisProjection } from '@/features/competitor-analysis/state/competitor-analysis-projection';

const platformZh: Record<Platform, string> = {
  amazon: 'Amazon 美国站',
  shopify: 'Shopify',
  tiktok_shop: 'TikTok Shop',
};

type AssetFilter = '全部' | ImageRole | '有风险' | '待确认' | '已形成结论';

const FILTERS: AssetFilter[] = ['全部', '主图', '场景图', '卖点图', '细节图', '参数图', '有风险', '待确认', '已形成结论'];

interface ContextSidebarProps {
  state: CompetitorAnalysisState;
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  projection: CompetitorAnalysisProjection;
}

export function ContextSidebar({ state, selectedAssetId, onSelectAsset, projection }: ContextSidebarProps) {
  const [filter, setFilter] = useState<AssetFilter>('全部');

  const filteredAssets = useMemo(() => {
    return state.assets.filter((a) => {
      if (filter === '全部') return true;
      if (filter === '有风险') return a.riskCount > 0;
      if (filter === '待确认') return a.status === '待人工确认';
      if (filter === '已形成结论') {
        // 从投影读取：资产是否已被分类（已出现在 visibleAssetIds）
        return projection.classifiedAssetIds.includes(a.id);
      }
      return a.role === filter;
    });
  }, [state.assets, filter, projection]);

  // 套图统计（§4.3 / §八：风险口径用权威类别数）
  const stats = useMemo(() => {
    return {
      total: projection.totalAssetCount,
      roles: 5,
      clusters: projection.visibleClusterIds.length,
      // §八：风险类别（权威），不是证据命中数
      risks: state.riskExclusion ? (projection.visibleRiskItemIds.length > 0 ? 3 : 0) : 0,
    };
  }, [projection, state.riskExclusion]);

  return (
    <aside
      className="flex shrink-0 flex-col border-r"
      style={{
        width: 'var(--gc-ctx-width)',
        background: 'var(--gc-bg-app)',
        borderColor: 'var(--gc-line)',
      }}
    >
      {/* 项目头部 */}
      <header className="shrink-0 px-3 pb-2 pt-3">
        <div className="gc-section-label">项目</div>
        <h1 className="mt-1 text-sm font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
          {state.projectNameZh}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <span className="gc-mono-chip">{state.sku}</span>
          <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
            {platformZh[state.platform]}
          </span>
        </div>
      </header>

      <div className="gc-divider mx-3" />

      {/* Product Master 摘要（§4.1） */}
      <div className="shrink-0">
        <ProductMasterSummary pm={state.productMaster} />
      </div>

      <div className="gc-divider mx-3" />

      {/* 套图统计（§4.3，紧凑） */}
      <div className="shrink-0 px-3 py-2">
        <div className="gc-section-label mb-1">套图统计</div>
        <div className="grid grid-cols-4 gap-1 text-center">
          <StatCell value={stats.total} label="图片" />
          <StatCell value={stats.roles} label="用途" />
          <StatCell value={stats.clusters} label="构图" />
          <StatCell value={stats.risks} label="风险" tone={stats.risks > 0 ? 'amber' : undefined} />
        </div>
      </div>

      <div className="gc-divider mx-3" />

      {/* 素材分组筛选（§4.2） */}
      <div className="shrink-0 px-3 py-2">
        <div className="flex flex-wrap gap-0.5">
          {FILTERS.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-sm px-1.5 py-0.5 text-2xs transition-colors duration-snap"
                style={{
                  color: isActive ? 'var(--gc-accent-blue)' : 'var(--gc-text-faint)',
                  background: isActive ? 'var(--gc-accent-blue-soft)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* 竞品套图缩略图列表（筛选后） */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AssetThumbnailList
          assets={filteredAssets}
          selectedAssetId={selectedAssetId}
          onSelectAsset={onSelectAsset}
        />
      </div>
    </aside>
  );
}

function StatCell({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: 'amber';
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="gc-data text-sm font-semibold"
        style={{ color: tone === 'amber' ? 'var(--gc-accent-amber)' : 'var(--gc-text-mid)' }}
      >
        {value}
      </span>
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
        {label}
      </span>
    </div>
  );
}
