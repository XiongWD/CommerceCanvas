/**
 * 展开任务面板（任务书 §8.5 展开状态）。
 * 7 阶段节点 + 当前节点 + 完成状态 + 最近 3 条关键事件 + 连接恢复信息 + 人工介入提示。
 * 作为底部任务栏展开层，不遮挡中央商品区域。
 */
import { ChevronDown, AlertTriangle } from 'lucide-react';
import type { LiveIntelligenceState } from '../state/live-intelligence-state';
import {
  selectStageProgress,
  selectRecentTrace,
  selectConnectionZh,
  selectJobStatusZh,
  formatElapsed,
} from '../state/live-intelligence-selectors';
import { StageRail } from './StageRail';
import { categoryTone } from '../mappings/event-presentation-map';

interface ExpandedTaskPanelProps {
  state: LiveIntelligenceState;
  onCollapse: () => void;
}

export function ExpandedTaskPanel({ state, onCollapse }: ExpandedTaskPanelProps) {
  const sp = selectStageProgress(state);
  const recent = selectRecentTrace(state, 3);
  const conn = selectConnectionZh(state);
  const statusZh = selectJobStatusZh(state);

  return (
    <div
      className="absolute bottom-full left-0 right-0 z-30 border-t"
      style={{ background: 'var(--gc-bg-elev-1)', borderColor: 'var(--gc-line-strong)' }}
    >
      <div className="px-4 py-3">
        {/* 头部 */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
            任务详情 · {statusZh}
          </span>
          <button
            onClick={onCollapse}
            className="flex items-center gap-1 text-2xs"
            style={{ color: 'var(--gc-text-lo)' }}
          >
            收起 <ChevronDown size={12} />
          </button>
        </div>

        {/* 阶段轨道 */}
        <StageRail state={state} />

        {/* 进度 + 时间 */}
        <div className="mt-2 flex items-center gap-4 text-2xs">
          <span style={{ color: 'var(--gc-text-mid)' }}>
            阶段 <span className="gc-data">{sp.done}/{sp.total}</span>
          </span>
          <span style={{ color: 'var(--gc-text-mid)' }}>
            已用时 <span className="gc-data">{formatElapsed(state.elapsedSeconds)}</span>
          </span>
          <span style={{ color: conn.tone === 'amber' ? 'var(--gc-accent-amber)' : conn.tone === 'green' ? 'var(--gc-accent-green)' : 'var(--gc-text-mid)' }}>
            {conn.labelZh}
          </span>
        </div>

        {/* 最近事件 + 介入提示 */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <div className="gc-section-label mb-1">最近关键事件</div>
            {recent.length === 0 ? (
              <div className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>暂无</div>
            ) : (
              <ul className="flex flex-col gap-1">
                {recent.map((r) => {
                  const tone = categoryTone(r.category);
                  return (
                    <li key={r.eventId} className="flex gap-1.5 text-2xs">
                      <span style={{ color: tone.color, minWidth: 28 }}>{r.category}</span>
                      <span className="truncate" style={{ color: 'var(--gc-text-mid)' }}>{r.titleZh}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div>
            <div className="gc-section-label mb-1">人工介入</div>
            {state.requiresAction ? (
              <div
                className="flex items-start gap-1.5 rounded-sm px-2 py-1.5 text-2xs"
                style={{
                  background: 'var(--gc-accent-amber-soft)',
                  border: '1px solid rgba(224,169,58,0.4)',
                  color: 'var(--gc-text-mid)',
                }}
              >
                <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--gc-accent-amber)' }} />
                <span>{state.actionPromptZh ?? '需人工确认'}</span>
              </div>
            ) : (
              <div className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>无需介入</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
