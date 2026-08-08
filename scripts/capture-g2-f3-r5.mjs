/**
 * G2-F3 R5 Final Route Evidence Closure（E1-E2 + runtime-proof.json）。
 *
 * 唯一目标：证明正式 Router route contract 命中（非 * fallback）。
 *
 * Fix 1: canonical URL join（new URL(path, base)），消除 // 双斜杠
 * Fix 2: CompetitorAnalysisPage useParams instrumentation（data-route-product-id/run-id）
 *
 * E2 用独立 context + canonical normal Analysis route 起点 + page.goBack + exact route params。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const BASE = process.env.CAPTURE_URL || 'http://localhost:4175';
const OUT = 'artifacts/frontend/g2-f3-r5';
const ANALYSIS_PATH = '/products/ow-a31-blk/competitor-analysis/job-normal-001';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

async function readInst(page) {
  return await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="persistent-task-bar"]');
    const analysisRoot = document.querySelector('[data-selected-cluster-id]');
    if (!bar) return null;
    return {
      receivedCount: Number(bar.getAttribute('data-received-count') ?? '0'),
      jobId: bar.getAttribute('data-job-id') ?? '',
      simulatorIdentity: bar.getAttribute('data-simulator-identity') ?? '',
      jobStatus: bar.getAttribute('data-job-status') ?? '',
      focusedAsset: bar.getAttribute('data-focused-asset') ?? '',
      focusedLayer: bar.getAttribute('data-focused-layer') ?? '',
      focusedRegion: bar.getAttribute('data-focused-region') ?? '',
      highlightedSeq: bar.getAttribute('data-highlighted-seq') ?? '',
      routeProductId: analysisRoot?.getAttribute('data-route-product-id') ?? '',
      routeRunId: analysisRoot?.getAttribute('data-route-run-id') ?? '',
      pathname: window.location.pathname,
    };
  });
}

async function waitForFinished(page, timeout = 90000) {
  await page.waitForFunction(() => {
    const bar = document.querySelector('[data-testid="persistent-task-bar"]');
    const s = bar?.getAttribute('data-job-status');
    return s === 'completed' || s === 'awaiting_review';
  }, { timeout });
}

async function runScenario(page, label) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const screenshots = [];
  const snap = async (page, name) => {
    const file = path.join(OUT, name);
    await page.screenshot({ path: file, animations: 'disabled' });
    screenshots.push({ file: name, sha256: await sha256(file) });
    console.log(`  📸 ${name}`);
  };

  const proof = { qc: {}, browserBack: {} };

  // ========= E1: QC → Evidence exact（独立 context） =========
  console.log('\n[E1] QC → Evidence exact');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    await runScenario(page, '场景 B · 高风险待确认');
    await page.waitForTimeout(25000);
    await waitForFinished(page);
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    await page.locator('[data-testid="job-section-QC 结果"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const qcExpected = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="job-qc-qc-structure-risk"]');
      return {
        sourceSequence: el?.getAttribute('data-qc-source-sequence') ?? '',
        evidenceAsset: el?.getAttribute('data-qc-evidence-asset') ?? '',
        evidenceLayer: el?.getAttribute('data-qc-evidence-layer') ?? '',
        evidenceRegion: el?.getAttribute('data-qc-evidence-region') ?? '',
      };
    });
    assert(qcExpected.sourceSequence !== '', `QC DOM sourceSequence 非空`);
    await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
    await page.waitForTimeout(1500);
    const inst = await readInst(page);
    assert(inst.focusedAsset === qcExpected.evidenceAsset, `actualAsset(${inst.focusedAsset}) === expected(${qcExpected.evidenceAsset})`);
    assert(inst.focusedLayer === qcExpected.evidenceLayer, `actualLayer(${inst.focusedLayer}) === expected(${qcExpected.evidenceLayer})`);
    assert(inst.focusedRegion === qcExpected.evidenceRegion, `actualRegion('${inst.focusedRegion}') === expected('${qcExpected.evidenceRegion}')`);
    assert(Number(inst.highlightedSeq) === Number(qcExpected.sourceSequence), `actualSeq(${inst.highlightedSeq}) === expected(${qcExpected.sourceSequence})`);
    proof.qc = {
      expectedAsset: qcExpected.evidenceAsset, actualAsset: inst.focusedAsset,
      expectedLayer: qcExpected.evidenceLayer, actualLayer: inst.focusedLayer,
      expectedRegion: qcExpected.evidenceRegion, actualRegion: inst.focusedRegion,
      expectedTraceSequence: Number(qcExpected.sourceSequence), actualTraceSequence: Number(inst.highlightedSeq),
    };
    console.log(`  PROOF QC: ${JSON.stringify(proof.qc)}`);
    await snap(page, 'e1-qc-evidence-exact.png');
    await ctx.close();
  }

  // ========= E2: Canonical Same-Job Browser Back（独立 context） =========
  console.log('\n[E2] Canonical same-job Browser Back');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const page = await ctx.newPage();
    // Fix 1: canonical URL join（消除 // 双斜杠）
    const canonicalUrl = new URL(ANALYSIS_PATH, BASE).toString();
    console.log(`  canonicalUrl: ${canonicalUrl}`);
    await page.goto(canonicalUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    await runScenario(page, '场景 A · 正常完成');
    await page.waitForTimeout(4000);
    const before = await readInst(page);
    // 起点强断言：canonical pathname + named route params + routeRunId === activeJobId
    assert(before.pathname === ANALYSIS_PATH, `pathnameBefore(${before.pathname}) === canonical(${ANALYSIS_PATH})`);
    assert(!before.pathname.startsWith('//'), `pathnameBefore 无双斜杠`);
    assert(before.routeProductId === 'ow-a31-blk', `routeProductId(${before.routeProductId}) === ow-a31-blk`);
    assert(before.routeRunId === 'job-normal-001', `routeRunId(${before.routeRunId}) === job-normal-001`);
    assert(before.routeRunId === before.jobId, `routeRunId(${before.routeRunId}) === activeJobId(${before.jobId})`);
    // 真实 UI 进 Job Detail
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const onJob = await readInst(page);
    assert(onJob.pathname === '/jobs/job-normal-001', `jobDetailPath(${onJob.pathname}) === /jobs/job-normal-001`);
    assert(onJob.jobId === 'job-normal-001', `jobIdOnJob(${onJob.jobId}) === job-normal-001`);
    // 真实 Browser Back
    await page.goBack();
    await page.waitForTimeout(1500);
    const after = await readInst(page);
    // Back 后强断言
    assert(after.pathname === ANALYSIS_PATH, `pathnameAfter(${after.pathname}) === canonical(${ANALYSIS_PATH})`);
    assert(!after.pathname.startsWith('//'), `pathnameAfter 无双斜杠`);
    assert(after.routeProductId === before.routeProductId, `routeProductIdAfter(${after.routeProductId}) === before(${before.routeProductId})`);
    assert(after.routeRunId === before.routeRunId, `routeRunIdAfter(${after.routeRunId}) === before(${before.routeRunId})`);
    assert(after.routeRunId === after.jobId, `routeRunIdAfter(${after.routeRunId}) === activeJobIdAfter(${after.jobId})`);
    assert(after.jobId === onJob.jobId, `jobIdAfter(${after.jobId}) === jobIdOnJob(${onJob.jobId})`);
    assert(after.simulatorIdentity === onJob.simulatorIdentity, `identityAfter === identityOnJob`);
    assert(after.receivedCount >= onJob.receivedCount, `receivedAfter(${after.receivedCount}) >= receivedOnJob(${onJob.receivedCount})`);
    assert(after.jobStatus !== 'idle' && after.jobStatus !== '', `jobStatusAfter(${after.jobStatus}) 非 idle/空`);
    proof.browserBack = {
      pathnameBefore: before.pathname, pathnameOnJob: onJob.pathname, pathnameAfter: after.pathname,
      pathnameHasDoubleSlash: false,
      routeProductIdBefore: before.routeProductId, routeProductIdAfter: after.routeProductId,
      routeRunIdBefore: before.routeRunId, routeRunIdAfter: after.routeRunId,
      activeJobIdBefore: before.jobId, activeJobIdOnJob: onJob.jobId, activeJobIdAfter: after.jobId,
      receivedBefore: before.receivedCount, receivedOnJob: onJob.receivedCount, receivedAfter: after.receivedCount,
      simulatorIdentityBefore: before.simulatorIdentity, simulatorIdentityOnJob: onJob.simulatorIdentity, simulatorIdentityAfter: after.simulatorIdentity,
      jobStatusOnJob: onJob.jobStatus, jobStatusAfter: after.jobStatus,
    };
    console.log(`  PROOF Back: ${JSON.stringify(proof.browserBack)}`);
    await snap(page, 'e2-browser-back-canonical-route.png');
    await ctx.close();
  }

  await browser.close();

  // runtime-proof.json（Playwright 自动写入，非手填）
  await writeFile(path.join(OUT, 'runtime-proof.json'), JSON.stringify(proof, null, 2));
  console.log(`  📄 runtime-proof.json`);

  // interaction-report
  const report = `# G2-F3 R5 Final Route Evidence Closure

生成时间：${new Date().toISOString()}
浏览器：Playwright Chromium ${bv}

## Canonical Route Proof
- canonical URL: ${new URL(ANALYSIS_PATH, BASE).toString()}（new URL join，无双斜杠）
- pathnameBefore === pathnameAfter === ${ANALYSIS_PATH}
- named route useParams: productId=ow-a31-blk, runId=job-normal-001（非 * fallback）
- routeRunId === activeJobId === job-normal-001

## QC Exact（R4 contract 保持）
- expectedTraceSequence 从 QC DOM 读取，actualTraceSequence exact match

## Browser Back（同一 Job）
- page.goBack() 后 canonical pathname exact 恢复
- route params 恢复 / same Job / same Simulator / receivedCount 不减

## runtime-proof.json
- 由 Playwright 自动写入，非人工填写
`;
  await writeFile(path.join(OUT, 'interaction-report.md'), report);

  // manifest
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    captureRules: 'canonical URL join；named route useParams instrumentation；page.goBack；runtime-proof.json 自动生成',
    screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：${screenshots.length} 截图 + runtime-proof.json + report + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
