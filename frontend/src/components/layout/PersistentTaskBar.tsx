import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Clock,
  ChevronUp,
  PanelTopOpen,
  Pause,
  Play,
  RotateCcw,
  LayoutList,
} from 'lucide-react';
import type { LiveIntelligenceApi } from '@/features/live-intelligence/useLiveIntelligence';
import {
  selectStageProgress,
  selectProgressMode,
  selectConnectionZh,
  selectJobStatusZh,
  formatElapsed,
} from '@/features/live-intelligence/state/live-intelligence-selectors';
import { ExpandedTaskPanel } from '@/features/live-intelligence/components/ExpandedTaskPanel';

/**
 * 底部持续任务面板（任务书 §8.5）。
 * F3-R1 §一：拆分两个按钮——
 *   「展开/收起」：只控制 ExpandedTaskPanel（本地抽屉）。
 *   「任务详情」：通过 React Router navigate(`/jobs/:jobId`) 进入正式 Job Detail 页。
 * 紧凑态显示任务名/阶段/进度/发现/风险/产物/用时/连接，状态全部来自事件流。
 * 不遮挡中央商品区域（展开层向上弹出）。
 */
export function PersistentTaskBar({ live }: { live: LiveIntelligenceApi }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const state = live.state;
  const sp = selectStageProgress(state);
  const progress = selectProgressMode(state);
  const conn = selectConnectionZh(state);
  const statusZh = selectJobStatusZh(state);

  // F3-R1 §一：正式任务详情入口——通过 React Router，不偷改 URL
  const goToJobDetail = () => {
    const jobId = state.jobId || 'latest';
    navigate(`/jobs/${jobId}`);
  };

  const stagePct = progress.mode === 'determinate' && progress.total ? Math.round(((progress.current ?? 0) / progress.total) * 100) : null;
  const isRunning = live.simulatorStatus === 'running';

  return (
    <footer
      data-testid="persistent-task-bar"
      className="relative flex shrink-0 flex-col"
      style={{
        borderTop: '1px solid var(--gc-line)',
        background: 'var(--gc-bg-elev-1)',
      }}
    >
      {/* 展开层（向上弹出，不遮挡商品区） */}
      {expanded && (
        <ExpandedTaskPanel state={state} onCollapse={() => setExpanded(false)} />
      )}

      {/* 紧凑态主条 */}
      <div
        className="flex items-center gap-3 px-4"
        style={{ height: 'var(--gc-taskbar-height)' }}
      >
        {/* 演示状态点（中性灰，非绿色真实在线） */}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background:
              state.connection === 'disconnected' || state.connection === 'reconnecting'
                ? 'var(--gc-accent-amber)'
                : 'var(--gc-text-faint)',
          }}
        />
        <span className="truncate text-xs font-medium" style={{ color: 'var(--gc-text-hi)' }}>
          竞品套图分析
        </span>
        <span className="gc-data shrink-0 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
          演示 · {statusZh}
        </span>

        <Sep />

        {/* 进度：真实分母显示百分比；indeterminate 不显示百分比 */}
        {stagePct !== null ? (
          <div className="flex items-center gap-2">
            <div
              className="h-1.5 overflow-hidden"
              style={{
                width: 88,
                background: 'var(--gc-bg-elev-2)',
                border: '1px solid var(--gc-line)',
                borderRadius: 9999,
              }}
            >
              <div
                style={{
                  width: `${stagePct}%`,
                  height: '100%',
                  background: 'var(--gc-accent-blue)',
                  borderRadius: 9999,
                  transition: 'width 300ms',
                }}
              />
            </div>
            <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
              {sp.done}/{sp.total} 阶段
            </span>
          </div>
        ) : (
          <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
            {progress.mode === 'indeterminate' && state.jobStatus === 'running'
              ? '阶段进行中 · 不确定进度'
              : `${sp.done}/${sp.total} 阶段`}
          </span>
        )}

        <Sep />

        <Metric icon={<FileText size={12} />} tone="blue">
          发现 <span className="gc-data">{state.summaryMetrics.findings}</span>
        </Metric>
        <Metric icon={<AlertTriangle size={12} />} tone="amber">
          风险 <span className="gc-data">{state.summaryMetrics.risks}</span>
        </Metric>
        <Metric icon={<Clock size={12} />} tone="neutral">
          <span className="gc-data">{formatElapsed(state.elapsedSeconds)}</span>
        </Metric>

        {/* 右侧：演示运行控制（R1.1：finished 显示「重新运行」，避免 start 静默失效） + 连接 + 展开 */}
        <div className="ml-auto flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={live.pause}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs"
              style={{ color: 'var(--gc-text-mid)', border: '1px solid var(--gc-line)' }}
            >
              <Pause size={11} /> 暂停
            </button>
          ) : live.simulatorStatus === 'finished' ? (
            <button
              onClick={live.restart}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs"
              style={{ color: 'var(--gc-accent-blue)', border: '1px solid var(--gc-accent-blue-line)', background: 'var(--gc-accent-blue-soft)' }}
            >
              <RotateCcw size={11} /> 重新运行
            </button>
          ) : (
            <button
              onClick={live.start}
              className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs"
              style={{ color: 'var(--gc-accent-blue)', border: '1px solid var(--gc-accent-blue-line)', background: 'var(--gc-accent-blue-soft)' }}
            >
              <Play size={11} /> 开始
            </button>
          )}
          <span
            className="flex items-center gap-1 text-2xs"
            style={{
              color: conn.tone === 'amber' ? 'var(--gc-accent-amber)' : conn.tone === 'green' ? 'var(--gc-accent-green)' : 'var(--gc-text-faint)',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 9999,
                background:
                  conn.tone === 'amber'
                    ? 'var(--gc-accent-amber)'
                    : conn.tone === 'green'
                      ? 'var(--gc-accent-green)'
                      : 'var(--gc-accent-purple)',
              }}
            />
            {conn.labelZh}
          </span>
          {/* F3-R1 §一：拆分两个按钮——展开/收起（本地抽屉）与任务详情（正式路由） */}
          <button
            onClick={() => setExpanded((e) => !e)}
            data-testid="task-expand-toggle"
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs"
            style={{ color: 'var(--gc-text-mid)', border: '1px solid var(--gc-line)' }}
          >
            {expanded ? <ChevronUp size={12} /> : <PanelTopOpen size={12} />}
            {expanded ? '收起' : '展开'}
          </button>
          <button
            onClick={goToJobDetail}
            data-testid="task-goto-detail"
            className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs"
            style={{
              color: 'var(--gc-accent-blue)',
              border: '1px solid var(--gc-accent-blue-line)',
              background: 'var(--gc-accent-blue-soft)',
            }}
          >
            <LayoutList size={11} /> 任务详情
          </button>
        </div>
      </div>
    </footer>
  );
}

function Sep() {
  return <span style={{ width: 1, height: 16, background: 'var(--gc-line)' }} />;
}

function Metric({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'green' | 'neutral';
  children: React.ReactNode;
}) {
  const color =
    tone === 'blue'
      ? 'var(--gc-accent-blue)'
      : tone === 'amber'
        ? 'var(--gc-accent-amber)'
        : tone === 'green'
          ? 'var(--gc-accent-green)'
          : 'var(--gc-text-faint)';
  return (
    <span className="flex items-center gap-1.5 text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
      <span style={{ color }}>{icon}</span>
      {children}
    </span>
  );
}
