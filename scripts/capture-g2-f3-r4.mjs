/**
 * G2-F3 R4 Evidence Closure（E1-E2，最小）。
 *
 * Blocker 1: Playwright highlightedTraceSequence exact（从真实 QC DOM 读取 expected，非写死）
 * Blocker 2: Browser Back 同一 Job Route（独立 page + 干净 normal Analysis 起点 + exact pathname）
 *
 * E1/E2 分别用独立 browser context，避免历史栈污染。
 * 初始 page.goto() 仅用于建立测试起点（允许）；Analysis→JobDetail 用真实 UI 点击。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const URL = process.env.CAPTURE_URL || 'http://localhost:4175/';
const OUT = 'artifacts/frontend/g2-f3-r4';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

async function readInst(page) {
  return await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="persistent-task-bar"]');
    if (!bar) return null;
    return {
      receivedCount: Number(bar.getAttribute('data-received-count') ?? '0'),
      runId: Number(bar.getAttribute('data-run-id') ?? '0'),
      jobId: bar.getAttribute('data-job-id') ?? '',
      simulatorIdentity: bar.getAttribute('data-simulator-identity') ?? '',
      jobStatus: bar.getAttribute('data-job-status') ?? '',
      focusedAsset: bar.getAttribute('data-focused-asset') ?? '',
      focusedLayer: bar.getAttribute('data-focused-layer') ?? '',
      focusedRegion: bar.getAttribute('data-focused-region') ?? '',
      highlightedSeq: bar.getAttribute('data-highlighted-seq') ?? '',
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

  // ========= E1: QC → Evidence exact sequence（独立 context） =========
  console.log('\n[E1] QC → Evidence exact sequence');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    await runScenario(page, '场景 B · 高风险待确认');
    await page.waitForTimeout(25000);
    await waitForFinished(page);
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    await page.locator('[data-testid="job-section-QC 结果"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // 从真实 QC DOM 读取 expected（非写死）
    const qcExpected = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="job-qc-qc-structure-risk"]');
      return {
        sourceSequence: el?.getAttribute('data-qc-source-sequence') ?? '',
        evidenceAsset: el?.getAttribute('data-qc-evidence-asset') ?? '',
        evidenceLayer: el?.getAttribute('data-qc-evidence-layer') ?? '',
        evidenceRegion: el?.getAttribute('data-qc-evidence-region') ?? '',
      };
    });
    assert(qcExpected.sourceSequence !== '', `QC DOM sourceSequence 非空 (got '${qcExpected.sourceSequence}')`);
    const expectedSequence = qcExpected.sourceSequence;
    const expectedAsset = qcExpected.evidenceAsset;
    const expectedLayer = qcExpected.evidenceLayer;
    const expectedRegion = qcExpected.evidenceRegion;
    console.log(`  expected from QC DOM: seq=${expectedSequence} asset=${expectedAsset} layer=${expectedLayer} region='${expectedRegion}'`);
    // 点击 QC（真实 UI）
    await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
    await page.waitForTimeout(1500);
    const inst = await readInst(page);
    // EXACT ASSERT（非 > 0）
    assert(inst.focusedAsset === expectedAsset, `actualAsset(${inst.focusedAsset}) === expectedAsset(${expectedAsset})`);
    assert(inst.focusedLayer === expectedLayer, `actualLayer(${inst.focusedLayer}) === expectedLayer(${expectedLayer})`);
    assert(inst.focusedRegion === expectedRegion, `actualRegion('${inst.focusedRegion}') === expectedRegion('${expectedRegion}')`);
    assert(Number(inst.highlightedSeq) === Number(expectedSequence), `actualTraceSequence(${inst.highlightedSeq}) === expectedTraceSequence(${expectedSequence})`);
    // proof 输出
    console.log(`  PROOF QC id: qc-structure-risk`);
    console.log(`  PROOF expectedAsset: ${expectedAsset} | actualAsset: ${inst.focusedAsset}`);
    console.log(`  PROOF expectedLayer: ${expectedLayer} | actualLayer: ${inst.focusedLayer}`);
    console.log(`  PROOF expectedRegion: '${expectedRegion}' | actualRegion: '${inst.focusedRegion}'`);
    console.log(`  PROOF expectedTraceSequence: ${expectedSequence} | actualTraceSequence: ${inst.highlightedSeq}`);
    console.log(`  PROOF expectedTraceSequence source: QC DOM data-qc-source-sequence（真实 Runtime，非写死）`);
    await snap(page, 'e1-qc-evidence-exact-sequence.png');
    await ctx.close();
  }

  // ========= E2: Browser Back 同一 Job Route（独立 context + 干净起点） =========
  console.log('\n[E2] Browser Back same-job route');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const page = await ctx.newPage();
    // 干净起点：从 normal Analysis route 进入（初始 goto 允许用于建立测试起点）
    const analysisPath = '/products/ow-a31-blk/competitor-analysis/job-normal-001';
    await page.goto(URL + analysisPath, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    // 启动 normal scenario
    await runScenario(page, '场景 A · 正常完成');
    await page.waitForTimeout(4000);
    const beforeNav = await readInst(page);
    const analysisPathBefore = beforeNav.pathname;
    // route :runId 段（权威来源：Router URL path 最后一段）
    const routeSegments = analysisPathBefore.split('/');
    const analysisRouteIdBefore = routeSegments[routeSegments.length - 1];
    console.log(`  analysisPathBefore: ${analysisPathBefore}`);
    console.log(`  analysisRouteIdBefore: ${analysisRouteIdBefore}`);
    console.log(`  activeJobIdBefore: ${beforeNav.jobId}`);
    // 关键：route identity 必须与 active Job 一致（job-normal-001）
    assert(analysisRouteIdBefore === beforeNav.jobId, `route identity(${analysisRouteIdBefore}) === active jobId(${beforeNav.jobId})`);
    // 进 Job Detail（真实 UI 点击）
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const onJob = await readInst(page);
    console.log(`  jobDetailPath: ${onJob.pathname}`);
    console.log(`  jobIdOnJobPage: ${onJob.jobId}`);
    console.log(`  receivedCountOnJobPage: ${onJob.receivedCount}`);
    // 真实浏览器 Back（page.goBack，非 navigate helper）
    await page.goBack();
    await page.waitForTimeout(1500);
    const afterBack = await readInst(page);
    const analysisPathAfter = afterBack.pathname;
    const routeSegmentsAfter = analysisPathAfter.split('/');
    const analysisRouteIdAfter = routeSegmentsAfter[routeSegmentsAfter.length - 1];
    // EXACT ASSERT
    assert(analysisPathAfter === analysisPathBefore, `pathnameAfterBack(${analysisPathAfter}) === pathnameBefore(${analysisPathBefore})`);
    assert(analysisRouteIdAfter === analysisRouteIdBefore, `routeIdAfter(${analysisRouteIdAfter}) === routeIdBefore(${analysisRouteIdBefore})`);
    assert(afterBack.jobId === onJob.jobId, `jobIdAfter(${afterBack.jobId}) === jobIdOnJob(${onJob.jobId})`);
    assert(afterBack.simulatorIdentity === onJob.simulatorIdentity, `identityAfter === identityOnJob`);
    assert(afterBack.receivedCount >= onJob.receivedCount, `receivedAfter(${afterBack.receivedCount}) >= receivedOnJob(${onJob.receivedCount})`);
    assert(afterBack.jobStatus !== 'idle' && afterBack.jobStatus !== '', `jobStatusAfter(${afterBack.jobStatus}) 非 idle/空`);
    // 关键：不得出现 route=job-risk-002 + state=job-normal-001 语义冲突
    assert(!(analysisRouteIdAfter !== afterBack.jobId), `无语义冲突：route(${analysisRouteIdAfter}) === jobId(${afterBack.jobId})`);
    // proof 输出
    console.log(`  PROOF analysisPathBeforeNavigation: ${analysisPathBefore}`);
    console.log(`  PROOF analysisPathAfterBack: ${analysisPathAfter}`);
    console.log(`  PROOF analysisRouteIdBefore: ${analysisRouteIdBefore}`);
    console.log(`  PROOF analysisRouteIdAfter: ${analysisRouteIdAfter}`);
    console.log(`  PROOF activeJobIdBefore: ${beforeNav.jobId}`);
    console.log(`  PROOF activeJobIdOnJobPage: ${onJob.jobId}`);
    console.log(`  PROOF activeJobIdAfterBack: ${afterBack.jobId}`);
    console.log(`  PROOF receivedBeforeNav: ${beforeNav.receivedCount}`);
    console.log(`  PROOF receivedOnJobPage: ${onJob.receivedCount}`);
    console.log(`  PROOF receivedAfterBack: ${afterBack.receivedCount}`);
    console.log(`  PROOF simulatorIdentityBefore: ${beforeNav.simulatorIdentity.slice(0, 8)}`);
    console.log(`  PROOF simulatorIdentityOnJob: ${onJob.simulatorIdentity.slice(0, 8)}`);
    console.log(`  PROOF simulatorIdentityAfter: ${afterBack.simulatorIdentity.slice(0, 8)}`);
    console.log(`  PROOF jobStatusOnJobPage: ${onJob.jobStatus}`);
    console.log(`  PROOF jobStatusAfterBack: ${afterBack.jobStatus}`);
    await snap(page, 'e2-browser-back-same-job.png');
    await ctx.close();
  }

  await browser.close();

  // interaction-report
  const report = `# G2-F3 R4 Evidence Closure 交互验证报告

生成时间：${new Date().toISOString()}
浏览器：Playwright Chromium ${bv}

## E1 QC → Evidence exact sequence
- expected 从真实 QC DOM data-qc-source-sequence 读取（非写死 61）
- actualTraceSequence === expectedTraceSequence（exact）
- actualAsset === expectedAsset / actualLayer === expectedLayer / actualRegion === expectedRegion

## E2 Browser Back same-job route
- 独立 context + 干净 normal Analysis 起点（goto 建立）
- page.goBack() 后 pathname exact 恢复
- route identity === active jobId（无 job-risk-002 vs job-normal-001 冲突）
- receivedCount 不减 / identity 保持 / jobStatus 非idle
`;
  await writeFile(path.join(OUT, 'interaction-report.md'), report);

  // manifest
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    captureRules: 'E1/E2 独立 context；expected 从真实 QC DOM 读取；Browser Back 用 page.goBack；初始 goto 仅建立测试起点',
    screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：${screenshots.length} 张截图 + report + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
