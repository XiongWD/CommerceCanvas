/**
 * F3.5 R5 — Graphite Native ProgressBar（无 Astryx runtime）。
 *
 * 原生 div 进度条：细（4px），Graphite 蓝填充（--gc-action-primary）。
 * 支持确定值 (value/max) 与不确定态 (isIndeterminate)。
 *
 * 契约（兼容 R2 Astryx ProgressBar API 子集）：
 *   label, value, max, isIndeterminate
 */
import type { CSSProperties, ReactNode } from 'react';

export interface ProgressBarProps {
  label?: ReactNode;
  value?: number;
  max?: number;
  isIndeterminate?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  style?: CSSProperties;
}

export function ProgressBar({
  label,
  value = 0,
  max = 100,
  isIndeterminate = false,
  testId,
  style,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const trackStyle: CSSProperties = {
    height: 4,
    width: '100%',
    background: 'var(--gc-line)',
    borderRadius: 2,
    overflow: 'hidden',
  };
  const fillStyle: CSSProperties = isIndeterminate
    ? {
        width: '40%',
        height: '100%',
        background: 'var(--gc-action-primary)',
        borderRadius: 2,
        animation: 'cc-progress-indeterminate 1100ms ease-in-out infinite',
      }
    : {
        width: `${pct}%`,
        height: '100%',
        background: 'var(--gc-action-primary)',
        borderRadius: 2,
        transition: 'width 200ms ease',
      };

  return (
    <div data-cc-component="ProgressBar" data-cc-testid={testId} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--gc-text-lo)' }}>{label}</span>
          {!isIndeterminate && (
            <span style={{ fontSize: '11px', color: 'var(--gc-text-lo)', fontFamily: 'var(--gc-font-mono)' }}>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
}

ProgressBar.displayName = 'CommerceCanvas.ProgressBar';
