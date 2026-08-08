/**
 * F3.5 R5 — Graphite Native TabList + Tab（无 Astryx runtime）。
 *
 * 原生 button-based tabs，受控（value + onChange），Graphite 选中下划线
 * 使用 --gc-selection-accent（S3，比 CTA 弱）。
 *
 * 契约（兼容 R2 Astryx TabList API 子集）：
 *   TabList: value (string, required), onChange (string => void), size, children
 *   Tab:     value (string, required), label, icon, isLabelHidden
 */
import type { CSSProperties, ReactNode } from 'react';
import { Children, isValidElement, cloneElement } from 'react';

export type TabListSize = 'sm' | 'md' | 'lg';
export type TabListLayout = 'hug' | 'fill';

export interface TabListProps {
  value: string;
  onChange: (value: string) => void;
  size?: TabListSize;
  layout?: TabListLayout;
  hasDivider?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export interface TabProps {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  isLabelHidden?: boolean;
  selectedIcon?: ReactNode;
  endContent?: ReactNode;
  children?: ReactNode;
}

export function TabList({
  value,
  onChange,
  size = 'md',
  layout = 'hug',
  hasDivider = true,
  testId,
  children,
  style,
}: TabListProps) {
  const height = size === 'sm' ? 28 : size === 'lg' ? 40 : 32;

  return (
    <div
      role="tablist"
      data-cc-component="TabList"
      data-cc-testid={testId}
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        gap: 0,
        borderBottom: hasDivider ? '1px solid var(--gc-line)' : undefined,
        width: layout === 'fill' ? '100%' : undefined,
        ...style,
      }}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        // 注入 selected + onClick 给 Tab（受控集中在 TabList）。
        return cloneElement(child as React.ReactElement<TabProps & { selected?: boolean; onSelect?: (v: string) => void; _height?: number }>, {
          selected: (child.props as TabProps).value === value,
          onSelect: onChange,
          _height: height,
        });
      })}
    </div>
  );
}

TabList.displayName = 'CommerceCanvas.TabList';

export function Tab({
  value,
  label,
  icon,
  isLabelHidden,
  selectedIcon,
  endContent,
  selected,
  onSelect,
  _height,
  children,
}: TabProps & { selected?: boolean; onSelect?: (v: string) => void; _height?: number }) {
  const handleActivate = () => onSelect?.(value);
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected ? 'true' : 'false'}
      data-cc-component="Tab"
      data-selected={selected ? 'true' : 'false'}
      onClick={handleActivate}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        height: _height ?? 32,
        padding: '0 12px',
        background: 'transparent',
        color: selected ? 'var(--gc-text-hi)' : 'var(--gc-text-lo)',
        border: 'none',
        borderBottom: selected ? '2px solid var(--gc-selection-accent)' : '2px solid transparent',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        whiteSpace: 'nowrap',
      }}
    >
      {selected ? selectedIcon ?? icon : icon}
      {!isLabelHidden && (label ?? children)}
      {endContent}
    </button>
  );
}

Tab.displayName = 'CommerceCanvas.Tab';
