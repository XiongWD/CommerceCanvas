/**
 * R1 AnalysisTrace + Evidence 双向定位测试。
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisTrace } from './AnalysisTrace';
import { liveReducer } from '../state/live-intelligence-reducer';
import { createInitialState } from '../state/live-intelligence-state';
import { buildNormalScenario } from '../simulator/scenario-normal';

function dispatchNormal() {
  let s = createInitialState('normal');
  s = { ...s, jobId: 'job-normal-001' };
  for (const e of buildNormalScenario().events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('AnalysisTrace 轨迹→画布定位', () => {
  it('点击携带 evidenceRefs 的轨迹条目触发 onFocusEvidence', () => {
    const state = dispatchNormal();
    const onFocus = vi.fn();
    render(<AnalysisTrace state={state} highlightedSequence={undefined} onFocusEvidence={onFocus} />);
    const clickable = screen.getAllByText('点击定位证据 →')[0];
    fireEvent.click(clickable);
    expect(onFocus).toHaveBeenCalledOnce();
    const arg = onFocus.mock.calls[0][0];
    expect(arg.source).toBe('trace');
    expect(arg.assetId).toBeTruthy();
  });

  it('轨迹不显示普通 heartbeat 系统事件', () => {
    const state = dispatchNormal();
    // 客户轨迹不含阶段排队/开始/进度/完成
    const titles = state.trace.map((t) => t.titleZh);
    expect(titles.some((t) => t === '阶段排队' || t === '阶段开始' || t === '阶段进度' || t === '阶段完成')).toBe(false);
  });

  it('轨迹无重复 eventId', () => {
    const state = dispatchNormal();
    const ids = state.trace.map((t) => t.eventId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Evidence 画布→轨迹定位（findSequenceForRegion 逻辑）', () => {
  it('存在匹配 regionId 时返回对应 sequence', () => {
    const state = dispatchNormal();
    // 在 trace 中找一条带 regionId 的证据
    const withRegion = state.trace.find((t) => t.evidenceRefs?.some((r) => r.regionId));
    expect(withRegion).toBeTruthy();
    if (withRegion) {
      const ref = withRegion.evidenceRefs!.find((r) => r.regionId)!;
      const found = state.trace.find((t) => t.evidenceRefs?.some((r) => r.regionId === ref.regionId));
      expect(found?.sequence).toBe(withRegion.sequence);
    }
  });

  it('无 regionId 时按 assetId+layer 回退匹配', () => {
    const state = dispatchNormal();
    const withAsset = state.trace.find((t) => t.evidenceRefs?.[0]?.assetId);
    expect(withAsset).toBeTruthy();
  });

  it('不存在匹配事件时不崩溃（返回 undefined）', () => {
    const state = dispatchNormal();
    const found = state.trace.find((t) => t.evidenceRefs?.some((r) => r.regionId === 'nonexistent'));
    expect(found).toBeUndefined();
  });
});

describe('切换场景后里程碑可重新展示', () => {
  it('reset 后 shownMilestoneIds 按 jobId#runId 分组，新 run 不继承旧记录', () => {
    let s = createInitialState('normal');
    s = { ...s, jobId: 'job-normal-001', runId: 1 };
    // 应用一个里程碑
    s = liveReducer(s, {
      type: 'apply_event',
      event: {
        eventId: 'm1', sequence: 1, occurredAt: '2026-08-02T13:32:00Z', jobId: 'job-normal-001',
        kind: 'milestone.reached', severity: 'success', titleZh: '用途识别完成',
        traceCategory: '成果', metrics: { milestoneId: 'purpose_classified' },
      } as never,
    });
    expect((s.shownMilestoneIds['job-normal-001#1'] ?? []).includes('purpose_classified')).toBe(true);
    // reset 到 risk jobId（runId 递增）
    s = liveReducer(s, { type: 'reset', scenario: 'risk', jobId: 'job-risk-002' });
    expect((s.shownMilestoneIds['job-risk-002#2'] ?? []).length).toBe(0);
  });
});
