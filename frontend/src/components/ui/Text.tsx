/**
 * F3.5 R5 — Graphite Native Text（无 Astryx runtime）。
 *
 * 原生 span，按 Graphite 字号/字重/颜色映射 `type` + `color`。
 *
 * type 契约（兼容 R2 Astryx Text API）：
 *   body        13px / 400  主文字
 *   label       12px / 500  字段标签
 *   supporting  11px / 400  辅助说明
 *   code        12px / 400  mono
 *   display-1   24px / 600  页面标题
 *   display-2   20px / 600  区块标题
 *   display-3   16px / 600  小节标题
 *   inherit     继承父级
 *
 * color 契约（兼容 R2 Astryx Text color）：
 *   primary      --gc-text-hi
 *   secondary    --gc-text-mid
 *   disabled     --gc-text-faint
 *   placeholder  --gc-text-faint
 *   accent       --gc-action-text
 *   inherit      继承
 */
import type { CSSProperties, ReactNode } from 'react';

export type TextType =
  | 'body'
  | 'label'
  | 'supporting'
  | 'code'
  | 'display-1'
  | 'display-2'
  | 'display-3'
  | 'inherit';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'placeholder'
  | 'accent'
  | 'inherit';

export interface TextProps {
  type?: TextType;
  color?: TextColor;
  size?: number | string;
  weight?: number | string;
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  onClick?: () => void;
}

const TYPE_STYLE: Record<Exclude<TextType, 'inherit'>, CSSProperties> = {
  body: { fontSize: '13px', fontWeight: 400, lineHeight: '20px' },
  label: { fontSize: '12px', fontWeight: 500, lineHeight: '16px' },
  supporting: { fontSize: '11px', fontWeight: 400, lineHeight: '16px' },
  code: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    fontFamily: 'var(--gc-font-mono)',
    fontVariantNumeric: 'tabular-nums',
  },
  'display-1': { fontSize: '24px', fontWeight: 600, lineHeight: '32px' },
  'display-2': { fontSize: '20px', fontWeight: 600, lineHeight: '28px' },
  'display-3': { fontSize: '16px', fontWeight: 600, lineHeight: '22px' },
};

const COLOR_VAR: Record<Exclude<TextColor, 'inherit'>, string> = {
  primary: 'var(--gc-text-hi)',
  secondary: 'var(--gc-text-mid)',
  disabled: 'var(--gc-text-faint)',
  placeholder: 'var(--gc-text-faint)',
  accent: 'var(--gc-action-text)',
};

export function Text({
  type = 'body',
  color = 'primary',
  size,
  weight,
  children,
  testId,
  className,
  style,
  title,
  onClick,
}: TextProps) {
  const typeStyle = type === 'inherit' ? {} : TYPE_STYLE[type];
  const colorVar = color === 'inherit' ? undefined : COLOR_VAR[color];
  const resolved: CSSProperties = {
    ...typeStyle,
    color: colorVar,
    ...style,
  };
  if (size !== undefined) resolved.fontSize = typeof size === 'number' ? `${size}px` : size;
  if (weight !== undefined) resolved.fontWeight = weight;

  return (
    <span
      data-cc-component="Text"
      data-cc-testid={testId}
      className={className}
      style={resolved}
      title={title}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

Text.displayName = 'CommerceCanvas.Text';
