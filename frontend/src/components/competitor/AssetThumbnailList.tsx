/**
 * 竞品套图缩略图列表（F2-R1.1 §三：idle 不泄露用途/状态/风险）。
 *
 * 未分类资产只显示：序号、文件名、"等待分析"。
 * 已分类资产才显示：用途标签、分析状态、风险红点。
 */
import type { CompetitorAsset } from '@/types/competitor-analysis';
import { StatusDot } from '@/components/ui/StatusDot';

interface AssetThumbnailListProps {
  assets: CompetitorAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  /** F2-R1.1：已分类资产 ID 集合（来自投影层） */
  classifiedAssetIds?: Set<string>;
}

export function AssetThumbnailList({
  assets,
  selectedAssetId,
  onSelectAsset,
  classifiedAssetIds,
}: AssetThumbnailListProps) {
  return (
    <ul className="flex flex-col gap-px px-2 py-1">
      {assets.map((asset, index) => {
        const selected = asset.id === selectedAssetId;
        const isClassified = classifiedAssetIds?.has(asset.id) ?? true;
        const hasRisk = isClassified && asset.riskCount > 0;
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
              <span
                className="gc-data shrink-0 text-center text-2xs"
                style={{ width: 18, color: 'var(--gc-text-faint)' }}
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
                  opacity: isClassified ? 1 : 0.5,
                }}
              >
                <img
                  src={asset.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: `${asset.thumbFocus?.x ?? 50}% ${asset.thumbFocus?.y ?? 50}%`,
                    transform: `scale(${asset.thumbFocus?.scale ?? 1})`,
                  }}
                />
                {/* F2-R1.1：只有已分类资产才显示风险红点 */}
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

              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                {isClassified ? (
                  <>
                    {/* 已分类：显示用途 + 状态 */}
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
                  </>
                ) : (
                  <>
                    {/* 未分类：只显示文件名 + "等待分析" */}
                    <span
                      className="gc-data truncate text-2xs"
                      style={{ color: 'var(--gc-text-faint)' }}
                    >
                      {asset.filename}
                    </span>
                    <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                      等待分析
                    </span>
                  </>
                )}
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
