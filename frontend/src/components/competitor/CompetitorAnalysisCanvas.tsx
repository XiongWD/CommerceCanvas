import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { CompetitorAsset, EvidenceKind } from '@/types/competitor-analysis';
import { EvidenceOverlay } from './EvidenceOverlay';
import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';
import type { EvidenceFocus } from '@/features/live-intelligence/useLiveIntelligence';

/**
 * 中央媒体画布（任务书 §6.3 / FD-027 / PRD-P-007 / F1 §8.3 Evidence 联动）。
 * 页面核心区域，必须占最大视觉面积。
 *
 * F1：Evidence 双向定位——
 *   - 接收 live focus：自动切换图层、高亮对应区域、其他降权。
 *   - 点击画布 Evidence → 反向定位到分析轨迹对应事件。
 */

const LAYER_ORDER: { kind: EvidenceKind; labelZh: string }[] = [
  { kind: 'subject', labelZh: '商品主体' },
  { kind: 'safe', labelZh: '主体安全区' },
  { kind: 'logo', labelZh: 'Logo / 文字风险' },
  { kind: 'guide', labelZh: '构图辅助线' },
];

interface CompetitorAnalysisCanvasProps {
  assets: CompetitorAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  /** F1：live 状态（用于反向定位 evidence → trace） */
  liveState?: LiveIntelligenceState;
  focus?: EvidenceFocus;
  onFocusEvidence: (f: EvidenceFocus) => void;
  onClearFocus: () => void;
}

export function CompetitorAnalysisCanvas({
  assets,
  selectedAssetId,
  onSelectAsset,
  liveState,
  focus,
  onFocusEvidence,
}: CompetitorAnalysisCanvasProps) {
  const selectedIndex = Math.max(
    0,
    assets.findIndex((a) => a.id === selectedAssetId),
  );
  const asset = assets[selectedIndex];

  const [zoom, setZoom] = useState(68); // 演示静态缩放比例（%）
  const [layers, setLayers] = useState<Record<EvidenceKind, boolean>>({
    subject: true,
    safe: true,
    logo: true,
    guide: true,
  });

  const toggleLayer = (kind: EvidenceKind) =>
    setLayers((prev) => ({ ...prev, [kind]: !prev[kind] }));

  /** F1 R1.1：统一 Evidence → 轨迹定位，支持三级回退（regionId → assetId+layer → assetId） */
  const findSequenceForEvidence = (params: {
    regionId?: string;
    assetId?: string;
    layer?: 'subject' | 'logo' | 'safe' | 'guide' | 'text';
  }): number | undefined => {
    if (!liveState) return undefined;
    const { regionId, assetId, layer } = params;
    // 1. regionId 精确匹配
    if (regionId) {
      const exact = liveState.trace.find((t) =>
        t.evidenceRefs?.some((r) => r.regionId === regionId),
      );
      if (exact) return exact.sequence;
    }
    // 2. assetId + layer 匹配
    if (assetId && layer) {
      const byAssetLayer = liveState.trace.find((t) =>
        t.evidenceRefs?.some((r) => r.assetId === assetId && r.layer === layer),
      );
      if (byAssetLayer) return byAssetLayer.sequence;
    }
    // 3. assetId 匹配（最宽回退）
    if (assetId) {
      const byAsset = liveState.trace.find((t) =>
        t.evidenceRefs?.some((r) => r.assetId === assetId),
      );
      if (byAsset) return byAsset.sequence;
    }
    return undefined;
  };

  const goPrev = () => {
    if (selectedIndex > 0) onSelectAsset(assets[selectedIndex - 1].id);
  };
  const goNext = () => {
    if (selectedIndex < assets.length - 1)
      onSelectAsset(assets[selectedIndex + 1].id);
  };

  // 当前图片证据统计（真实分母，演示完成态）
  const evidenceCounts = useMemo(() => {
    const c: Record<EvidenceKind, number> = { subject: 0, safe: 0, logo: 0, guide: 0 };
    asset.evidences.forEach((e) => {
      c[e.kind] += 1;
    });
    return c;
  }, [asset]);

  return (
    <section
      data-testid="analysis-canvas"
      className="flex min-w-0 flex-1 flex-col"
      style={{ background: 'var(--gc-bg-canvas)' }}
    >
      {/* 画布工具栏 */}
      <header
        className="flex shrink-0 items-center justify-between border-b px-4 py-2"
        style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-app)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--gc-text-hi)' }}
          >
            {asset.role}
          </span>
          <span
            className="gc-data text-2xs"
            style={{ color: 'var(--gc-text-faint)' }}
          >
            {asset.filename}
          </span>
          {asset.status === '待人工确认' && (
            <span
              className="text-2xs"
              style={{
                color: 'var(--gc-accent-amber)',
                background: 'var(--gc-accent-amber-soft)',
                padding: '1px 6px',
                borderRadius: 2,
              }}
            >
              待人工确认
            </span>
          )}
        </div>

        {/* 图层开关（任务书 §6.3：可开关的分析图层）*/}
        <div className="flex items-center gap-1">
          {LAYER_ORDER.map(({ kind, labelZh }) => (
            <button
              key={kind}
              onClick={() => toggleLayer(kind)}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs transition-colors duration-snap"
              style={{
                color: layers[kind] ? 'var(--gc-text-mid)' : 'var(--gc-text-faint)',
                background: layers[kind] ? 'var(--gc-bg-elev-1)' : 'transparent',
                border: '1px solid var(--gc-line)',
              }}
              aria-pressed={layers[kind]}
              title={`${layers[kind] ? '隐藏' : '显示'}${labelZh}`}
            >
              {layers[kind] ? <Eye size={11} /> : <EyeOff size={11} />}
              <span>{labelZh}</span>
              <span
                className="gc-data"
                style={{ color: 'var(--gc-text-faint)' }}
              >
                {evidenceCounts[kind]}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* 主图区：占最大视觉面积 */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-6">
        <div className="relative" style={{ width: '100%', maxWidth: 720 }}>
          {/* 主图：本地无品牌 SVG 演示素材（P2，不依赖远程链接）。
              证据叠加层覆盖在真实素材之上（任务书 §6.3 / 演示素材标注）。*/}
          <div
            className="relative mx-auto overflow-hidden"
            style={{
              aspectRatio: '1 / 1',
              width: `${zoom}%`,
              background: `linear-gradient(135deg, ${asset.thumbPalette.from}, ${asset.thumbPalette.to})`,
              border: '1px solid var(--gc-line-strong)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src={asset.src}
              alt={`演示素材：${asset.role} ${asset.filename}`}
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{ objectFit: 'cover' }}
            />
            <EvidenceOverlay
              evidences={asset.evidences}
              layerVisibility={layers}
              highlightRegionId={
                focus && focus.assetId === asset.id ? focus.regionId : undefined
              }
              onRegionClick={(region) => {
                onFocusEvidence({
                  assetId: asset.id,
                  layer: region.kind,
                  regionId: region.id,
                  source: 'canvas',
                  fromSequence: findSequenceForEvidence({
                    regionId: region.id,
                    assetId: asset.id,
                    layer: region.kind,
                  }),
                });
              }}
            />
            {/* 演示数据角标：诚实标注（START_HERE §4 / 验收清单 A / 任务书 §6.3）*/}
            <span
              className="absolute right-2 top-2 text-2xs"
              style={{
                color: 'var(--gc-text-faint)',
                background: 'rgba(12,14,18,0.6)',
                padding: '2px 6px',
                border: '1px solid var(--gc-line)',
                borderRadius: 2,
              }}
            >
              演示素材 · 模拟分析结果
            </span>
          </div>

          {/* 上一张 / 下一张（任务书 §6.3）*/}
          <CanvasNavButton
            side="left"
            disabled={selectedIndex === 0}
            onClick={goPrev}
            label="上一张"
          />
          <CanvasNavButton
            side="right"
            disabled={selectedIndex === assets.length - 1}
            onClick={goNext}
            label="下一张"
          />
        </div>

        {/* 缩放控件（任务书 §6.3：缩放比例显示）*/}
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1"
          style={{
            background: 'var(--gc-bg-elev-2)',
            border: '1px solid var(--gc-line)',
            borderRadius: 2,
          }}
        >
          <ZoomBtn onClick={() => setZoom((z) => Math.max(40, z - 8))} label="缩小">
            <ZoomOut size={13} />
          </ZoomBtn>
          <span
            className="gc-data px-2 text-2xs"
            style={{ color: 'var(--gc-text-mid)', minWidth: 38, textAlign: 'center' }}
          >
            {zoom}%
          </span>
          <ZoomBtn onClick={() => setZoom((z) => Math.min(100, z + 8))} label="放大">
            <ZoomIn size={13} />
          </ZoomBtn>
          <span
            className="mx-1"
            style={{ width: 1, height: 14, background: 'var(--gc-line)' }}
          />
          <ZoomBtn onClick={() => setZoom(68)} label="适应窗口">
            <Maximize2 size={13} />
          </ZoomBtn>
        </div>
      </div>

      {/* 底部缩略图条：快速切换（任务书 §6.3）*/}
      <footer
        className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-t px-4 py-2"
        style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-app)' }}
      >
        {assets.map((a, i) => {
          const selected = a.id === selectedAssetId;
          const focus = a.thumbFocus ?? { x: 50, y: 50, scale: 1 };
          return (
            <button
              key={a.id}
              onClick={() => onSelectAsset(a.id)}
              aria-label={`切换到第 ${i + 1} 张 ${a.role}`}
              className="relative shrink-0 overflow-hidden transition-all duration-snap"
              style={{
                width: selected ? 56 : 44,
                height: selected ? 56 : 44,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})`,
                border: selected
                  ? '1px solid var(--gc-accent-blue)'
                  : '1px solid var(--gc-line)',
              }}
            >
              {/* 真实演示素材缩略图，按 thumbFocus 裁切产生可见差异（P2）*/}
              <img
                src={a.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                style={{
                  objectFit: 'cover',
                  objectPosition: `${focus.x}% ${focus.y}%`,
                  transform: `scale(${focus.scale})`,
                }}
              />
              <span
                className="gc-data absolute bottom-0 left-0 px-0.5 text-2xs"
                style={{ color: 'var(--gc-text-faint)', background: 'rgba(0,0,0,0.55)' }}
              >
                {i + 1}
              </span>
            </button>
          );
        })}
      </footer>
    </section>
  );
}

function CanvasNavButton({
  side,
  disabled,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm transition-colors duration-snap disabled:opacity-30"
      style={{
        [side === 'left' ? 'left' : 'right']: -16,
        background: 'var(--gc-bg-elev-2)',
        border: '1px solid var(--gc-line-strong)',
        color: 'var(--gc-text-mid)',
      } as React.CSSProperties}
    >
      {side === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

function ZoomBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
      style={{ color: 'var(--gc-text-lo)' }}
    >
      {children}
    </button>
  );
}
