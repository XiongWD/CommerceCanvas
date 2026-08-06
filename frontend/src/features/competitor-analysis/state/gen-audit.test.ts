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
const AUDIT_OUT = process.env.AUDIT_OUT || path.join(REPO_ROOT, 'artifacts/frontend/g2-f2-r1-3-e1');

function dispatchAll(events, scenario, jobId) {
  let s = createInitialState(scenario);
  s = { ...s, jobId };
  for (const e of events) s = liveReducer(s, { type: 'apply_event', event: e });
  return s;
}

describe('data-audit generation', () => {
  it('generates data-audit.json with missingEntityIds + navigationCoverage check', async () => {
    const normalState = dispatchAll(buildNormalScenario().events, 'normal', 'job-normal-001');
    const riskState = dispatchAll(buildRiskScenario().events, 'risk', 'job-risk-002');

    const audit = generateCompetitorDataAudit(competitorAnalysisMock, normalState, riskState);

    await mkdir(AUDIT_OUT, { recursive: true });
    await writeFile(path.join(AUDIT_OUT, 'data-audit.json'), JSON.stringify(audit, null, 2));

    // Assert: all entities covered
    expect(audit.missingEntityIds).toHaveLength(0);

    // Assert: navigationCoverage has no missingIds
    expect(audit.navigationCoverage.risks.missingIds).toHaveLength(0);
    expect(audit.navigationCoverage.recipeFields.missingIds).toHaveLength(0);
    expect(audit.navigationCoverage.clusters.missingIds).toHaveLength(0);
    expect(audit.navigationCoverage.sellingPoints.missingIds).toHaveLength(0);
  });
});
