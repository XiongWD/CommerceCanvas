/**
 * 套图洞察 Tab（F2 §7.2）。
 * 用途分布 / 构图聚类 / 光线模式 / 色彩规律 / 页面节奏 / 重复策略 / 异常图片 / 数据覆盖不足。
 * 每个结论能定位到图片或证据。
 */
import type { SuiteInsight, CompetitorAsset } from '@/types/competitor-analysis';
import { ConfidenceBadge } from './ConfidenceBadge';

export function SuiteInsightsTab({
  insights,
  assets,
  onSelectAsset,
}: {
  insights: SuiteInsight[];
  assets: CompetitorAsset[];
  onSelectAsset: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {insights.map((insight) => (
        <div
          key={insight.id}
          data-testid={`insight-${insight.id}`}
          className="rounded-sm p-2.5"
          style={{ background: 'var(--gc-bg-elev-1)', border: '1px solid var(--gc-line)' }}
        >
          <div className="flex items-center justify-between">
            <span className="gc-section-label">{insight.categoryZh}</span>
            <ConfidenceBadge confidence={insight.confidence} />
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--gc-text-mid)' }}>
            {insight.conclusionZh}
          </p>
          {/* 关联图片 */}
          {insight.assetIds.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>关联：</span>
              {insight.assetIds.slice(0, 5).map((id) => {
                const a = assets.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectAsset(id)}
                    className="overflow-hidden rounded-sm transition-transform duration-snap hover:scale-110"
                    style={{ width: 24, height: 24, background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})` }}
                  >
                    <img src={a.src} alt="" className="h-full w-full object-cover" draggable={false} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
