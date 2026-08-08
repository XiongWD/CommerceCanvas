/**
 * F3.5 R5 — Graphite Native Button（无 Astryx runtime）。
 *
 * 原生 button + Graphite 视觉契约：
 *   - compact 密度（高度 28px，行内控件对齐 F0-F3 工作台）
 *   - variant: primary / secondary / ghost / destructive
 *   - primary 使用 --gc-action-primary（深蓝 S4 CTA），其余克制低饱和
 *
 * 契约（兼容 R2 Astryx Button API 的子集）：
 *   label, variant, icon, isLoading, isDisabled, onClick, children, testId
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'compact' | 'md';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  label?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  children?: ReactNode;
}

const VARIANT_BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '28px',
  padding: '0 12px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '1',
  borderWidth: '1px',
  borderStyle: 'solid',
  cursor: 'pointer',
  transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease, opacity 120ms ease',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  // S4: primary CTA — 深蓝，与白色文字高对比
  primary: {
    background: 'var(--gc-action-primary)',
    color: '#ffffff',
    borderColor: 'var(--gc-action-primary)',
  },
  secondary: {
    background: 'var(--gc-bg-elev-2)',
    color: 'var(--gc-text-hi)',
    borderColor: 'var(--gc-line-strong)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--gc-text-mid)',
    borderColor: 'transparent',
  },
  destructive: {
    background: 'transparent',
    color: 'var(--gc-accent-red)',
    borderColor: 'var(--gc-accent-red)',
  },
};

export function Button({
  label,
  variant = 'secondary',
  size = 'compact',
  icon,
  isLoading = false,
  isDisabled = false,
  testId,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const height = size === 'md' ? 32 : 28;
  const resolved: CSSProperties = {
    ...VARIANT_BASE,
    ...VARIANT_STYLE[variant],
    height,
    ...style,
  };

  const actuallyDisabled = isDisabled || disabled || isLoading;

  return (
    <button
      type="button"
      data-cc-component="Button"
      data-cc-testid={testId}
      data-variant={variant}
      disabled={actuallyDisabled}
      style={{
        ...resolved,
        cursor: actuallyDisabled ? 'not-allowed' : resolved.cursor,
        opacity: actuallyDisabled ? 0.5 : 1,
      }}
      {...rest}
    >
      {isLoading && <Spinner />}
      {!isLoading && icon}
      {label ?? children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: '9999px',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        display: 'inline-block',
        animation: 'cc-btn-spin 700ms linear infinite',
      }}
    />
  );
}

Button.displayName = 'CommerceCanvas.Button';
