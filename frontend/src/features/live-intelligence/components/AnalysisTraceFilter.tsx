/**
 * 分析轨迹筛选（F2 §十）。
 * 全部 / 发现 / 证据 / 风险 / 成果 / 系统。
 * 仅影响展示，不修改事件权威状态。
 */
import type { TraceCategoryZh } from '@/types/live-event';

export type TraceFilter = '全部' | TraceCategoryZh;

const FILTERS: TraceFilter[] = ['全部', '发现', '证据', '风险', '成果', '系统', '判断', '动作'];

export function AnalysisTraceFilter({
  active,
  counts,
  onChange,
}: {
  active: TraceFilter;
  counts: Record<TraceCategoryZh, number>;
  onChange: (f: TraceFilter) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 border-b px-2 py-1" style={{ borderColor: 'var(--gc-line)' }}>
      {FILTERS.map((f) => {
        const isActive = active === f;
        const count = f === '全部' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[f] ?? 0;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-2xs transition-colors duration-snap"
            style={{
              color: isActive ? 'var(--gc-accent-blue)' : 'var(--gc-text-faint)',
              background: isActive ? 'var(--gc-accent-blue-soft)' : 'transparent',
            }}
          >
            <span>{f}</span>
            <span className="gc-data" style={{ color: isActive ? 'var(--gc-accent-blue)' : 'var(--gc-text-faint)' }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
