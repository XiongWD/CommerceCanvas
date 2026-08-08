/**
 * F3.5 R5 — Graphite Native EmptyState（无 Astryx runtime）。
 *
 * 原生 div 组合：icon + title + description + actions，居中、克制。
 *
 * 契约（兼容 R2 Astryx EmptyState API 子集）：
 *   title, description, icon, actions
 */
import type { CSSProperties, ReactNode } from 'react';

export interface EmptyStateProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  style?: CSSProperties;
}

export function EmptyState({ title, description, icon, actions, children, testId, style }: EmptyStateProps) {
  return (
    <div
      data-cc-component="EmptyState"
      data-cc-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '32px 20px',
        textAlign: 'center',
        color: 'var(--gc-text-lo)',
        ...style,
      }}
    >
      {icon && <span style={{ color: 'var(--gc-text-faint)' }}>{icon}</span>}
      {title && <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gc-text-mid)' }}>{title}</div>}
      {description && <div style={{ fontSize: '12px', maxWidth: 320 }}>{description}</div>}
      {children}
      {actions && <div style={{ marginTop: 4 }}>{actions}</div>}
    </div>
  );
}

EmptyState.displayName = 'CommerceCanvas.EmptyState';
