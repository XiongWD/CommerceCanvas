/**
 * 卖点顺序模式（F2 §5.4）。
 * 将竞品套图形成的页面节奏可视化（纵向轨道），不使用 React Flow。
 * 每个节点关联图片、构图、光线、是否可继承、是否需 Product Master 事实校验。
 */
import type { SellingPointNode, CompetitorAsset } from '@/types/competitor-analysis';
import { Check, AlertCircle } from 'lucide-react';

interface SellingPointSequenceViewProps {
  sellingPoints: SellingPointNode[];
  assets: CompetitorAsset[];
  onSelectAsset: (id: string) => void;
  /** F2-R1.2：点击卖点节点主体 → 导航 */
  onSelectSellingPoint?: (spId: string) => void;
  selectedSellingPointId?: string | null;
}

export function SellingPointSequenceView({
  sellingPoints,
  assets,
  onSelectAsset,
  onSelectSellingPoint,
  selectedSellingPointId,
}: SellingPointSequenceViewProps) {
  const sorted = [...sellingPoints].sort((a, b) => a.order - b.order);

  return (
    <div
      data-testid="selling-point-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto flex flex-col" style={{ maxWidth: 700 }}>
        <div className="gc-section-label mb-3">套图页面节奏</div>
        <div className="relative">
          {/* 纵向连线 */}
          <div
            className="absolute left-3 top-2 bottom-2"
            style={{ width: 1, background: 'var(--gc-line)' }}
          />
          {sorted.map((sp) => {
            const spAssets = sp.assetIds
              .map((id) => assets.find((a) => a.id === id))
              .filter(Boolean) as CompetitorAsset[];
            return (
              <div key={sp.id} className="relative flex gap-3 pb-4">
                {/* 序号节点 */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 24,
                      height: 24,
                      background: sp.inheritable ? 'var(--gc-accent-green-soft)' : 'var(--gc-accent-amber-soft)',
                      border: `1.5px solid ${sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)'}`,
                    }}
                  >
                    <span className="gc-data text-2xs font-bold" style={{ color: sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)' }}>
                      {sp.order}
                    </span>
                  </div>
                </div>
                {/* 卖点内容（F2-R1.2：主体可点击 → 导航 + 高亮） */}
                <div
                  data-testid={`selling-point-${sp.id}`}
                  onClick={() => onSelectSellingPoint?.(sp.id)}
                  className="min-w-0 flex-1 cursor-pointer rounded-sm p-2.5 transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
                  style={{
                    background: selectedSellingPointId === sp.id ? 'var(--gc-accent-blue-soft)' : 'var(--gc-bg-app)',
                    border: `1px solid ${selectedSellingPointId === sp.id ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>
                      {sp.nameZh}
                    </span>
                    {sp.inheritable ? (
                      <span className="flex items-center gap-0.5 text-2xs" style={{ color: 'var(--gc-accent-green)' }}>
                        <Check size={10} /> 可继承
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                        <AlertCircle size={10} /> 待评估
                      </span>
                    )}
                    {sp.needsFactCheck && (
                      <span className="text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                        需 Product Master 事实校验
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                    构图 {sp.compositionZh} · 光线 {sp.lightingZh}
                  </div>
                  {/* 关联图片 */}
                  <div className="mt-1.5 flex gap-1">
                    {spAssets.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => onSelectAsset(a.id)}
                        className="overflow-hidden rounded-sm transition-transform duration-snap hover:scale-105"
                        style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})` }}
                      >
                        <img src={a.src} alt="" className="h-full w-full object-cover" draggable={false} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
