/**
 * 中文智能分析轨迹（任务书 §8.2）。
 *
 * 每条事件映射为 7 类中文轨迹类型之一（发现/判断/证据/风险/动作/成果/系统）。
 * 新事件从底部进入；当前事件突出，历史降权；不强制拉回最新；提供「回到最新」。
 * 点击携带 evidenceRefs 的轨迹条目 → 触发 Evidence 双向定位。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LiveIntelligenceState, TraceItem } from '../state/live-intelligence-state';
import { categoryTone } from '../mappings/event-presentation-map';
import type { EvidenceFocus } from '../useLiveIntelligence';
import { AnalysisTraceFilter, type TraceFilter } from './AnalysisTraceFilter';

interface AnalysisTraceProps {
  state: LiveIntelligenceState;
  highlightedSequence?: number;
  onFocusEvidence: (f: EvidenceFocus) => void;
}

export function AnalysisTrace({ state, highlightedSequence, onFocusEvidence }: AnalysisTraceProps) {
  const [filter, setFilter] = useState<TraceFilter>('全部');
  const allTrace = state.trace;

  // 筛选：仅影响展示，不修改事件权威状态（F2 §十）
  const trace = useMemo(() => {
    if (filter === '全部') return allTrace;
    return allTrace.filter((t) => t.category === filter);
  }, [allTrace, filter]);

  // 各类计数（供筛选栏显示）
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of allTrace) c[t.category] = (c[t.category] ?? 0) + 1;
    return c as Record<TraceItem['category'], number>;
  }, [allTrace]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 自动跟随最新（仅当用户未手动上滚时）
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [trace.length, autoScroll]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAutoScroll(atBottom);
  };

  const backToLatest = () => {
    setAutoScroll(true);
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 pb-1 pt-2">
        <span className="gc-section-label">分析轨迹</span>
        <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
          {trace.length} / {allTrace.length} 条
        </span>
      </div>
      <AnalysisTraceFilter active={filter} counts={counts} onChange={setFilter} />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-2"
      >
        {trace.length === 0 ? (
          <div className="px-2 py-6 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>
            点击「开始演示分析」查看实时中文分析轨迹
          </div>
        ) : (
          <ol className="flex flex-col gap-1">
            {trace.map((item) => (
              <AnalysisTraceItem
                key={item.eventId}
                item={item}
                highlighted={highlightedSequence === item.sequence}
                onFocusEvidence={onFocusEvidence}
              />
            ))}
          </ol>
        )}
      </div>
      {!autoScroll && trace.length > 0 && (
        <button
          onClick={backToLatest}
          className="mx-auto mb-1 rounded-sm px-2 py-1 text-2xs"
          style={{
            color: 'var(--gc-accent-blue)',
            background: 'var(--gc-accent-blue-soft)',
            border: '1px solid var(--gc-accent-blue-line)',
          }}
        >
          ↓ 回到最新
        </button>
      )}
    </div>
  );
}

function AnalysisTraceItem({
  item,
  highlighted,
  onFocusEvidence,
}: {
  item: TraceItem;
  highlighted: boolean;
  onFocusEvidence: (f: EvidenceFocus) => void;
}) {
  const tone = categoryTone(item.category);
  const time = item.occurredAt.slice(11, 19); // HH:MM:SS
  const hasEvidence = item.evidenceRefs && item.evidenceRefs.length > 0;
  const clickable = hasEvidence;
  return (
    <li
      onClick={() => {
        if (clickable && item.evidenceRefs) {
          const ref = item.evidenceRefs[0];
          onFocusEvidence({
            assetId: ref.assetId,
            layer: ref.layer,
            regionId: ref.regionId,
            source: 'trace',
            fromSequence: item.sequence,
          });
        }
      }}
      className="flex gap-2 rounded-sm px-2 py-1.5 transition-all duration-snap"
      style={{
        background: highlighted ? 'var(--gc-accent-blue-soft)' : item.replayed ? 'var(--gc-bg-base)' : 'transparent',
        borderLeft: `2px solid ${highlighted ? 'var(--gc-accent-blue)' : 'transparent'}`,
        cursor: clickable ? 'pointer' : 'default',
        opacity: item.replayed ? 0.7 : 1,
      }}
    >
      <span className="gc-data mt-0.5 shrink-0 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
        {time}
      </span>
      <span
        className="mt-0.5 shrink-0 text-2xs font-medium"
        style={{ color: tone.color, background: tone.bg, padding: '1px 5px', borderRadius: 2, minWidth: 30, textAlign: 'center' }}
      >
        {item.category}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs leading-relaxed" style={{ color: 'var(--gc-text-mid)' }}>
          {item.titleZh}
        </span>
        {item.summaryZh && (
          <span className="mt-0.5 block text-2xs leading-relaxed" style={{ color: 'var(--gc-text-faint)' }}>
            {item.summaryZh}
          </span>
        )}
        {clickable && (
          <span className="mt-0.5 block text-2xs" style={{ color: 'var(--gc-accent-blue)' }}>
            点击定位证据 →
          </span>
        )}
      </span>
    </li>
  );
}
