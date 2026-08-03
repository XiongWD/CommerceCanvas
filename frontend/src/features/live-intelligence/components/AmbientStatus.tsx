/**
 * 环境智能反馈（任务书 §8.1）。
 * 克制展示：当前阶段 / 连接 / 活跃节点 / 已处理图片 / 事件数 / 已用时间 / Artifact / 风险。
 * 状态全部来自事件流，不静态写死。
 */
import type { LiveIntelligenceState } from '../state/live-intelligence-state';
import {
  selectCurrentStage,
  selectConnectionZh,
  formatElapsed,
} from '../state/live-intelligence-selectors';
import { STAGE_LABEL_ZH } from '../state/live-intelligence-state';

export function AmbientStatus({ state }: { state: LiveIntelligenceState }) {
  const current = selectCurrentStage(state);
  const conn = selectConnectionZh(state);
  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-1.5"
      style={{ borderColor: 'var(--gc-line)', background: 'var(--gc-bg-app)' }}
    >
      <Metric label="当前阶段">
        {current ? STAGE_LABEL_ZH[current.id] : '—'}
      </Metric>
      <Metric label="连接">
        <span style={{ color: conn.tone === 'amber' ? 'var(--gc-accent-amber)' : conn.tone === 'green' ? 'var(--gc-accent-green)' : 'var(--gc-text-mid)' }}>
          {conn.labelZh}
        </span>
      </Metric>
      <Metric label="分析节点">
        <span className="gc-data">{state.activeNodes} 个 · 模拟</span>
      </Metric>
      <Metric label="已处理">
        <span className="gc-data">
          {state.processedImages}/{state.totalImages} 张
        </span>
      </Metric>
      <Metric label="事件">
        <span className="gc-data">{state.receivedCount}</span>
      </Metric>
      <Metric label="已用时">
        <span className="gc-data">{formatElapsed(state.elapsedSeconds)}</span>
      </Metric>
      <Metric label="产物">
        <span className="gc-data">{state.summaryMetrics.artifacts}</span>
      </Metric>
      <Metric label="风险">
        <span className="gc-data" style={{ color: state.summaryMetrics.risks ? 'var(--gc-accent-amber)' : undefined }}>
          {state.summaryMetrics.risks}
        </span>
      </Metric>
    </div>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="flex items-baseline gap-1 text-2xs">
      <span style={{ color: 'var(--gc-text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--gc-text-mid)' }}>{children}</span>
    </span>
  );
}
