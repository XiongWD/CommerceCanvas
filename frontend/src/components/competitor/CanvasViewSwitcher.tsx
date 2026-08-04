/**
 * 中央查看模式切换器（F2 §五）。
 * 单图证据 / 套图总览 / 构图聚类 / 卖点顺序。
 */
import { Image, LayoutGrid, Boxes, ListOrdered } from 'lucide-react';
import type { CanvasViewMode } from '@/types/competitor-analysis';

const MODES: { mode: CanvasViewMode; labelZh: string; icon: typeof Image }[] = [
  { mode: 'single', labelZh: '单图证据', icon: Image },
  { mode: 'contact-sheet', labelZh: '套图总览', icon: LayoutGrid },
  { mode: 'clusters', labelZh: '构图聚类', icon: Boxes },
  { mode: 'selling-points', labelZh: '卖点顺序', icon: ListOrdered },
];

export function CanvasViewSwitcher({
  mode,
  onChange,
}: {
  mode: CanvasViewMode;
  onChange: (m: CanvasViewMode) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {MODES.map(({ mode: m, labelZh, icon: Icon }) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            data-testid={`view-mode-${m}`}
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs transition-colors duration-snap"
            style={{
              color: isActive ? 'var(--gc-accent-blue)' : 'var(--gc-text-lo)',
              background: isActive ? 'var(--gc-accent-blue-soft)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
            }}
          >
            <Icon size={11} />
            <span>{labelZh}</span>
          </button>
        );
      })}
    </div>
  );
}
