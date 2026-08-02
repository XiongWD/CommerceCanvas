import type { EvidenceRegion, EvidenceKind } from '@/types/competitor-analysis';

/**
 * 证据可视化叠加层（FD-031 / 计划 §6 Evidence Overlay）。
 * 在中央画布上叠加商品主体识别区、Logo/文字风险框、安全区、构图辅助线。
 *
 * 真实证据、可定位、不伪造（NG-023 / FD-036）。
 * 每个区域使用归一化坐标，与画布尺寸解耦。
 * 不遮挡商品图：标签置于边角，不做满屏浮动标签（任务书 §6.3）。
 */

interface EvidenceOverlayProps {
  evidences: EvidenceRegion[];
  /** 各类图层开关（任务书 §6.3：可开关的分析图层）*/
  layerVisibility: Record<EvidenceKind, boolean>;
  /** F1：当前高亮的区域 ID（来自 trace/canvas focus） */
  highlightRegionId?: string;
  /** F1：点击区域 → 反向定位到轨迹 */
  onRegionClick?: (region: EvidenceRegion) => void;
}

const kindColorVar: Record<EvidenceKind, string> = {
  subject: 'var(--gc-evidence-subject)',
  logo: 'var(--gc-evidence-logo)',
  safe: 'var(--gc-evidence-safe)',
  guide: 'var(--gc-evidence-guide)',
};

const kindLabelZh: Record<EvidenceKind, string> = {
  subject: '主体',
  logo: '风险',
  safe: '安全区',
  guide: '辅助线',
};

export function EvidenceOverlay({
  evidences,
  layerVisibility,
  highlightRegionId,
  onRegionClick,
}: EvidenceOverlayProps) {
  const hasHighlight = Boolean(highlightRegionId);
  return (
    <div className="pointer-events-none absolute inset-0">
      {evidences.map((ev) => {
        if (!layerVisibility[ev.kind]) return null;
        const isGuide = ev.kind === 'guide';
        const color = kindColorVar[ev.kind];
        const highlighted = hasHighlight && ev.id === highlightRegionId;
        const dimmed = hasHighlight && !highlighted;
        return (
          <div
            key={ev.id}
            onClick={onRegionClick ? () => onRegionClick(ev) : undefined}
            className="absolute"
            style={{
              left: `${ev.x * 100}%`,
              top: `${ev.y * 100}%`,
              width: `${ev.w * 100}%`,
              height: `${ev.h * 100}%`,
              border: isGuide
                ? `1px dashed ${color}`
                : highlighted
                  ? `2px solid ${color}`
                  : `1px solid ${color}`,
              background: isGuide
                ? 'transparent'
                : highlighted
                  ? `${color}33`
                  : `${color}1a`,
              boxShadow: highlighted ? `0 0 0 2px ${color}55, inset 0 0 0 1px ${color}` : isGuide ? 'none' : `inset 0 0 0 1px ${color}0d`,
              opacity: dimmed ? 0.25 : 1,
              cursor: onRegionClick ? 'pointer' : 'default',
              pointerEvents: onRegionClick ? 'auto' : 'none',
              transition: 'opacity 200ms, box-shadow 200ms',
            }}
          >
            {/* 角标标签：极小，置于左上，避免遮挡商品（任务书 §6.3）*/}
            <span
              className="gc-data absolute whitespace-nowrap"
              style={{
                left: 0,
                top: -16,
                fontSize: 10,
                lineHeight: '14px',
                padding: '1px 4px',
                color: 'var(--gc-text-hi)',
                background: 'var(--gc-bg-elev-2)',
                border: `1px solid ${color}`,
                borderRadius: 2,
              }}
            >
              {ev.labelZh}
              {typeof ev.confidence === 'number' && (
                <span style={{ color: 'var(--gc-text-faint)' }}>
                  {' '}
                  · {(ev.confidence * 100).toFixed(0)}%
                </span>
              )}
            </span>
          </div>
        );
      })}
      {/* 图例（克制，仅左下角）*/}
      <div
        className="absolute bottom-2 left-2 flex items-center gap-3"
        style={{
          padding: '4px 8px',
          background: 'rgba(12,14,18,0.72)',
          border: '1px solid var(--gc-line)',
          borderRadius: 2,
        }}
      >
        {(Object.keys(kindLabelZh) as EvidenceKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span
              style={{
                width: 8,
                height: 8,
                border: `1px solid ${kindColorVar[k]}`,
                background: `${kindColorVar[k]}1a`,
              }}
            />
            <span
              className="text-2xs"
              style={{ color: 'var(--gc-text-lo)' }}
            >
              {kindLabelZh[k]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
