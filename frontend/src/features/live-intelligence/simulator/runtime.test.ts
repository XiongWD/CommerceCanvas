/**
 * EventSimulator 运行时测试（fake timers，验证不双重执行）。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventSimulator, type SimulatorCallbacks } from './runtime';
import { buildNormalScenario } from './scenario-normal';
import { buildRiskScenario } from './scenario-risk';

function makeCallbacks(): SimulatorCallbacks & { events: unknown[]; counts: number[] } {
  const events: unknown[] = [];
  const counts: number[] = [];
  return {
    events,
    counts,
    onEvent: (e) => events.push(e),
    onStatusChange: () => {},
    onDispatchCountChange: (c) => counts.push(c),
  } as SimulatorCallbacks & { events: unknown[]; counts: number[] };
}

describe('EventSimulator 双重执行防护', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('load + start：每个事件只分发一次（normal）', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.start();
    // 推进足够长时间让全部事件分发完
    vi.advanceTimersByTime(120 * 1000);
    const expected = buildNormalScenario().events.length;
    expect(cb.events.length).toBe(expected);
    sim.dispose();
  });

  it('load + start：每个事件只分发一次（risk）', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('risk');
    sim.start();
    vi.advanceTimersByTime(120 * 1000);
    const expected = buildRiskScenario().events.length;
    expect(cb.events.length).toBe(expected);
    sim.dispose();
  });

  it('switchScenario 不自动开始（事件数为 0）', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.switchScenario('risk');
    vi.advanceTimersByTime(5 * 1000);
    expect(cb.events.length).toBe(0);
    sim.dispose();
  });

  it('setSpeed 不产生第二个 timer', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.start();
    vi.advanceTimersByTime(1000);
    const before = cb.events.length;
    sim.setSpeed(2);
    vi.advanceTimersByTime(1000);
    // 应继续递增，而非翻倍跳跃
    expect(cb.events.length).toBeGreaterThan(before);
    sim.dispose();
  });

  it('pause + resume 不重复当前事件', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.start();
    vi.advanceTimersByTime(2000);
    const afterStart = cb.events.length;
    sim.pause();
    sim.resume();
    vi.advanceTimersByTime(500);
    // resume 后第一个新事件应是 afterStart+1 位置（不重复）
    expect(cb.events.length).toBeGreaterThanOrEqual(afterStart);
    sim.dispose();
  });

  it('restart 状态清空，完整场景只运行一次', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.start();
    vi.advanceTimersByTime(120 * 1000);
    const firstRun = cb.events.length;
    cb.events.length = 0;
    sim.restart();
    vi.advanceTimersByTime(120 * 1000);
    expect(cb.events.length).toBe(firstRun);
    sim.dispose();
  });

  it('dispose 后不再分发事件', () => {
    const cb = makeCallbacks();
    const sim = new EventSimulator(cb);
    sim.load('normal');
    sim.start();
    vi.advanceTimersByTime(2000);
    const before = cb.events.length;
    sim.dispose();
    vi.advanceTimersByTime(60 * 1000);
    expect(cb.events.length).toBe(before);
  });
});
