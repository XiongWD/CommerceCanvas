/**
 * F3.5 R5 — Graphite Native Badge（无 Astryx runtime）。
 *
 * 原生 span，subtle（低饱和 soft 背景 + 状态色文字 + 细描边），
 * 不使用 filled 高对比色块（避免 running/completed 误读，遵守
 * visual-salience-contract Status Treatment）。
 *
 * 契约（兼容 R2 Astryx Badge API 子集）：
 *   variant: success | warning | error | neutral | info | purple
 *   label (ReactNode) / icon / children
 */
import type { CSSProperties, ReactNode } from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'info'
  | 'purple';

export interface BadgeProps {
  variant?: BadgeVariant;
  label?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

const VARIANT_STYLE: Record<BadgeVariant, { color: string; bg: string; border: string }> = {
  success: {
    color: 'var(--gc-accent-green)',
    bg: 'var(--gc-accent-green-soft)',
    border: 'transparent',
  },
  warning: {
    color: 'var(--gc-accent-amber)',
    bg: 'var(--gc-accent-amber-soft)',
    border: 'transparent',
  },
  error: {
    color: 'var(--gc-accent-red)',
    bg: 'var(--gc-accent-red-soft)',
    border: 'transparent',
  },
  neutral: {
    color: 'var(--gc-text-mid)',
    bg: 'var(--gc-bg-elev-2)',
    border: 'var(--gc-line)',
  },
  info: {
    color: 'var(--gc-accent-blue)',
    bg: 'var(--gc-accent-blue-soft)',
    border: 'transparent',
  },
  purple: {
    color: 'var(--gc-accent-purple)',
    bg: 'var(--gc-accent-purple-soft)',
    border: 'transparent',
  },
};

const BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  height: '18px',
  padding: '0 6px',
  borderRadius: '3px',
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: '1',
  borderWidth: '1px',
  borderStyle: 'solid',
  whiteSpace: 'nowrap',
};

export function Badge({
  variant = 'neutral',
  label,
  icon,
  children,
  testId,
  className,
  style,
}: BadgeProps) {
  const v = VARIANT_STYLE[variant];
  return (
    <span
      data-cc-component="Badge"
      data-cc-testid={testId}
      data-variant={variant}
      className={className}
      style={{
        ...BASE,
        color: v.color,
        background: v.bg,
        borderColor: v.border,
        ...style,
      }}
    >
      {icon}
      {label ?? children}
    </span>
  );
}

Badge.displayName = 'CommerceCanvas.Badge';
