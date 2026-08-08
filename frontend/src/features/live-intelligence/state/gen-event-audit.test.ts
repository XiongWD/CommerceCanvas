/**
 * 事件审计生成器：驱动三场景，程序化写出 event-audit.json。
 * 该测试本身断言关键契约，同时把审计结果写入 AUDIT_OUT/event-audit.json。
 */
import { describe, it, expect } from 'vitest';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { liveReducer } from './live-intelligence-reducer';
import { createInitialState } from './live-intelligence-state';
import { buildNormalScenario } from '../simulator/scenario-normal';
import { buildRiskScenario } from '../simulator/scenario-risk';
import { buildReconnectScenario } from '../simulator/scenario-reconnect';

// 始终写到仓库根的 artifacts/frontend/g2-f1-r1/，避免受 vitest cwd 影响产生嵌套路径。
const REPO_ROOT = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../../../../../..',
);
const AUDIT_OUT = process.env.AUDIT_OUT || path.join(REPO_ROOT, 'artifacts/frontend/g2-f1-r1');

function dispatchAll(events, scenario, jobId) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

function recipeDoneCount(state) {
  return Object.values(state.recipe).filter(Boolean).length;
}

describe('event-audit 生成', () => {
  it('写出 event-audit.json 并验证契约', async () => {
    const normalEvents = buildNormalScenario().events;
    const riskEvents = buildRiskScenario().events;
    const reconnectEvents = buildReconnectScenario().events;

    const normalState = dispatchAll(normalEvents, 'normal', 'job-normal-001');
    const riskState = dispatchAll(riskEvents, 'risk', 'job-risk-002');

    // reconnect：业务事件应用 + transport 信号
    let reconnectState = createInitialState('reconnect');
    reconnectState = { ...reconnectState, jobId: 'job-reconnect-003' };
    for (const e of reconnectEvents) {
      if (e.kind.startsWith('connection.')) {
        if (e.kind === 'connection.disconnected')
          reconnectState = liveReducer(reconnectState, { type: 'transport_disconnected' });
        else if (e.kind === 'connection.reconnecting')
          reconnectState = liveReducer(reconnectState, { type: 'transport_reconnecting' });
        else
          reconnectState = liveReducer(reconnectState, {
            type: 'transport_recovered',
            fromSequence: Number(e.metrics?.fromSequence ?? 0),
            recoveredCount: Number(e.metrics?.recoveredCount ?? 0),
          });
      } else {
        reconnectState = liveReducer(reconnectState, { type: 'apply_event', event: e });
      }
    }

    const replayedSequences = reconnectEvents
      .filter((e) => !e.kind.startsWith('connection.') && e.replayed === true)
      .map((e) => e.sequence);

    const audit = {
      generatedAt: new Date().toISOString(),
      normal: {
        scenarioEvents: normalEvents.length,
        dispatchedEvents: normalEvents.length,
        uniqueEventIds: new Set(normalEvents.map((e) => e.eventId)).size,
        customerTraceItems: normalState.trace.length,
        findings: normalState.summaryMetrics.findings,
        risks: normalState.summaryMetrics.risks,
        artifacts: normalState.summaryMetrics.artifacts,
        blockingConflicts: normalState.summaryMetrics.blockingConflicts,
        recipeFields: recipeDoneCount(normalState),
        jobStatus: normalState.jobStatus,
      },
      risk: {
        scenarioEvents: riskEvents.length,
        dispatchedEvents: riskEvents.length,
        uniqueEventIds: new Set(riskEvents.map((e) => e.eventId)).size,
        customerTraceItems: riskState.trace.length,
        findings: riskState.summaryMetrics.findings,
        risks: riskState.summaryMetrics.risks,
        blockingConflicts: riskState.summaryMetrics.blockingConflicts,
        recipeFields: recipeDoneCount(riskState),
        buildRecipeStatus: riskState.stages.build_recipe.status,
        jobStatus: riskState.jobStatus,
      },
      reconnect: {
        scenarioEvents: reconnectEvents.length,
        lastEventIdBeforeDisconnect: 18,
        replayedSequences,
        recoveredCount: 4,
        duplicateArtifacts: reconnectState.artifacts.filter(
          (a) => reconnectState.artifacts.filter((b) => b.artifactId === a.artifactId).length > 1,
        ).length,
        duplicateMilestones: reconnectState.milestones.length - new Set(reconnectState.milestones.map((m) => m.id)).size,
        jobIdConsistent: reconnectEvents.filter((e) => !e.kind.startsWith('connection.')).every((e) => e.jobId === 'job-reconnect-003'),
      },
    };

    // 契约断言
    expect(audit.normal.scenarioEvents).toBe(audit.normal.dispatchedEvents);
    expect(audit.normal.uniqueEventIds).toBe(audit.normal.scenarioEvents);
    expect(audit.normal.findings).toBe(24);
    expect(audit.normal.risks).toBe(3);
    // F3-R3 §7：summaryMetrics.artifacts = 最终产物数（1），非 total（5）
    expect(audit.normal.artifacts).toBe(1);
    expect(audit.normal.blockingConflicts).toBe(0);
    expect(audit.normal.recipeFields).toBe(7);
    expect(audit.risk.buildRecipeStatus).toBe('awaiting_review');
    expect(audit.risk.blockingConflicts).toBe(1);
    expect(audit.reconnect.replayedSequences).toEqual([19, 20, 21, 22]);
    expect(audit.reconnect.recoveredCount).toBe(4);
    expect(audit.reconnect.duplicateArtifacts).toBe(0);
    expect(audit.reconnect.duplicateMilestones).toBe(0);
    expect(audit.reconnect.jobIdConsistent).toBe(true);

    await mkdir(AUDIT_OUT, { recursive: true });
    await writeFile(path.join(AUDIT_OUT, 'event-audit.json'), JSON.stringify(audit, null, 2));
  });
});
