/**
 * 构图聚类模式（F2-R1.3：真实详情联动）。
 * selectedClusterId=null → 全部聚类卡片。
 * selectedClusterId=id → 该聚类详情（全部图片集合+特征+置信度+风险+返回按钮）。
 */
import type { CompositionCluster, CompetitorAsset } from '@/types/competitor-analysis';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ArrowLeft } from 'lucide-react';

interface ClusterViewProps {
  clusters: CompositionCluster[];
  assets: CompetitorAsset[];
  selectedClusterId: string | null;
  onSelectCluster: (id: string | null) => void;
  onSelectAsset?: (id: string) => void;
}

export function ClusterView({
  clusters,
  assets,
  selectedClusterId,
  onSelectCluster,
  onSelectAsset,
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

  // —— 详情模式：只显示选中聚类 ——
  if (selectedClusterId) {
    const cluster = clusters.find((c) => c.id === selectedClusterId);
    if (!cluster) return null;
    const color = clusterColor(cluster.id);
    const clusterAssets = cluster.assetIds
      .map((id) => assets.find((a) => a.id === id))
      .filter(Boolean) as CompetitorAsset[];

    return (
      <div
        data-testid="cluster-view"
        data-selected-cluster-id={selectedClusterId}
        className="min-h-0 flex-1 overflow-y-auto p-4"
        style={{ background: 'var(--gc-bg-canvas)' }}
      >
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          {/* 返回按钮 */}
          <button
            onClick={() => onSelectCluster(null)}
            data-testid="cluster-back-to-overview"
            className="mb-3 flex items-center gap-1 text-2xs"
            style={{ color: 'var(--gc-accent-blue)' }}
          >
            <ArrowLeft size={12} /> 返回全部聚类
          </button>

          {/* 聚类头部 */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="flex items-center justify-center rounded-full text-xs font-bold"
              style={{ width: 28, height: 28, background: color, color: 'var(--gc-bg-base)' }}
            >
              {cluster.id.replace('cluster-', '').charAt(0).toUpperCase()}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
              {cluster.nameZh}
            </span>
            <span className="gc-data text-2xs" style={{ color }}>
              {clusterAssets.length} 张图片
            </span>
            <ConfidenceBadge confidence={cluster.borrowability} />
          </div>

          {/* 构图特征 */}
          <div className="mb-2">
            <div className="gc-section-label mb-1">构图特征</div>
            <div className="flex flex-wrap gap-1">
              {cluster.compositionFeaturesZh.map((f, i) => (
                <span key={i} className="text-2xs" style={{ color: 'var(--gc-text-mid)', background: 'var(--gc-bg-elev-2)', padding: '2px 6px', border: '1px solid var(--gc-line)' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* 推荐槽位 */}
          <div className="mb-2 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
            推荐槽位：{cluster.suitableSlotsZh.join('、')}
          </div>

          {/* 风险提示 */}
          {cluster.riskNoteZh && (
            <div className="mb-3 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
              ⚠ {cluster.riskNoteZh}
            </div>
          )}

          {/* 全部关联图片集合 */}
          <div className="gc-section-label mb-2">关联图片集合</div>
          <div className="grid grid-cols-4 gap-2">
            {clusterAssets.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectAsset?.(a.id)}
                data-testid={`cluster-asset-${a.id}`}
                className="group relative overflow-hidden rounded-sm transition-transform duration-snap hover:scale-105"
                style={{
                  aspectRatio: '1 / 1',
                  background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})`,
                  border: '1px solid var(--gc-line)',
                }}
              >
                <img src={a.src} alt={a.filename} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-1 top-1 rounded-sm px-1 py-0.5 text-2xs" style={{ color: 'var(--gc-text-hi)', background: 'rgba(12,14,18,0.75)' }}>
                  {a.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // —— 总览模式：全部聚类卡片 ——
  return (
    <div
      data-testid="cluster-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto flex flex-col gap-3" style={{ maxWidth: 900 }}>
        {clusters.map((cluster) => {
          const color = clusterColor(cluster.id);
          const clusterAssets = cluster.assetIds
            .map((id) => assets.find((a) => a.id === id))
            .filter(Boolean) as CompetitorAsset[];
          const representative = clusterAssets[0];

          return (
            <button
              key={cluster.id}
              onClick={() => onSelectCluster(cluster.id)}
              data-testid={`cluster-${cluster.id}`}
              className="flex gap-4 rounded-sm p-3 text-left transition-all duration-snap"
              style={{ background: 'var(--gc-bg-app)', border: `1px solid var(--gc-line)`, borderLeft: `3px solid ${color}` }}
            >
              {representative && (
                <div className="relative shrink-0 overflow-hidden rounded-sm" style={{ width: 100, height: 100, background: `linear-gradient(135deg, ${representative.thumbPalette.from}, ${representative.thumbPalette.to})` }}>
                  <img src={representative.src} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>{cluster.nameZh}</span>
                  <span className="gc-data text-2xs" style={{ color }}>{clusterAssets.length} 张</span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {clusterAssets.slice(0, 6).map((a) => (
                    <button
                      key={a.id}
                      onClick={(e) => { e.stopPropagation(); onSelectAsset?.(a.id); }}
                      className="overflow-hidden rounded-sm transition-transform duration-snap hover:scale-110"
                      style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})` }}
                    >
                      <img src={a.src} alt="" className="h-full w-full object-cover" draggable={false} />
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {cluster.compositionFeaturesZh.map((f, i) => (
                    <span key={i} className="text-2xs" style={{ color: 'var(--gc-text-lo)' }}>
                      {f}{i < cluster.compositionFeaturesZh.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                  适合槽位：{cluster.suitableSlotsZh.join('、')}
                </div>
                <div className="mt-1.5">
                  <ConfidenceBadge confidence={cluster.borrowability} />
                </div>
                {cluster.riskNoteZh && (
                  <div className="mt-1 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>⚠ {cluster.riskNoteZh}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
