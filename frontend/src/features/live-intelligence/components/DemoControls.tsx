/**
 * 演示控制（任务书 §五）。
 * 开始 / 暂停 / 继续 / 重新运行 / 0.5× / 1× / 2× / 切换场景。
 * 明确标注「演示运行 · 模拟事件流」，不伪装真实 Worker。
 */
import { Play, Pause, RotateCcw, FastForward, Gauge } from 'lucide-react';
import type { ScenarioId } from '@/types/live-event';
import type { SimulatorStatus } from '../simulator/runtime';

interface DemoControlsProps {
  status: SimulatorStatus;
  speed: 0.5 | 1 | 2;
  scenarioId: ScenarioId;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSpeed: (s: 0.5 | 1 | 2) => void;
  onSwitch: (id: ScenarioId) => void;
}

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: 'normal', label: '场景 A · 正常完成' },
  { id: 'risk', label: '场景 B · 高风险待确认' },
  { id: 'reconnect', label: '场景 C · 断线恢复' },
];

export function DemoControls({
  status,
  speed,
  scenarioId,
  onStart,
  onPause,
  onResume,
  onRestart,
  onSpeed,
  onSwitch,
}: DemoControlsProps) {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2"
      style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-elev-1)' }}
    >
      <span
        className="gc-data text-2xs"
        style={{ color: 'var(--gc-accent-purple)' }}
      >
        演示运行 · 模拟事件流
      </span>
      <span style={{ width: 1, height: 16, background: 'var(--gc-line)' }} />

      {/* 场景切换 */}
      <div className="flex items-center gap-1">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSwitch(s.id)}
            className="rounded-sm px-2 py-1 text-2xs transition-colors duration-snap"
            style={{
              color: scenarioId === s.id ? 'var(--gc-accent-blue)' : 'var(--gc-text-lo)',
              background: scenarioId === s.id ? 'var(--gc-accent-blue-soft)' : 'transparent',
              border: `1px solid ${scenarioId === s.id ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <span style={{ width: 1, height: 16, background: 'var(--gc-line)' }} />

      {/* 运行控制 */}
      {!isRunning && !isPaused && (
        <CtrlBtn onClick={onStart} tone="blue" icon={<Play size={12} />} label="开始演示分析" />
      )}
      {isRunning && (
        <CtrlBtn onClick={onPause} icon={<Pause size={12} />} label="暂停" />
      )}
      {isPaused && (
        <CtrlBtn onClick={onResume} tone="blue" icon={<Play size={12} />} label="继续" />
      )}
      <CtrlBtn onClick={onRestart} icon={<RotateCcw size={12} />} label="重新运行" />

      <span style={{ width: 1, height: 16, background: 'var(--gc-line)' }} />

      {/* 速度 */}
      <div className="flex items-center gap-1">
        <Gauge size={12} style={{ color: 'var(--gc-text-faint)' }} />
        {([0.5, 1, 2] as const).map((sp) => (
          <button
            key={sp}
            onClick={() => onSpeed(sp)}
            className="gc-data rounded-sm px-2 py-1 text-2xs transition-colors duration-snap"
            style={{
              color: speed === sp ? 'var(--gc-accent-blue)' : 'var(--gc-text-lo)',
              background: speed === sp ? 'var(--gc-accent-blue-soft)' : 'transparent',
              border: `1px solid ${speed === sp ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
            }}
          >
            {sp}×
          </button>
        ))}
      </div>

      {status === 'finished' && (
        <span className="ml-auto flex items-center gap-1 text-2xs" style={{ color: 'var(--gc-accent-green)' }}>
          <FastForward size={11} /> 演示已结束
        </span>
      )}
    </div>
  );
}

function CtrlBtn({
  onClick,
  icon,
  label,
  tone = 'neutral',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: 'neutral' | 'blue';
}) {
  const color = tone === 'blue' ? 'var(--gc-accent-blue)' : 'var(--gc-text-mid)';
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-sm px-2 py-1 text-2xs transition-colors duration-snap hover:bg-[var(--gc-bg-elev-2)]"
      style={{ color, border: '1px solid var(--gc-line)' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
