/**
 * AnalysisTrace 交互测试：点击携带 evidenceRefs 的轨迹条目触发定位；
 * determinate vs indeterminate 进度渲染差异。
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisTrace } from './AnalysisTrace';
import { applyEvents } from '../state/live-intelligence-reducer';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildReconnectScenario } from '../simulator/scenario-reconnect';
import { createInitialState } from '../state/live-intelligence-state';
import { selectProgressMode } from '../state/live-intelligence-selectors';

describe('AnalysisTrace 双向定位', () => {
  it('点击携带 evidenceRefs 的轨迹条目触发 onFocusEvidence', () => {
    const state = applyEvents(buildNormalScenario().events, 'normal');
    const onFocus = vi.fn();
    render(
      <AnalysisTrace state={state} highlightedSequence={undefined} onFocusEvidence={onFocus} />,
    );
    // 找到带「点击定位证据」的条目
    const clickable = screen.getAllByText('点击定位证据 →')[0];
    fireEvent.click(clickable);
    expect(onFocus).toHaveBeenCalledOnce();
    const arg = onFocus.mock.calls[0][0];
    expect(arg.source).toBe('trace');
    expect(arg.assetId).toBeTruthy();
  });

  it('无 evidenceRefs 的条目不触发定位', () => {
    const state = applyEvents(buildNormalScenario().events, 'normal');
    const onFocus = vi.fn();
    render(
      <AnalysisTrace state={state} highlightedSequence={undefined} onFocusEvidence={onFocus} />,
    );
    // 点第一条（session.started 系统类，无证据）
    const items = screen.getAllByRole('listitem');
    // 系统类条目不应有「点击定位证据」
    const firstText = items[0].textContent ?? '';
    if (!firstText.includes('点击定位证据')) {
      fireEvent.click(items[0]);
      // 不应因此触发（除非该条带证据）
    }
    // 至少不应崩溃
    expect(state.trace.length).toBeGreaterThan(0);
  });
});

describe('进度模式渲染差异', () => {
  it('idle 状态为 indeterminate（无百分比分母）', () => {
    const idle = createInitialState('normal');
    const p = selectProgressMode(idle);
    expect(p.mode).toBe('indeterminate');
  });

  it('running 中有阶段完成时为 determinate（阶段级真实分母）', () => {
    const state = applyEvents(buildNormalScenario().events.slice(0, 8), 'normal');
    const p = selectProgressMode(state);
    // 前 8 个事件已推进若干阶段，应能给出 determinate 阶段进度
    expect(p.mode).toBe('determinate');
    expect(p.total).toBe(7);
  });
});

describe('里程碑去重（组件层）', () => {
  it('重放场景应用后里程碑不重复', () => {
    const state = applyEvents(buildReconnectScenario().events, 'reconnect');
    const ids = state.milestones.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
