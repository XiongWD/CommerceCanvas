/**
 * 套图总览模式（F2-R1 §5.2，投影驱动渐进）。
 * idle：0 张已分析 + 12 占位；running：已处理图片；completed：全部 12 张。
 */
import type { CompetitorAsset } from '@/types/competitor-analysis';
import type { CompetitorAnalysisProjection } from '@/features/competitor-analysis/state/competitor-analysis-projection';

interface ContactSheetViewProps {
  assets: CompetitorAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  projection: CompetitorAnalysisProjection;
}

export function ContactSheetView({
  assets,
  selectedAssetId,
  onSelectAsset,
  projection,
}: ContactSheetViewProps) {
  const visibleSet = new Set(projection.visibleAssetIds);
  const visibleAssets = assets.filter((a) => visibleSet.has(a.id));
  const unprocessedCount = assets.length - visibleAssets.length;

  return (
    <div
      data-testid="contact-sheet-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto grid grid-cols-4 gap-2" style={{ maxWidth: 900 }}>
        {visibleAssets.map((asset) => {
          const selected = asset.id === selectedAssetId;
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
                border: selected ? '2px solid var(--gc-accent-blue)' : '1px solid var(--gc-line)',
              }}
            >
              <img src={asset.src} alt={asset.filename} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded-sm px-1 py-0.5 text-2xs" style={{ color: 'var(--gc-text-hi)', background: 'rgba(12,14,18,0.75)' }}>
                {asset.role}
              </span>
              {asset.clusterId && (
                <span className="absolute right-1 top-1 flex items-center justify-center rounded-full text-2xs font-bold" style={{ width: 16, height: 16, background: clusterColor, color: 'var(--gc-bg-base)' }}>
                  {asset.clusterId.replace('cluster-', '').charAt(0).toUpperCase()}
                </span>
              )}
              {asset.riskCount > 0 && (
                <span className="gc-data absolute bottom-1 right-1 rounded-sm px-1 text-2xs" style={{ color: 'var(--gc-accent-amber)', background: 'rgba(12,14,18,0.75)' }}>
                  ×{asset.riskCount}
                </span>
              )}
            </button>
          );
        })}
        {/* 未处理占位 */}
        {Array.from({ length: unprocessedCount }).map((_, i) => (
          <div
            key={`placeholder-${i}`}
            className="flex items-center justify-center rounded-sm"
            style={{ aspectRatio: '1 / 1', background: 'var(--gc-bg-elev-1)', border: '1px dashed var(--gc-line)' }}
          >
            <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>等待分析</span>
          </div>
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
