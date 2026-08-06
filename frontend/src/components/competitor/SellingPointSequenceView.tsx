/**
 * 卖点顺序模式（F2-R1.3：真实详情联动）。
 * selectedSellingPointId=null → 全部节点纵向轨道。
 * selectedSellingPointId=id → 该卖点详情（全部关联图片+构图+光线+继承+事实校验+返回）。
 */
import type { SellingPointNode, CompetitorAsset } from '@/types/competitor-analysis';
import { Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface SellingPointSequenceViewProps {
  sellingPoints: SellingPointNode[];
  assets: CompetitorAsset[];
  onSelectAsset: (id: string) => void;
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

  // —— 详情模式 ——
  if (selectedSellingPointId) {
    const sp = sellingPoints.find((s) => s.id === selectedSellingPointId);
    if (!sp) return null;
    const spAssets = sp.assetIds
      .map((id) => assets.find((a) => a.id === id))
      .filter(Boolean) as CompetitorAsset[];

    return (
      <div
        data-testid="selling-point-view"
        data-selected-selling-point-id={selectedSellingPointId}
        className="min-h-0 flex-1 overflow-y-auto p-4"
        style={{ background: 'var(--gc-bg-canvas)' }}
      >
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <button
            onClick={() => onSelectSellingPoint?.('')}
            data-testid="sp-back-to-sequence"
            className="mb-3 flex items-center gap-1 text-2xs"
            style={{ color: 'var(--gc-accent-blue)' }}
          >
            <ArrowLeft size={12} /> 返回卖点顺序
          </button>

          {/* 卖点头部 */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="flex items-center justify-center rounded-full text-2xs font-bold"
              style={{
                width: 24, height: 24,
                background: sp.inheritable ? 'var(--gc-accent-green-soft)' : 'var(--gc-accent-amber-soft)',
                border: `1.5px solid ${sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)'}`,
                color: sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)',
              }}
            >
              {sp.order}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--gc-text-hi)' }}>{sp.nameZh}</span>
          </div>

          {/* 构图/光线/继承/校验 */}
          <div className="flex flex-col gap-1 mb-3">
            <DetailRow label="构图依据" value={sp.compositionZh} />
            <DetailRow label="光线依据" value={sp.lightingZh} />
            <DetailRow
              label="可继承"
              value={sp.inheritable ? '是' : '需评估'}
              tone={sp.inheritable ? 'green' : 'amber'}
            />
            <DetailRow
              label="Product Master 事实校验"
              value={sp.needsFactCheck ? '需要' : '不需要'}
              tone={sp.needsFactCheck ? 'amber' : 'green'}
            />
          </div>

          {/* 全部关联图片集合 */}
          <div className="gc-section-label mb-2">关联图片集合（{spAssets.length} 张）</div>
          <div className="grid grid-cols-4 gap-2">
            {spAssets.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectAsset(a.id)}
                data-testid={`sp-asset-${a.id}`}
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

  // —— 序列模式 ——
  return (
    <div
      data-testid="selling-point-view"
      className="min-h-0 flex-1 overflow-y-auto p-4"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      <div className="mx-auto flex flex-col" style={{ maxWidth: 700 }}>
        <div className="gc-section-label mb-3">套图页面节奏</div>
        <div className="relative">
          <div className="absolute left-3 top-2 bottom-2" style={{ width: 1, background: 'var(--gc-line)' }} />
          {sorted.map((sp) => {
            const spAssets = sp.assetIds
              .map((id) => assets.find((a) => a.id === id))
              .filter(Boolean) as CompetitorAsset[];
            return (
              <div key={sp.id} className="relative flex gap-3 pb-4">
                <div className="relative z-10 shrink-0">
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 24, height: 24,
                      background: sp.inheritable ? 'var(--gc-accent-green-soft)' : 'var(--gc-accent-amber-soft)',
                      border: `1.5px solid ${sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)'}`,
                    }}
                  >
                    <span className="gc-data text-2xs font-bold" style={{ color: sp.inheritable ? 'var(--gc-accent-green)' : 'var(--gc-accent-amber)' }}>
                      {sp.order}
                    </span>
                  </div>
                </div>
                <div
                  data-testid={`selling-point-${sp.id}`}
                  onClick={() => onSelectSellingPoint?.(sp.id)}
                  className="min-w-0 flex-1 cursor-pointer rounded-sm p-2.5 transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
                  style={{ background: 'var(--gc-bg-app)', border: '1px solid var(--gc-line)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>{sp.nameZh}</span>
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
                      <span className="text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>需 Product Master 事实校验</span>
                    )}
                  </div>
                  <div className="mt-1 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                    构图 {sp.compositionZh} · 光线 {sp.lightingZh}
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {spAssets.map((a) => (
                      <button
                        key={a.id}
                        onClick={(e) => { e.stopPropagation(); onSelectAsset(a.id); }}
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

function DetailRow({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'amber' }) {
  const color = tone === 'green' ? 'var(--gc-accent-green)' : tone === 'amber' ? 'var(--gc-accent-amber)' : 'var(--gc-text-mid)';
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{label}</span>
      <span className="text-xs" style={{ color }}>{value}</span>
    </div>
  );
}
