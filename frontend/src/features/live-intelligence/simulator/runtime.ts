/**
 * EventSimulator 运行时：按节奏分发场景事件。
 *
 * 职责（任务书 §五）：
 *   - 开始 / 暂停 / 继续 / 重新运行
 *   - 0.5× / 1× / 2× 速度
 *   - 单一 setInterval（任务书禁止每个组件各自 setInterval）
 *   - 重跑产生与首次完全相同的事件顺序（场景脚本是确定性的）
 *   - 严格递增 sequence，由场景脚本保证；运行时只做游标推进。
 *
 * 运行时不发明事件，只调度场景脚本预生成的事件。
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
}

const SCENARIO_BUILDERS: Record<ScenarioId, () => ScenarioScript> = {
  normal: buildNormalScenario,
  risk: buildRiskScenario,
  reconnect: buildReconnectScenario,
};

/** 基础事件间隔（ms，1× 速度）。确定性，与场景内容无关。 */
const BASE_INTERVAL_MS = 700;

export class EventSimulator {
  private scenario: ScenarioScript | null = null;
  private cursor = 0;
  private status: SimulatorStatus = 'idle';
  private speed: 0.5 | 1 | 2 = 1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly callbacks: SimulatorCallbacks;

  constructor(callbacks: SimulatorCallbacks) {
    this.callbacks = callbacks;
  }

  /** 加载场景（不自动开始） */
  load(scenarioId: ScenarioId) {
    this.stopTimer();
    this.scenario = SCENARIO_BUILDERS[scenarioId]();
    this.cursor = 0;
    this.setStatus('idle');
  }

  /** 开始或继续 */
  start() {
    if (!this.scenario) this.load('normal');
    if (this.status === 'finished') this.reset();
    if (this.status === 'running') return;
    this.setStatus('running');
    this.tick(); // 立即发首个/下一个
    this.scheduleNext();
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

  /** 重新运行当前场景（重置游标，重新加载确定性事件） */
  restart() {
    if (!this.scenario) {
      this.load('normal');
    } else {
      // 重新 build 以拿到全新数组（内容相同）
      const id = this.scenario.scenarioId as ScenarioId;
      this.scenario = SCENARIO_BUILDERS[id]();
    }
    this.cursor = 0;
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

  /** 跳到指定场景 */
  switchScenario(scenarioId: ScenarioId) {
    this.stopTimer();
    this.load(scenarioId);
    this.start();
  }

  reset() {
    this.stopTimer();
    if (this.scenario) {
      const id = this.scenario.scenarioId as ScenarioId;
      this.scenario = SCENARIO_BUILDERS[id]();
    }
    this.cursor = 0;
    this.setStatus('idle');
  }

  dispose() {
    this.stopTimer();
  }

  private tick() {
    if (!this.scenario || this.cursor >= this.scenario.events.length) {
      this.stopTimer();
      this.setStatus('finished');
      return;
    }
    const event = this.scenario.events[this.cursor];
    this.cursor += 1;
    this.callbacks.onEvent(event);
  }

  private scheduleNext() {
    if (this.status !== 'running') return;
    const interval = BASE_INTERVAL_MS / this.speed;
    this.timer = setInterval(() => {
      this.tick();
      if (this.status === 'running') {
        // 重排以应用最新速度（setSpeed 时已重排，这里保持）
      } else {
        this.stopTimer();
      }
      // 持续调度：tick 内会处理 finished
      if (this.status === 'running' && this.cursor >= (this.scenario?.events.length ?? 0)) {
        this.tick(); // 触发 finished
      }
    }, interval);
  }

  private stopTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private setStatus(s: SimulatorStatus) {
    this.status = s;
    this.callbacks.onStatusChange(s);
  }
}

/**
 * 同步回放工具（测试用）：直接按顺序同步发出全部事件，返回事件数。
 * 用于 reducer 测试与"立即完成"演示。
 */
export function replaySync(script: ScenarioScript, onEvent: (e: LiveEventEnvelope) => void) {
  for (const e of script.events) onEvent(e);
  return script.events.length;
}
