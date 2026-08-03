/**
 * 里程碑揭示（任务书 §8.4）。
 * 只在关键节点克制显示（1.5–2.5s），不阻断操作，不覆盖整张商品图。
 * 同一里程碑只显示一次；重放事件不重复弹出（reducer 的 shownMilestoneIds 控制）。
 * 支持 prefers-reduced-motion。
 */
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { LiveIntelligenceState } from '../state/live-intelligence-state';

interface MilestoneRevealProps {
  state: LiveIntelligenceState;
}

export function MilestoneReveal({ state }: MilestoneRevealProps) {
  // 找到"已展示但尚未在本组件显示过"的最新里程碑
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [active, setActive] = useState<{ id: string; titleZh: string; summaryZh?: string } | null>(null);

  useEffect(() => {
    const jobKey = state.jobId || 'default';
    const shownForJob = state.shownMilestoneIds[jobKey] ?? [];
    const newest = state.milestones.find(
      (m) => !shownIds.includes(m.id) && shownForJob.includes(m.id),
    );
    if (newest && !active) {
      setActive({ id: newest.id, titleZh: newest.titleZh, summaryZh: newest.summaryZh });
      setShownIds((prev) => [...prev, newest.id]);
      const ms = prefersReducedMotion() ? 600 : 2200;
      const t = setTimeout(() => setActive(null), ms);
      return () => clearTimeout(t);
    }
  }, [state.milestones, state.shownMilestoneIds, state.jobId, shownIds, active]);

  // 重置时清空已显示记录
  useEffect(() => {
    if (state.jobStatus === 'idle') {
      setShownIds([]);
      setActive(null);
    }
  }, [state.jobStatus]);

  if (!active) return null;

  return (
    <div
      key={active.id}
      role="status"
      aria-live="polite"
      className="gc-milestone-reveal pointer-events-none absolute left-1/2 top-6 z-40 -translate-x-1/2"
      style={{
        padding: '10px 18px',
        background: 'var(--gc-bg-elev-2)',
        border: '1px solid var(--gc-accent-green)',
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        maxWidth: 360,
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={14} style={{ color: 'var(--gc-accent-green)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
          {active.titleZh}
        </span>
      </div>
      {active.summaryZh && (
        <div className="mt-1 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
          {active.summaryZh}
        </div>
      )}
      <style>{`
        @keyframes gc-milestone-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .gc-milestone-reveal { animation: gc-milestone-in 200ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .gc-milestone-reveal { animation: none; }
        }
      `}</style>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
