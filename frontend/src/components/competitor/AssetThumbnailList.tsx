import type { CompetitorAsset } from '@/types/competitor-analysis';
import { StatusDot } from '@/components/ui/StatusDot';

/**
 * 竞品套图缩略图列表（任务书 §6.2）。
 * 缩略图使用 CSS 模拟图片，不依赖远程链接（任务书 §6.2）。
 * 每项展示：用途标签、分析状态、风险数量、当前选中。
 */

interface AssetThumbnailListProps {
  assets: CompetitorAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
}

export function AssetThumbnailList({
  assets,
  selectedAssetId,
  onSelectAsset,
}: AssetThumbnailListProps) {
  return (
    <ul className="flex flex-col gap-px px-2 py-1">
      {assets.map((asset, index) => {
        const selected = asset.id === selectedAssetId;
        const hasRisk = asset.riskCount > 0;
        return (
          <li key={asset.id}>
            <button
              onClick={() => onSelectAsset(asset.id)}
              aria-pressed={selected}
              className="group flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left transition-colors duration-snap"
              style={{
                background: selected ? 'var(--gc-bg-elev-2)' : 'transparent',
                borderLeft: selected
                  ? '2px solid var(--gc-accent-blue)'
                  : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!selected)
                  e.currentTarget.style.background = 'var(--gc-bg-elev-1)';
              }}
              onMouseLeave={(e) => {
                if (!selected) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* 序号 + CSS 占位缩略图 */}
              <span
                className="gc-data shrink-0 text-center text-2xs"
                style={{
                  width: 18,
                  color: 'var(--gc-text-faint)',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span
                className="relative shrink-0 overflow-hidden"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${asset.thumbPalette.from}, ${asset.thumbPalette.to})`,
                  border: selected
                    ? '1px solid var(--gc-accent-blue-line)'
                    : '1px solid var(--gc-line)',
                }}
              >
                {/* 模拟商品主体形状（CSS 占位）*/}
                <span
                  className="absolute"
                  style={{
                    left: '28%',
                    top: '24%',
                    width: '40%',
                    height: '52%',
                    borderRadius: 8,
                    background: 'rgba(180,185,193,0.10)',
                    boxShadow: 'inset 0 0 0 1px rgba(180,185,193,0.18)',
                  }}
                />
                {hasRisk && (
                  <span
                    className="absolute right-0.5 top-0.5"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: 'var(--gc-accent-red)',
                      boxShadow: '0 0 0 2px var(--gc-bg-app)',
                    }}
                  />
                )}
              </span>

              {/* 元信息 */}
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className="truncate text-xs"
                    style={{ color: selected ? 'var(--gc-text-hi)' : 'var(--gc-text-mid)' }}
                  >
                    {asset.role}
                  </span>
                  <StatusDot tone={asset.status === '已完成' ? 'green' : 'amber'} />
                </span>
                <span
                  className="gc-data truncate text-2xs"
                  style={{ color: 'var(--gc-text-faint)' }}
                >
                  {asset.filename}
                </span>
              </span>

              {hasRisk && (
                <span
                  className="gc-data shrink-0 text-2xs"
                  style={{ color: 'var(--gc-accent-amber)' }}
                >
                  ×{asset.riskCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
