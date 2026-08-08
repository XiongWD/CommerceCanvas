/**
 * F3.5 R5 — Graphite Native Tooltip（无 Astryx runtime）。
 *
 * 还原 F0-F3 原生 CSS Tooltip 契约（label/side API），并扩展 content/placement
 * 别名以兼容 R2 引入的命名：
 *   - label (string)         F0-F3 canonical；优先级低于 content
 *   - content (ReactNode)    R2 别名，用于多行 / 富文本
 *   - side ('right'|'top'|'bottom')  F0-F3 canonical
 *   - placement ('start'|'end'|'above'|'below')  R2 别名，映射到 side
 *
 * 行为：hover/focus 显示，纯 CSS 定位，无外部依赖。
 */
import { useState, type ReactNode } from 'react';

export interface TooltipProps {
  /** F0-F3 canonical tooltip 文本；优先级低于 content。 */
  label?: string;
  /** R2 别名（canonical）：富文本 / 多行内容。 */
  content?: ReactNode;
  children: ReactNode;
  /** F0-F3 canonical 方位。 */
  side?: 'right' | 'top' | 'bottom';
  /** R2 别名方位，映射到 side。 */
  placement?: 'start' | 'end' | 'above' | 'below';
}

const PLACEMENT_TO_SIDE: Record<NonNullable<TooltipProps['placement']>, NonNullable<TooltipProps['side']>> = {
  start: 'right',
  end: 'right',
  above: 'top',
  below: 'bottom',
};

export function Tooltip({ label, content, children, side, placement }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const resolvedContent: ReactNode = content ?? label;
  const resolvedSide = side ?? (placement ? PLACEMENT_TO_SIDE[placement] : 'right');

  if (!resolvedContent) {
    // 无内容时 Tooltip 退化为透传，避免空浮层。
    return <>{children}</>;
  }

  const positionClass =
    resolvedSide === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : resolvedSide === 'top'
        ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
        : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 ${positionClass}`}
          style={{
            background: 'var(--gc-bg-elev-2)',
            color: 'var(--gc-text-hi)',
            border: '1px solid var(--gc-line-strong)',
            padding: '4px 8px',
            fontSize: '11px',
            lineHeight: '16px',
            borderRadius: '2px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            maxWidth: 280,
            whiteSpace: 'normal',
          }}
        >
          {resolvedContent}
        </span>
      )}
    </span>
  );
}

Tooltip.displayName = 'CommerceCanvas.Tooltip';
