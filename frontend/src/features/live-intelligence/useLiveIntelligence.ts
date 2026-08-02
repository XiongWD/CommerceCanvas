/**
 * useLiveIntelligence：将 EventSimulator + Reducer 挂载到 React。
 *
 * 提供单一状态归并（live）+ 演示控制（start/pause/resume/restart/speed/switch）+
 * Evidence 双向定位（focusEvidence/clearFocus）。
 * 组件通过此 hook 消费状态，不直接接触 simulator（任务书 §七）。
 */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ScenarioId } from '@/types/live-event';
import { liveReducer } from './state/live-intelligence-reducer';
import { createInitialState, type LiveIntelligenceState } from './state/live-intelligence-state';
import { EventSimulator, type SimulatorStatus } from './simulator/runtime';

/** Evidence 焦点（本地 UI 状态，非业务事件） */
export interface EvidenceFocus {
  assetId: string;
  layer: 'subject' | 'logo' | 'safe' | 'guide' | 'text';
  regionId?: string;
  source: 'trace' | 'canvas';
  fromSequence?: number;
}

export interface LiveIntelligenceApi {
  state: LiveIntelligenceState;
  simulatorStatus: SimulatorStatus;
  speed: 0.5 | 1 | 2;
  scenarioId: ScenarioId;
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
  const [state, dispatch] = useReducer(liveReducer, createInitialState(initial));
  const [simulatorStatus, setSimulatorStatus] = useState<SimulatorStatus>('idle');
  const [speed, setSpeedState] = useState<0.5 | 1 | 2>(1);
  const [focus, setFocus] = useState<EvidenceFocus | undefined>(undefined);
  const [highlightedSequence, setHighlightedSequence] = useState<number | undefined>(undefined);

  const simulatorRef = useRef<EventSimulator | null>(null);
  if (simulatorRef.current === null) {
    simulatorRef.current = new EventSimulator({
      onEvent: (event) => dispatch({ type: 'apply_event', event }),
      onStatusChange: (s) => setSimulatorStatus(s),
    });
    simulatorRef.current.load(initial);
  }

  useEffect(() => {
    return () => simulatorRef.current?.dispose();
  }, []);

  const start = useCallback(() => simulatorRef.current?.start(), []);
  const pause = useCallback(() => simulatorRef.current?.pause(), []);
  const resume = useCallback(() => simulatorRef.current?.resume(), []);
  const restart = useCallback(() => {
    dispatch({ type: 'reset', scenario: scenarioId });
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
    dispatch({ type: 'reset', scenario: id });
    setFocus(undefined);
    setHighlightedSequence(undefined);
    simulatorRef.current?.switchScenario(id);
  }, []);

  const focusEvidence = useCallback((f: EvidenceFocus) => {
    setFocus(f);
    if (f.source === 'canvas' && f.fromSequence) {
      setHighlightedSequence(f.fromSequence);
    }
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
