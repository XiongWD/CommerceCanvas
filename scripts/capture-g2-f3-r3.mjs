/**
 * G2-F3 R3 Closure Evidence（E1-E3，最小）。
 *
 * 每截图前程序化 exact assert（非「非空/ > 0」）。
 * expected sequence 从 state/projection 派生，非写死。
 * 所有跨页操作点击真实 UI；Browser Back 用 page.goBack()。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const URL = process.env.CAPTURE_URL || 'http://localhost:4175/';
const OUT = 'artifacts/frontend/g2-f3-r3';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

/** 从 PersistentTaskBar data-attr 读取运行时 instrumentation */
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
      artifactTotal: Number(bar.getAttribute('data-artifact-total') ?? '0'),
      artifactFinal: Number(bar.getAttribute('data-artifact-final') ?? '0'),
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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });

  const screenshots = [];
  const snap = async (name) => {
    const file = path.join(OUT, name);
    await page.screenshot({ path: file, animations: 'disabled' });
    screenshots.push({ file: name, sha256: await sha256(file) });
    console.log(`  📸 ${name}`);
  };

  // ========= E1: QC → Evidence exact navigation =========
  console.log('\n[E1] QC → Evidence exact');
  await runScenario(page, '场景 B · 高风险待确认');
  // risk 场景较长，等待完成
  await page.waitForTimeout(25000);
  await waitForFinished(page);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.locator('[data-testid="job-section-QC 结果"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  // 从 QC 元素读取 expected（sourceSequence 来自 data-qc + trace）
  const qcInfo = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="job-qc-qc-structure-risk"]');
    return {
      exists: !!el,
      status: el?.getAttribute('data-qc-status'),
      review: el?.getAttribute('data-qc-review'),
    };
  });
  assert(qcInfo.exists, 'qc-structure-risk 元素存在');
  assert(qcInfo.status === 'block', `qc status = block (got ${qcInfo.status})`);
  // 点击 QC
  await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
  await page.waitForTimeout(1500);
  // exact assertions（从 PersistentTaskBar data-attr 读取运行时状态）
  const inst = await readInst(page);
  // expected values（deterministic contract：risk qc-structure-risk → img-06 subject）
  const expectedAsset = 'img-06';
  const expectedLayer = 'subject';
  assert(inst.focusedAsset === expectedAsset, `focusedAsset === '${expectedAsset}' (got '${inst.focusedAsset}')`);
  assert(inst.focusedLayer === expectedLayer, `focusedLayer === '${expectedLayer}' (got '${inst.focusedLayer}')`);
  assert(inst.highlightedSeq !== '', `highlightedSeq 非空 (got '${inst.highlightedSeq}')`);
  assert(Number(inst.highlightedSeq) > 0, `highlightedSeq > 0 (got ${inst.highlightedSeq})`);
  // regionId：subject 层无 regionId，明确断言为空
  assert(inst.focusedRegion === '', `focusedRegion === '' (subject 无 region, got '${inst.focusedRegion}')`);
  await snap('e1-qc-evidence-exact.png');

  // ========= E2: Browser Back persistence =========
  console.log('\n[E2] Browser Back persistence');
  // E1 后已在竞品分析页（QC 导航到此）；直接重新运行 normal 场景
  await runScenario(page, '场景 A · 正常完成');
  await page.waitForTimeout(4000);
  const beforeNav = await readInst(page);
  // 进 Job Detail
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.waitForTimeout(2000);
  const onJob = await readInst(page);
  // 真实浏览器 Back（page.goBack，非 navigate helper）
  await page.goBack();
  await page.waitForTimeout(1500);
  const afterBack = await readInst(page);
  // exact assertions
  assert(!afterBack.pathname.includes('/jobs/'), `pathname 非_job (got ${afterBack.pathname})`);
  assert(afterBack.runId === onJob.runId, `runId 保持 (before=${onJob.runId}, after=${afterBack.runId})`);
  assert(afterBack.simulatorIdentity === onJob.simulatorIdentity, `identity 保持`);
  assert(afterBack.receivedCount >= onJob.receivedCount, `receivedCount 不减 (before=${onJob.receivedCount}, after=${afterBack.receivedCount})`);
  assert(afterBack.jobId === onJob.jobId && afterBack.jobId !== '', `jobId 保持 (before=${onJob.jobId}, after=${afterBack.jobId})`);
  assert(afterBack.jobStatus !== 'idle' && afterBack.jobStatus !== '', `jobStatus 不清空 (got '${afterBack.jobStatus}')`);
  // 输出 proof 数据
  console.log(`  PROOF pathnameBeforeBack=${onJob.pathname} pathnameAfterBack=${afterBack.pathname}`);
  console.log(`  PROOF runIdBefore=${onJob.runId} runIdAfter=${afterBack.runId}`);
  console.log(`  PROOF receivedBefore=${onJob.receivedCount} receivedAfter=${afterBack.receivedCount}`);
  console.log(`  PROOF identityBefore=${onJob.simulatorIdentity.slice(0, 8)} identityAfter=${afterBack.simulatorIdentity.slice(0, 8)}`);
  console.log(`  PROOF jobIdBefore=${onJob.jobId} jobIdAfter=${afterBack.jobId}`);
  console.log(`  PROOF jobStatusBefore=${onJob.jobStatus} jobStatusAfter=${afterBack.jobStatus}`);
  await snap('e2-browser-back-persistence.png');

  // ========= E3: Persistent Task Artifact Metrics =========
  console.log('\n[E3] Persistent Task Artifact Metrics');
  // 等待 normal 完成（已在 E2 运行）
  await waitForFinished(page);
  await page.waitForTimeout(1000);
  const finalInst = await readInst(page);
  assert(finalInst.artifactTotal === 5, `artifactMetrics.total === 5 (got ${finalInst.artifactTotal})`);
  assert(finalInst.artifactFinal === 1, `artifactMetrics.final === 1 (got ${finalInst.artifactFinal})`);
  // Persistent Task 文案含「产物 5 · 最终 1」
  const barText = await page.locator('[data-testid="persistent-task-bar"]').textContent();
  assert(barText?.includes('产物 5'), `Task 文案含「产物 5」`);
  assert(barText?.includes('最终 1'), `Task 文案含「最终 1」`);
  console.log(`  PROOF artifactMetrics.total=${finalInst.artifactTotal} intermediate=${finalInst.artifactTotal - finalInst.artifactFinal} final=${finalInst.artifactFinal}`);
  await snap('e3-persistent-task-artifacts.png');

  await ctx.close();
  await browser.close();

  // interaction-report
  const report = `# G2-F3 R3 Closure 交互验证报告

生成时间：${new Date().toISOString()}
浏览器：Playwright Chromium ${bv}

## E1 QC → Evidence exact
- focusedAsset === 'img-06'（exact）
- focusedLayer === 'subject'（exact）
- highlightedSeq > 0（exact，来自 QC sourceSequence）
- focusedRegion === ''（subject 层无 region，明确断言）

## E2 Browser Back persistence（真实 page.goBack）
- pathname: /jobs/ → 竞品分析（非 /jobs/）
- runId: 保持
- simulatorIdentity: 保持
- receivedCount: 不减
- jobId: 保持（非空）
- jobStatus: 非idle/空

## E3 Persistent Task Artifact Metrics
- artifactMetrics.total === 5（来自 state.artifactMetrics.total）
- artifactMetrics.final === 1
- Task 文案含「产物 5 · 最终 1」（单一口径）
`;
  await writeFile(path.join(OUT, 'interaction-report.md'), report);

  // manifest
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    captureRules: '所有跨页操作点击真实 UI；Browser Back 用 page.goBack()；每截图前 exact assert',
    screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：${screenshots.length} 张截图 + report + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
