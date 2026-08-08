/**
 * F3.5 R5 — Graphite Native IconButton（无 Astryx runtime）。
 *
 * 原生 button，仅 icon（28px 紧凑方形）。供工具栏 / 列表行内操作使用。
 *
 * 契约（兼容 R2 Astryx IconButton API 子集）：
 *   icon (ReactNode), label (a11y aria-label), onClick, isDisabled
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  icon?: ReactNode;
  label?: string;
  isDisabled?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
}

export function IconButton({
  icon,
  label,
  isDisabled = false,
  testId,
  disabled,
  onClick,
  style,
  ...rest
}: IconButtonProps) {
  const btnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    background: 'transparent',
    color: 'var(--gc-text-lo)',
    border: '1px solid transparent',
    borderRadius: 4,
    cursor: isDisabled || disabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled || disabled ? 0.5 : 1,
    transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
    ...style,
  };

  const actuallyDisabled = isDisabled || disabled;

  return (
    <button
      type="button"
      aria-label={label}
      data-cc-component="IconButton"
      data-cc-testid={testId}
      disabled={actuallyDisabled}
      onClick={onClick}
      style={btnStyle}
      {...rest}
    >
      {icon}
    </button>
  );
}

IconButton.displayName = 'CommerceCanvas.IconButton';
