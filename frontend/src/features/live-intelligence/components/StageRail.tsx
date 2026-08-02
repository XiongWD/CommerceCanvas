/**
 * 阶段轨道（任务书 §8.5 展开状态用）。
 * 7 个阶段节点 + 当前节点 + 完成状态，细连线，克制。
 */
import type { LiveIntelligenceState } from '../state/live-intelligence-state';
import { selectStageNodes } from '../state/live-intelligence-selectors';
import { STAGE_LABEL_ZH } from '../state/live-intelligence-state';

export function StageRail({ state }: { state: LiveIntelligenceState }) {
  const nodes = selectStageNodes(state);
  return (
    <ol className="flex items-center gap-1 overflow-x-auto py-1">
      {nodes.map((n, i) => {
        const tone =
          n.status === 'completed'
            ? 'var(--gc-accent-green)'
            : n.status === 'active'
              ? 'var(--gc-accent-blue)'
              : n.status === 'awaiting_review'
                ? 'var(--gc-accent-amber)'
                : n.status === 'failed'
                  ? 'var(--gc-accent-red)'
                  : 'var(--gc-text-faint)';
        return (
          <li key={n.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 64 }}>
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 14,
                  height: 14,
                  background: n.status === 'pending' ? 'var(--gc-bg-elev-2)' : `${tone}22`,
                  border: `1.5px solid ${tone}`,
                }}
              />
              <span
                className="text-center text-2xs leading-tight"
                style={{ color: n.status === 'pending' ? 'var(--gc-text-faint)' : 'var(--gc-text-mid)' }}
              >
                {STAGE_LABEL_ZH[n.id]}
              </span>
            </div>
            {i < nodes.length - 1 && (
              <span
                style={{
                  width: 16,
                  height: 1,
                  background:
                    n.status === 'completed' ? 'var(--gc-accent-green)' : 'var(--gc-line)',
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
