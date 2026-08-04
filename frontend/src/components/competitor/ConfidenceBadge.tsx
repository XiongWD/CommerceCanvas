/**
 * 置信度徽章（F2 §八）。
 * 高/中/低/待确认 + 辅助百分比 + 中文依据（点击展开）。
 */
import { useState } from 'react';
import type { ConfidenceInfo, ConfidenceLevel } from '@/types/competitor-analysis';

const LEVEL_LABEL_ZH: Record<ConfidenceLevel, string> = {
  high: '高置信',
  medium: '中置信',
  low: '低置信',
  pending: '待人工确认',
};

const LEVEL_COLOR: Record<ConfidenceLevel, string> = {
  high: 'var(--gc-accent-green)',
  medium: 'var(--gc-accent-blue)',
  low: 'var(--gc-accent-amber)',
  pending: 'var(--gc-accent-red)',
};

const LEVEL_BG: Record<ConfidenceLevel, string> = {
  high: 'var(--gc-accent-green-soft)',
  medium: 'var(--gc-accent-blue-soft)',
  low: 'var(--gc-accent-amber-soft)',
  pending: 'var(--gc-accent-red-soft)',
};

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceInfo }) {
  const [expanded, setExpanded] = useState(false);
  const color = LEVEL_COLOR[confidence.level];
  const bg = LEVEL_BG[confidence.level];

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-2xs transition-colors duration-snap"
        style={{ color, background: bg, border: `1px solid ${color}55` }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            background: color,
          }}
        />
        <span>{LEVEL_LABEL_ZH[confidence.level]}</span>
        <span className="gc-data" style={{ color: 'var(--gc-text-faint)' }}>
          {confidence.percent}%
        </span>
      </button>
      {expanded && (
        <div
          className="mt-1 rounded-sm px-2 py-1.5 text-2xs leading-relaxed"
          style={{
            color: 'var(--gc-text-mid)',
            background: 'var(--gc-bg-elev-2)',
            border: '1px solid var(--gc-line)',
            maxWidth: 280,
          }}
        >
          <span style={{ color: 'var(--gc-text-faint)' }}>依据：</span>
          {confidence.basisZh}
        </div>
      )}
    </div>
  );
}
