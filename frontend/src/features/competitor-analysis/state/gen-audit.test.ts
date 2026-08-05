/**
 * F2-R1.2 data-audit 生成测试（由 scripts/generate-g2-f2-audit.mjs 调用）。
 * 调用共享 generateCompetitorDataAudit，计算 missingEntityIds，写 data-audit.json。
 */
import { describe, it, expect } from 'vitest';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { liveReducer } from '@/features/live-intelligence/state/live-intelligence-reducer';
import { createInitialState } from '@/features/live-intelligence/state/live-intelligence-state';
import { generateCompetitorDataAudit } from './data-audit-generator';
import { competitorAnalysisMock } from '@/data/competitor-analysis.mock';
import { buildNormalScenario } from '@/features/live-intelligence/simulator/scenario-normal';
import { buildRiskScenario } from '@/features/live-intelligence/simulator/scenario-risk';

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../../../../../../..');
const AUDIT_OUT = process.env.AUDIT_OUT || path.join(REPO_ROOT, 'artifacts/frontend/g2-f2-r1-2');

function dispatchAll(events, scenario, jobId) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('data-audit generation', () => {
  it('generates data-audit.json with missingEntityIds check', async () => {
    const normalState = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const riskState = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');

    const audit = generateCompetitorDataAudit(competitorAnalysisMock, normalState, riskState);

    // missingEntityIds: check all mock entity IDs have at least one source event in normal
    const allMockIds = [
      ...competitorAnalysisMock.assets.map((a) => a.id),
      ...competitorAnalysisMock.clusters.map((c) => c.id),
      ...competitorAnalysisMock.sellingPoints.map((s) => s.id),
      ...competitorAnalysisMock.insights.map((i) => i.id),
      ...competitorAnalysisMock.riskExclusion.prohibited.map((r) => r.id),
      ...competitorAnalysisMock.riskExclusion.factCheck.map((r) => r.id),
      ...competitorAnalysisMock.riskExclusion.safe.map((r) => r.id),
    ];
    const coveredInNormal = new Set([
      ...(normalState.resultRefsAccumulated?.classifiedAssetIds ?? []),
      ...(normalState.resultRefsAccumulated?.clusterIds ?? []),
      ...(normalState.resultRefsAccumulated?.sellingPointIds ?? []),
      ...(normalState.resultRefsAccumulated?.insightIds ?? []),
      ...(normalState.resultRefsAccumulated?.riskItemIds ?? []),
    ]);
    const missingEntityIds = allMockIds.filter((id) => !coveredInNormal.has(id));

    const fullAudit = {
      ...audit,
      missingEntityIds,
      missingCount: missingEntityIds.length,
    };

    // Write to output
    await mkdir(AUDIT_OUT, { recursive: true });
    await writeFile(path.join(AUDIT_OUT, 'data-audit.json'), JSON.stringify(fullAudit, null, 2));

    // Assert: all entities covered
    expect(missingEntityIds).toHaveLength(0);
  });
});
