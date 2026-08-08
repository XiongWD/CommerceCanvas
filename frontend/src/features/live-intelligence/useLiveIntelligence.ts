/**
 * useLiveIntelligence：将 EventSimulator + Reducer 挂载到 React（R1）。
 *
 * R1：reducer 去重信息属于 state.ledger，liveReducer 是无状态纯函数；
 * 因此 useReducer 与测试 applyEvents 走完全相同的归并路径。
 * 连接状态用 transport action（独立于业务 sequence）。
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ScenarioId } from '@/types/live-event';
import { liveReducer } from './state/live-intelligence-reducer';
import { createInitialState, type LiveIntelligenceState } from './state/live-intelligence-state';
import { EventSimulator, type SimulatorStatus } from './simulator/runtime';
import { buildNormalScenario } from './simulator/scenario-normal';
import { buildRiskScenario } from './simulator/scenario-risk';
import { buildReconnectScenario } from './simulator/scenario-reconnect';

const JOB_IDS: Record<ScenarioId, string> = {
  normal: 'job-normal-001',
  risk: 'job-risk-002',
  reconnect: 'job-reconnect-003',
};

/** Evidence 焦点（本地 UI 状态，非业务事件） */
export interface EvidenceFocus {
  assetId: string;
  layer: 'subject' | 'logo' | 'safe' | 'guide' | 'text' | 'risk';
  regionId?: string;
  source: 'trace' | 'canvas';
  fromSequence?: number;
}

export interface LiveIntelligenceApi {
  state: LiveIntelligenceState;
  simulatorStatus: SimulatorStatus;
  speed: 0.5 | 1 | 2;
  scenarioId: ScenarioId;
  /**
   * F3-R2 P1-2：Simulator 实例稳定标识（test-only identity）。
   * 与 useRef 持有的 EventSimulator 实例生命周期绑定：同一 Provider 期间不变，
   * 跨路由切换也保持（证明 Router 切页不重建 Simulator）。
   * 仅用于读取 identity，不改变生产状态。
   */
  simulatorInstanceId: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  setSpeed: (s: 0.5 | 1 | 2) => void;
  switchScenario: (id: ScenarioId) => void;
  focusEvidence: (focus: EvidenceFocus) => void;
  focus: EvidenceFocus | undefined;
  clearFocus: () => void;
  highlightTraceSequence: (seq: number | undefined) => void;
  highlightedSequence?: number;
}

export function useLiveIntelligence(initial: ScenarioId = 'normal'): LiveIntelligenceApi {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(initial);
  const [state, dispatch] = useReducer(
    liveReducer,
    createInitialState(initial),
    (s) => ({ ...s, jobId: JOB_IDS[initial] }),
  );
  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus>('idle');
  const [speed, setSpeedState] = useState<0.5 | 1 | 2>(1);
  const [focus, setFocus] = useState<EvidenceFocus | undefined>(undefined);
  const [highlightedSequence, setHighlightedSequence] = useState<number | undefined>(undefined);

  const simulatorRef = useRef<EventSimulator | null>(null);
  // F3-R2 P1-2：simulatorInstanceId 与 simulatorRef 生命周期绑定（同实例不变，跨路由保持）
  const instanceIdRef = useRef<string>('');
  if (simulatorRef.current === null) {
    simulatorRef.current = new EventSimulator({
      onEvent: (event) => dispatch({ type: 'apply_event', event }),
      onStatusChange: (s) => setSimulatorStatus(s),
      onTransport: (sig) => {
        if (sig.type === 'disconnected')
          dispatch({ type: 'transport_disconnected', eventId: sig.eventId, occurredAt: sig.occurredAt });
        else if (sig.type === 'reconnecting')
          dispatch({ type: 'transport_reconnecting', eventId: sig.eventId, occurredAt: sig.occurredAt });
        else
          dispatch({
            type: 'transport_recovered',
            eventId: sig.eventId,
            occurredAt: sig.occurredAt,
            fromSequence: sig.fromSequence ?? 0,
            recoveredCount: sig.recoveredCount ?? 0,
          });
      },
    });
    simulatorRef.current.load(initial);
    // F3-R2 P1-2：为该 Simulator 实例分配稳定标识（crypto.randomUUID 在 jsdom/浏览器均可用）
    instanceIdRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  useEffect(() => {
    return () => simulatorRef.current?.dispose();
  }, []);

  const start = useCallback(() => simulatorRef.current?.start(), []);
  const pause = useCallback(() => simulatorRef.current?.pause(), []);
  const resume = useCallback(() => simulatorRef.current?.resume(), []);

  const restart = useCallback(() => {
    const jobId = JOB_IDS[scenarioId];
    dispatch({ type: 'reset', scenario: scenarioId, jobId });
    setFocus(undefined);
    setHighlightedSequence(undefined);
    simulatorRef.current?.restart();
  }, [scenarioId]);

  const setSpeed = useCallback((s: 0.5 | 1 | 2) => {
    setSpeedState(s);
    simulatorRef.current?.setSpeed(s);
  }, []);

  const switchScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id);
    const jobId = JOB_IDS[id];
    dispatch({ type: 'reset', scenario: id, jobId });
    setFocus(undefined);
    setHighlightedSequence(undefined);
    // R1：只 load + reset，不自动 start
    simulatorRef.current?.switchScenario(id);
  }, []);

  const focusEvidence = useCallback((f: EvidenceFocus) => {
    setFocus(f);
    if (f.source === 'canvas' && f.fromSequence) setHighlightedSequence(f.fromSequence);
  }, []);
  const clearFocus = useCallback(() => {
    setFocus(undefined);
    setHighlightedSequence(undefined);
  }, []);
  const highlightTraceSequence = useCallback((seq: number | undefined) => {
    setHighlightedSequence(seq);
  }, []);

  const stateWithFocus = useMemo<LiveIntelligenceState>(
    () => (focus ? { ...state, focusedEvidence: focus } : state),
    [state, focus],
  );

  return {
    state: stateWithFocus,
    simulatorStatus,
    speed,
    scenarioId,
    // F3-R2 P1-2：test-only identity（读取，不改变生产状态）
    simulatorInstanceId: instanceIdRef.current,
    start,
    pause,
    resume,
    restart,
    setSpeed,
    switchScenario,
    focusEvidence,
    focus,
    clearFocus,
    highlightTraceSequence,
    highlightedSequence,
  };
}

// re-export scenario builders for event-audit script
export { buildNormalScenario, buildRiskScenario, buildReconnectScenario };
