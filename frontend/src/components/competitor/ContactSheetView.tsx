/**
 * 套图总览模式（F2 §5.2）。
 * 一次展示全部 12 张图片，显示用途标签、风险数量、聚类标记、活跃状态。
 * 点击任意图片进入单图证据模式。
 * 不得做成普通文件管理器网格。
 */
import type { CompetitorAsset } from '@/types/competitor-analysis';
import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';

interface ContactSheetViewProps {
  assets: CompetitorAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  liveState?: LiveIntelligenceState;
  /** 是否在渐进模式中（idle 时不显示全部，逐步出现） */
  isIdle: boolean;
}

export function ContactSheetView({
  assets,
  selectedAssetId,
  onSelectAsset,
  liveState,
  isIdle,
}: ContactSheetViewProps) {
  // 渐进：idle 时只显示已处理图片（来自事件流），否则显示全部
  const visibleAssets = isIdle && liveState
    ? assets.filter((a) => {
        const idx = assets.indexOf(a);
        return idx < liveState.processedImages;
      })
    : assets;

  return (
    <div
      data-testid="contact-sheet-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto grid grid-cols-4 gap-2" style={{ maxWidth: 900 }}>
        {visibleAssets.map((asset, i) => {
          const selected = asset.id === selectedAssetId;
          const isActive = liveState?.stages && Object.values(liveState.stages).some((s) => s.status === 'active');
          const clusterColor = getClusterColor(asset.clusterId);
          return (
            <button
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              data-testid={`contact-thumb-${asset.id}`}
              className="group relative overflow-hidden rounded-sm transition-all duration-snap"
              style={{
                aspectRatio: '1 / 1',
                background: `linear-gradient(135deg, ${asset.thumbPalette.from}, ${asset.thumbPalette.to})`,
                border: selected
                  ? `2px solid var(--gc-accent-blue)`
                  : `1px solid var(--gc-line)`,
                opacity: isIdle && i >= (liveState?.processedImages ?? 0) ? 0.3 : 1,
              }}
            >
              <img
                src={asset.src}
                alt={asset.filename}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              {/* 用途标签 */}
              <span
                className="absolute left-1 top-1 rounded-sm px-1 py-0.5 text-2xs"
                style={{ color: 'var(--gc-text-hi)', background: 'rgba(12,14,18,0.75)' }}
              >
                {asset.role}
              </span>
              {/* 聚类标记 */}
              {asset.clusterId && (
                <span
                  className="absolute right-1 top-1 flex items-center justify-center rounded-full text-2xs font-bold"
                  style={{
                    width: 16,
                    height: 16,
                    background: clusterColor,
                    color: 'var(--gc-bg-base)',
                  }}
                >
                  {asset.clusterId.replace('cluster-', '').charAt(0).toUpperCase()}
                </span>
              )}
              {/* 风险数量 */}
              {asset.riskCount > 0 && (
                <span
                  className="gc-data absolute bottom-1 right-1 rounded-sm px-1 text-2xs"
                  style={{ color: 'var(--gc-accent-amber)', background: 'rgba(12,14,18,0.75)' }}
                >
                  ×{asset.riskCount}
                </span>
              )}
              {/* 活跃状态脉冲 */}
              {selected && isActive && (
                <span
                  className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 0 2px var(--gc-accent-blue)' }}
                />
              )}
            </button>
          );
        })}
        {/* 未处理占位 */}
        {isIdle &&
          liveState &&
          liveState.processedImages < assets.length &&
          Array.from({ length: assets.length - liveState.processedImages }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="rounded-sm"
              style={{
                aspectRatio: '1 / 1',
                background: 'var(--gc-bg-elev-1)',
                border: '1px dashed var(--gc-line)',
              }}
            />
          ))}
      </div>
    </div>
  );
}

function getClusterColor(clusterId: string | undefined): string {
  if (!clusterId) return 'var(--gc-text-faint)';
  const letter = clusterId.replace('cluster-', '').charAt(0).toUpperCase();
  switch (letter) {
    case 'A': return 'var(--gc-accent-blue)';
    case 'B': return 'var(--gc-accent-green)';
    case 'C': return 'var(--gc-accent-purple)';
    case 'D': return 'var(--gc-accent-amber)';
    default: return 'var(--gc-text-faint)';
  }
}
