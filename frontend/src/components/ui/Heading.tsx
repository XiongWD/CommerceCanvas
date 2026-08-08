/**
 * F3.5 R5 — Graphite Native Heading（无 Astryx runtime）。
 *
 * 原生 h1-h6，按 Graphite 字号/字重映射 level/type。
 *
 * 契约（兼容 R2 Astryx Heading API）：
 *   level 1-6（required）原生 heading 级别
 *   type (display-1|display-2|display-3 可选) 覆盖默认视觉尺寸
 *   color: primary (默认 --gc-text-hi) / secondary / inherit
 */
import type { CSSProperties, ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingType = 'display-1' | 'display-2' | 'display-3';

export interface HeadingProps {
  level: HeadingLevel;
  type?: HeadingType;
  color?: 'primary' | 'secondary' | 'inherit';
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  className?: string;
  style?: CSSProperties;
}

const LEVEL_STYLE: Record<HeadingLevel, CSSProperties> = {
  1: { fontSize: '24px', fontWeight: 600, lineHeight: '32px' },
  2: { fontSize: '20px', fontWeight: 600, lineHeight: '28px' },
  3: { fontSize: '16px', fontWeight: 600, lineHeight: '22px' },
  4: { fontSize: '14px', fontWeight: 600, lineHeight: '20px' },
  5: { fontSize: '13px', fontWeight: 600, lineHeight: '18px' },
  6: { fontSize: '12px', fontWeight: 600, lineHeight: '16px' },
};

const TYPE_OVERRIDE: Record<HeadingType, CSSProperties> = {
  'display-1': { fontSize: '28px', fontWeight: 700, lineHeight: '36px' },
  'display-2': { fontSize: '24px', fontWeight: 600, lineHeight: '32px' },
  'display-3': { fontSize: '20px', fontWeight: 600, lineHeight: '28px' },
};

const COLOR_VAR: Record<'primary' | 'secondary', string> = {
  primary: 'var(--gc-text-hi)',
  secondary: 'var(--gc-text-mid)',
};

export function Heading({
  level,
  type,
  color = 'primary',
  children,
  testId,
  className,
  style,
}: HeadingProps) {
  const Tag = (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
  const resolved: CSSProperties = {
    margin: 0,
    ...LEVEL_STYLE[level],
    ...(type ? TYPE_OVERRIDE[type] : {}),
    color: color === 'inherit' ? undefined : COLOR_VAR[color],
    ...style,
  };

  return (
    <Tag
      data-cc-component="Heading"
      data-cc-testid={testId}
      className={className}
      style={resolved}
    >
      {children}
    </Tag>
  );
}

Heading.displayName = 'CommerceCanvas.Heading';
