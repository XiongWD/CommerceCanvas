import { useState, type ReactNode } from 'react';

/**
 * 极简中文 Tooltip。
 * 任务书 §6.1：全局图标栏悬停显示中文 Tooltip，无大段文字。
 * 不引入 Radix 以控制 F0 依赖（任务书 §四：未引入则不提前加）。
 */
interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: 'right' | 'top' | 'bottom';
}

export function Tooltip({ label, children, side = 'right' }: TooltipProps) {
  const [open, setOpen] = useState(false);

  const positionClass =
    side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : side === 'top'
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
          className={`pointer-events-none absolute z-50 whitespace-nowrap ${positionClass}`}
          style={{
            background: 'var(--gc-bg-elev-2)',
            color: 'var(--gc-text-hi)',
            border: '1px solid var(--gc-line-strong)',
            padding: '4px 8px',
            fontSize: '11px',
            lineHeight: '16px',
            borderRadius: '2px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
