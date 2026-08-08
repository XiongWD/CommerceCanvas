/**
 * F3.5 R5 — Graphite Native Table（无 Astryx runtime）。
 *
 * 原生 HTML table 元素，Graphite 紧凑密度（行高 ~30px）。
 * 子组件：Table / TableHeader / TableBody / TableRow / TableCell / TableHeaderCell。
 *
 * 契约（兼容 R2 Astryx Table API 子集）：
 *   Table: density ('compact'|'default'), dividers ('rows'|'none'|'cells'), hasHover
 */
import type { CSSProperties, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export interface TableProps {
  density?: 'compact' | 'default';
  dividers?: 'rows' | 'none' | 'cells';
  hasHover?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Table({ density = 'default', dividers = 'rows', children, style }: TableProps) {
  return (
    <table
      data-cc-component="Table"
      data-density={density}
      data-dividers={dividers}
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: density === 'compact' ? '12px' : '13px',
        color: 'var(--gc-text-mid)',
        ...style,
      }}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead data-cc-component="TableHeader">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody data-cc-component="TableBody">{children}</tbody>;
}

export function TableRow({
  children,
  ...rest
}: { children: ReactNode } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-cc-component="TableRow"
      style={{
        borderBottom: '1px solid var(--gc-line)',
        transition: 'background-color 120ms ease',
      }}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, ...rest }: { children: ReactNode } & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      data-cc-component="TableCell"
      style={{ padding: '6px 10px', color: 'var(--gc-text-mid)' }}
      {...rest}
    >
      {children}
    </td>
  );
}

export function TableHeaderCell({
  children,
  ...rest
}: { children: ReactNode } & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-cc-component="TableHeaderCell"
      style={{
        padding: '6px 10px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--gc-text-lo)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderBottom: '1px solid var(--gc-line-strong)',
        whiteSpace: 'nowrap',
      }}
      {...rest}
    >
      {children}
    </th>
  );
}
