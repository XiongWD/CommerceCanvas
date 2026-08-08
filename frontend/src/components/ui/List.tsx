/**
 * F3.5 R5 — Graphite Native List + ListItem（无 Astryx runtime）。
 *
 * 原生 ul/li，Graphite 紧凑密度。ListItem 支持 startContent / label /
 * description / endContent 三栏布局。
 *
 * 契约（兼容 R2 Astryx List API 子集）：
 *   List:     hasDividers, children
 *   ListItem: startContent, label, description, endContent
 */
import type { CSSProperties, ReactNode } from 'react';

export interface ListProps {
  hasDividers?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function List({ hasDividers = false, children, style }: ListProps) {
  return (
    <ul
      data-cc-component="List"
      data-has-dividers={hasDividers ? 'true' : 'false'}
      style={{ listStyle: 'none', margin: 0, padding: 0, ...style }}
    >
      {children}
    </ul>
  );
}

export interface ListItemProps {
  startContent?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  endContent?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export function ListItem({
  startContent,
  label,
  description,
  endContent,
  children,
  style,
}: ListItemProps) {
  return (
    <li
      data-cc-component="ListItem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderBottom: '1px solid var(--gc-line)',
        color: 'var(--gc-text-mid)',
        ...style,
      }}
    >
      {startContent && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{startContent}</span>}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {label && <span style={{ fontSize: '13px', color: 'var(--gc-text-hi)' }}>{label}</span>}
        {description && (
          <span style={{ fontSize: '11px', color: 'var(--gc-text-lo)' }}>{description}</span>
        )}
        {children}
      </span>
      {endContent && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{endContent}</span>}
    </li>
  );
}
