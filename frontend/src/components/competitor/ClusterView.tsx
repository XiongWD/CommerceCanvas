/**
 * 构图聚类模式（F2 §5.3）。
 * 将 12 张图片分入 3–4 个构图系统，每个聚类展示特征/代表图片/可借鉴程度/风险。
 * 点击聚类后中央只显示该聚类图片，右侧切换聚类结论。
 */
import type { CompositionCluster, CompetitorAsset } from '@/types/competitor-analysis';
import { ConfidenceBadge } from './ConfidenceBadge';

interface ClusterViewProps {
  clusters: CompositionCluster[];
  assets: CompetitorAsset[];
  selectedClusterId: string | null;
  onSelectCluster: (id: string | null) => void;
}

export function ClusterView({
  clusters,
  assets,
  selectedClusterId,
  onSelectCluster,
}: ClusterViewProps) {
  const clusterColor = (id: string) => {
    const letter = id.replace('cluster-', '').charAt(0).toUpperCase();
    switch (letter) {
      case 'A': return 'var(--gc-accent-blue)';
      case 'B': return 'var(--gc-accent-green)';
      case 'C': return 'var(--gc-accent-purple)';
      case 'D': return 'var(--gc-accent-amber)';
      default: return 'var(--gc-text-faint)';
    }
  };

  return (
    <div
      data-testid="cluster-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto flex flex-col gap-3" style={{ maxWidth: 900 }}>
        {clusters.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          const color = clusterColor(cluster.id);
          const clusterAssets = cluster.assetIds
            .map((id) => assets.find((a) => a.id === id))
            .filter(Boolean) as CompetitorAsset[];
          const representative = clusterAssets[0];

          return (
            <button
              key={cluster.id}
              onClick={() => onSelectCluster(isSelected ? null : cluster.id)}
              data-testid={`cluster-${cluster.id}`}
              className="flex gap-4 rounded-sm p-3 text-left transition-all duration-snap"
              style={{
                background: isSelected ? 'var(--gc-bg-elev-2)' : 'var(--gc-bg-app)',
                border: `1px solid ${isSelected ? color : 'var(--gc-line)'}`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              {/* 代表图片 */}
              {representative && (
                <div
                  className="relative shrink-0 overflow-hidden rounded-sm"
                  style={{ width: 100, height: 100, background: `linear-gradient(135deg, ${representative.thumbPalette.from}, ${representative.thumbPalette.to})` }}
                >
                  <img src={representative.src} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
                </div>
              )}
              {/* 聚类信息 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
                    {cluster.nameZh}
                  </span>
                  <span className="gc-data text-2xs" style={{ color }}>
                    {clusterAssets.length} 张
                  </span>
                </div>
                {/* 缩略图行 */}
                <div className="mt-1.5 flex gap-1">
                  {clusterAssets.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className="overflow-hidden rounded-sm"
                      style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})` }}
                    >
                      <img src={a.src} alt="" className="h-full w-full object-cover" draggable={false} />
                    </div>
                  ))}
                </div>
                {/* 构图特征 */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {cluster.compositionFeaturesZh.map((f, i) => (
                    <span key={i} className="text-2xs" style={{ color: 'var(--gc-text-lo)' }}>
                      {f}{i < cluster.compositionFeaturesZh.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>
                {/* 适合槽位 */}
                <div className="mt-1 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                  适合槽位：{cluster.suitableSlotsZh.join('、')}
                </div>
                {/* 可借鉴程度 */}
                <div className="mt-1.5">
                  <ConfidenceBadge confidence={cluster.borrowability} />
                </div>
                {/* 风险提示 */}
                {cluster.riskNoteZh && (
                  <div className="mt-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                    ⚠ {cluster.riskNoteZh}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
