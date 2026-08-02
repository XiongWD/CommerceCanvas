import { CheckCircle2, AlertTriangle, FileText, Clock, PanelTopOpen } from 'lucide-react';
import type { TaskSnapshot } from '@/types/competitor-analysis';
import { StatusDot } from '@/components/ui/StatusDot';

/**
 * 底部持续任务栏（任务书 §6.5 / FD-037）。
 * 明显但克制的存在感，跨页面持续显示（本任务静态完成态，不实现真实 SSE）。
 *
 * 展示：任务名 / 阶段进度（真实分母）/ 发现 / 风险 / 产物 / 用时
 *      + SSE 状态占位 + Worker 状态占位 + 展开任务详情入口。
 * 不写真实连接逻辑，不模拟随机进度（任务书 §6.5 / NG-023）。
 */
export function PersistentTaskBar({ task }: { task: TaskSnapshot }) {
  const stagePct = Math.round((task.stages.done / task.stages.total) * 100);

  return (
    <footer
      className="flex shrink-0 items-center gap-4 border-t px-4"
      style={{
        height: 'var(--gc-taskbar-height)',
        background: 'var(--gc-bg-elev-1)',
        borderColor: 'var(--gc-line)',
      }}
    >
      {/* 任务名 + 完成状态。P4：演示态用中性灰，明确「演示·已完成」语义。 */}
      <div className="flex min-w-0 items-center gap-2">
        <StatusDot tone="neutral" />
        <span
          className="truncate text-xs font-medium"
          style={{ color: 'var(--gc-text-hi)' }}
        >
          {task.nameZh}
        </span>
        <span
          className="gc-data shrink-0 text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          演示 · {task.phaseZh}
        </span>
      </div>

      <Sep />

      {/* 阶段进度条（真实分母 7/7，PRD-F-046）*/}
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
              background: 'var(--gc-accent-green)',
              borderRadius: 9999,
            }}
          />
        </div>
        <span
          className="gc-data text-2xs"
          style={{ color: 'var(--gc-text-mid)' }}
        >
          {task.stages.done}/{task.stages.total}
        </span>
      </div>

      <Sep />

      {/* 指标组：发现 / 风险 / 产物 / 用时（真实数值，等宽字体）*/}
      <Metric icon={<FileText size={12} />} tone="blue">
        发现 {task.findings}
      </Metric>
      <Metric icon={<AlertTriangle size={12} />} tone="amber">
        风险 {task.risks}
      </Metric>
      <Metric icon={<CheckCircle2 size={12} />} tone="green">
        产物 {task.artifacts}
      </Metric>
      <Metric icon={<Clock size={12} />} tone="neutral">
        <span className="gc-data">{task.elapsedZh}</span>
      </Metric>

      {/* 右侧：连接 / Worker 占位 + 展开入口。
          P4：演示语义用中性灰/紫色，不使用绿色「真实在线」语义。*/}
      <div className="ml-auto flex items-center gap-3">
        <span
          className="flex items-center gap-1.5 text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 9999,
              background: 'var(--gc-accent-purple)',
            }}
          />
          {task.connectionZh}
        </span>
        <span
          className="gc-data text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          {task.workerZh}
        </span>
        <button
          className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs transition-colors duration-snap hover:bg-[var(--gc-bg-elev-2)]"
          style={{
            color: 'var(--gc-text-mid)',
            border: '1px solid var(--gc-line)',
          }}
        >
          <PanelTopOpen size={12} />
          <span>任务详情</span>
        </button>
      </div>
    </footer>
  );
}

function Sep() {
  return (
    <span style={{ width: 1, height: 16, background: 'var(--gc-line)' }} />
  );
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
    <span
      className="flex items-center gap-1.5 text-2xs"
      style={{ color: 'var(--gc-text-mid)' }}
    >
      <span style={{ color }}>{icon}</span>
      {children}
    </span>
  );
}
