/**
 * EventSimulator 运行时（R1 重写：修复双重执行）。
 *
 * R1 修复：
 *   1. switchScenario 只 load + reset，不自动 start（避免与 UI「开始」按钮冲突触发二次 timer）。
 *   2. 单一 timer：start 先 stopTimer 再 scheduleNext；scheduleNext 用 setTimeout 递推而非 setInterval
 *      （从根上避免多个 interval 叠加）。
 *   3. pause/resume/restart/setSpeed 全部先 stopTimer，确保任一时刻最多一个 pending timer。
 *   4. 事件只分发一次：cursor 单调推进，tick 内单次发出。
 */

import type { LiveEventEnvelope, ScenarioId } from '@/types/live-event';
import type { ScenarioScript } from './event-simulator';
import { buildNormalScenario } from './scenario-normal';
import { buildRiskScenario } from './scenario-risk';
import { buildReconnectScenario } from './scenario-reconnect';

export type SimulatorStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface SimulatorCallbacks {
  onEvent: (event: LiveEventEnvelope) => void;
  onStatusChange: (status: SimulatorStatus) => void;
  /** R1：连接状态用独立回调（transport action），不混入业务事件 */
  onTransport?: (signal: { type: 'disconnected' | 'reconnecting' | 'recovered'; fromSequence?: number; recoveredCount?: number }) => void;
  /** 已分发事件计数（供运行时测试校验双重执行） */
  onDispatchCountChange?: (count: number) => void;
}

const SCENARIO_BUILDERS: Record<ScenarioId, () => ScenarioScript> = {
  normal: buildNormalScenario,
  risk: buildRiskScenario,
  reconnect: buildReconnectScenario,
};

/** 基础事件间隔（ms，1× 速度）。确定性。 */
const BASE_INTERVAL_MS = 700;

export class EventSimulator {
  private scenario: ScenarioScript | null = null;
  private cursor = 0;
  private status: SimulatorStatus = 'idle';
  private speed: 0.5 | 1 | 2 = 1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly callbacks: SimulatorCallbacks;
  private dispatchCount = 0;

  constructor(callbacks: SimulatorCallbacks) {
    this.callbacks = callbacks;
  }

  /** 加载场景（不自动开始） */
  load(scenarioId: ScenarioId) {
    this.stopTimer();
    this.scenario = SCENARIO_BUILDERS[scenarioId]();
    this.cursor = 0;
    this.dispatchCount = 0;
    this.callbacks.onDispatchCountChange?.(this.dispatchCount);
    this.setStatus('idle');
  }

  /** 开始（若 finished 则先 reset） */
  start() {
    if (!this.scenario) {
      this.load('normal');
    }
    if (this.status === 'running') return;
    if (this.status === 'finished') {
      this.reset();
    }
    this.stopTimer();
    this.setStatus('running');
    // 立即发出第一个事件，然后递推调度
    this.tick();
    // tick 可能将状态置为 finished（单事件场景），再次检查后调度
    if (this.status === 'running' as SimulatorStatus) this.scheduleNext();
  }

  pause() {
    if (this.status !== 'running') return;
    this.stopTimer();
    this.setStatus('paused');
  }

  resume() {
    if (this.status !== 'paused') return;
    this.start();
  }

  /** 重新运行当前场景 */
  restart() {
    this.stopTimer();
    if (this.scenario) {
      const id = this.scenario.scenarioId as ScenarioId;
      this.scenario = SCENARIO_BUILDERS[id]();
    } else {
      this.load('normal');
    }
    this.cursor = 0;
    this.dispatchCount = 0;
    this.callbacks.onDispatchCountChange?.(this.dispatchCount);
    this.setStatus('idle');
    this.start();
  }

  setSpeed(speed: 0.5 | 1 | 2) {
    this.speed = speed;
    if (this.status === 'running') {
      this.stopTimer();
      this.scheduleNext();
    }
  }

  getSpeed() {
    return this.speed;
  }

  getStatus() {
    return this.status;
  }

  getScenarioId(): ScenarioId | null {
    return this.scenario?.scenarioId as ScenarioId | null;
  }

  getDispatchCount() {
    return this.dispatchCount;
  }

  /** 切换场景：只 load + reset，不自动开始（R1 修复双重执行根因） */
  switchScenario(scenarioId: ScenarioId) {
    this.stopTimer();
    this.load(scenarioId);
    // 不调用 start；由用户在 UI 点击「开始」
  }

  reset() {
    this.stopTimer();
    if (this.scenario) {
      const id = this.scenario.scenarioId as ScenarioId;
      this.scenario = SCENARIO_BUILDERS[id]();
    }
    this.cursor = 0;
    this.dispatchCount = 0;
    this.callbacks.onDispatchCountChange?.(this.dispatchCount);
    this.setStatus('idle');
  }

  dispose() {
    this.stopTimer();
  }

  /** 发出当前 cursor 处的事件并推进；处理 finished */
  private tick() {
    if (!this.scenario || this.cursor >= this.scenario.events.length) {
      this.stopTimer();
      this.setStatus('finished');
      return;
    }
    const event = this.scenario.events[this.cursor];
    this.cursor += 1;
    this.dispatchCount += 1;
    this.callbacks.onDispatchCountChange?.(this.dispatchCount);
    // 连接类事件转为 transport 信号（不占用业务 sequence）
    if (this.callbacks.onTransport && isTransportEvent(event)) {
      this.callbacks.onTransport(toTransportSignal(event));
    } else {
      this.callbacks.onEvent(event);
    }
  }

  /** 用 setTimeout 递推调度（单一 pending timer） */
  private scheduleNext() {
    if (this.status !== 'running') return;
    const interval = BASE_INTERVAL_MS / this.speed;
    this.timer = setTimeout(() => {
      this.tick();
      if (this.status === 'running') this.scheduleNext();
    }, interval);
  }

  private stopTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private setStatus(s: SimulatorStatus) {
    this.status = s;
    this.callbacks.onStatusChange(s);
  }
}

function isTransportEvent(e: LiveEventEnvelope): boolean {
  return (
    e.kind === 'connection.disconnected' ||
    e.kind === 'connection.reconnecting' ||
    e.kind === 'connection.recovered'
  );
}

function toTransportSignal(e: LiveEventEnvelope): {
  type: 'disconnected' | 'reconnecting' | 'recovered';
  fromSequence?: number;
  recoveredCount?: number;
} {
  if (e.kind === 'connection.disconnected') return { type: 'disconnected' };
  if (e.kind === 'connection.reconnecting') return { type: 'reconnecting' };
  return {
    type: 'recovered',
    fromSequence: e.metrics?.fromSequence !== undefined ? Number(e.metrics.fromSequence) : undefined,
    recoveredCount: e.metrics?.recoveredCount !== undefined ? Number(e.metrics.recoveredCount) : undefined,
  };
}

/**
 * 同步回放工具（测试用）：直接按顺序同步发出全部事件，返回事件数。
 */
export function replaySync(script: ScenarioScript, onEvent: (e: LiveEventEnvelope) => void) {
  for (const e of script.events) onEvent(e);
  return script.events.length;
}
