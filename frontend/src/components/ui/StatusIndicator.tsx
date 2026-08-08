/**
 * F3.5 R4 §6-7 — StatusIndicator Foundation primitive。
 *
 * 按 visual-salience-contract.md Status Treatment：
 *   Tier A (running/completed/normal): dot + text（subtle）
 *   Tier B (warning/review): dot + text（amber）
 *   Tier C (block/error): dot + text（strong/error）
 *
 * 禁止用 filled Badge 表示 running/completed。
 */
import type { ReactNode } from 'react';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface StatusIndicatorProps {
  tone: StatusTone;
  children: ReactNode;
  /** 强调程度：subtle（默认，dot+text）/ strong（允许 Badge 感） */
  emphasis?: 'subtle' | 'strong';
  testId?: string;
}

const TONE_COLOR: Record<StatusTone, string> = {
  neutral: 'var(--gc-text-faint)',
  info: 'var(--gc-accent-blue)',
  success: 'var(--gc-accent-green)',
  warning: 'var(--gc-accent-amber)',
  error: 'var(--gc-accent-red)',
};

const TONE_BG: Record<StatusTone, string> = {
  neutral: 'transparent',
  info: 'transparent',
  success: 'transparent',
  warning: 'var(--gc-accent-amber-soft)',
  error: 'var(--gc-accent-red-soft)',
};

export function StatusIndicator({ tone, children, emphasis = 'subtle', testId }: StatusIndicatorProps) {
  const color = TONE_COLOR[tone];
  const bg = emphasis === 'strong' ? TONE_BG[tone] : 'transparent';
  return (
    <span
      data-testid={testId}
      data-cc-component="StatusIndicator"
      data-tone={tone}
      data-emphasis={emphasis}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: emphasis === 'strong' ? '2px 8px' : '0',
        borderRadius: emphasis === 'strong' ? '4px' : '0',
        background: bg,
        color,
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: '500',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '9999px',
          background: color,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}
