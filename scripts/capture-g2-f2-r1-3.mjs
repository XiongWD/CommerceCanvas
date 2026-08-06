/**
 * G2-F2 R1.3 截图脚本（严格 === 断言，低置信 exit 1 if missing）。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4175/';
const OUT = 'artifacts/frontend/g2-f2-r1-3';
async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  const shots = [];

  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();

  // running-exactly-4-of-12: 先切到 contact-sheet，再等 4 张
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="contact-thumb-"]').length >= 4, { timeout: 15000 });
  await page.waitForTimeout(300);
  // Wait until exactly 4 then screenshot (timing window)
  let n4 = await page.locator('[data-testid^="contact-thumb-"]').count();
  // Try to catch exactly 4
  for (let i = 0; i < 10 && n4 !== 4; i++) {
    await page.waitForTimeout(200);
    n4 = await page.locator('[data-testid^="contact-thumb-"]').count();
  }
  assert(n4 === 4, `running-exactly-4-of-12 (got ${n4})`);
  await page.screenshot({ path: path.join(OUT, 'running-exactly-4-of-12.png'), animations: 'disabled' });
  shots.push('running-exactly-4-of-12.png');

  // clusters-exactly-2-of-4
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="cluster-cluster-"]').length >= 2, { timeout: 30000 });
  let nc = await page.locator('[data-testid^="cluster-cluster-"]').count();
  for (let i = 0; i < 10 && nc !== 2; i++) { await page.waitForTimeout(200); nc = await page.locator('[data-testid^="cluster-cluster-"]').count(); }
  assert(nc === 2, `clusters-exactly-2-of-4 (got ${nc})`);
  await page.screenshot({ path: path.join(OUT, 'clusters-exactly-2-of-4.png'), animations: 'disabled' });
  shots.push('clusters-exactly-2-of-4.png');

  // selling-points-exactly-3-of-6
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="selling-point-sp-"]').length >= 3, { timeout: 30000 });
  let ns = await page.locator('[data-testid^="selling-point-sp-"]').count();
  for (let i = 0; i < 10 && ns !== 3; i++) { await page.waitForTimeout(200); ns = await page.locator('[data-testid^="selling-point-sp-"]').count(); }
  assert(ns === 3, `selling-points-exactly-3-of-6 (got ${ns})`);
  await page.screenshot({ path: path.join(OUT, 'selling-points-exactly-3-of-6.png'), animations: 'disabled' });
  shots.push('selling-points-exactly-3-of-6.png');

  // Complete
  await page.getByTestId('view-mode-single').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.waitForTimeout(800);

  // cluster-a-detail: 点击 cluster-a → 断言 detail mode
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(500);
  await page.locator('[data-testid="cluster-cluster-a"]').click();
  await page.waitForTimeout(800);
  const detailCluster = await page.locator('[data-testid="cluster-view"]').getAttribute('data-selected-cluster-id');
  assert(detailCluster === 'cluster-a', `cluster-a detail mode (got ${detailCluster})`);
  const clusterAssets = await page.locator('[data-testid^="cluster-asset-"]').count();
  assert(clusterAssets > 0, `cluster detail shows assets (${clusterAssets})`);
  await page.screenshot({ path: path.join(OUT, 'cluster-a-detail.png'), animations: 'disabled' });
  shots.push('cluster-a-detail.png');

  // selling-point-comfort-detail
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(500);
  await page.locator('[data-testid="selling-point-sp-comfort"]').click();
  await page.waitForTimeout(800);
  const detailSP = await page.locator('[data-testid="selling-point-view"]').getAttribute('data-selected-selling-point-id');
  assert(detailSP === 'sp-comfort', `sp-comfort detail mode (got ${detailSP})`);
  const spAssets = await page.locator('[data-testid^="sp-asset-"]').count();
  assert(spAssets > 0, `sp detail shows assets (${spAssets})`);
  await page.screenshot({ path: path.join(OUT, 'selling-point-comfort-detail.png'), animations: 'disabled' });
  shots.push('selling-point-comfort-detail.png');

  // risk-evidence-trace-linked
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-risk-exclusion').click();
  await page.waitForTimeout(500);
  await page.locator('[data-testid="risk-item-risk-logo"]').click();
  await page.waitForTimeout(1000);
  const riskId = await page.locator('#root > div').getAttribute('data-selected-risk-item-id');
  assert(riskId === 'risk-logo', `risk-logo selected (got ${riskId})`);
  const traceSeq = await page.locator('#root > div').getAttribute('data-highlighted-trace-sequence');
  assert(Number(traceSeq) > 0, `trace highlighted (seq=${traceSeq})`);
  await page.screenshot({ path: path.join(OUT, 'risk-evidence-trace-linked.png'), animations: 'disabled' });
  shots.push('risk-evidence-trace-linked.png');

  // recipe-basis-trace-linked
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(500);
  await page.locator('[data-testid="recipe-basis-purpose"]').click();
  await page.waitForTimeout(500);
  const recipeField = await page.locator('#root > div').getAttribute('data-selected-recipe-field');
  assert(recipeField === 'purpose', `recipe purpose selected (got ${recipeField})`);
  const traceSeq2 = await page.locator('#root > div').getAttribute('data-highlighted-trace-sequence');
  assert(Number(traceSeq2) > 0, `recipe trace highlighted (seq=${traceSeq2})`);
  await page.screenshot({ path: path.join(OUT, 'recipe-basis-trace-linked.png'), animations: 'disabled' });
  shots.push('recipe-basis-trace-linked.png');

  // low-confidence-expanded: 选低置信资产（img-11 低置信 76%），展开依据
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-current-image').click();
  await page.waitForTimeout(300);
  // Select img-11 which has low confidence
  await page.getByTestId('view-mode-single').click();
  await page.waitForTimeout(300);
  // Click the 11th thumbnail in the left sidebar
  const thumb11 = page.locator('button[aria-label*="11"]');
  if (await thumb11.count() > 0) {
    await thumb11.click();
    await page.waitForTimeout(500);
  }
  const lowConfCount = await page.locator('button:has-text("低置信")').count();
  assert(lowConfCount > 0, `低置信 exists in current-image (${lowConfCount})`);
  await page.locator('button:has-text("低置信")').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'low-confidence-expanded.png'), animations: 'disabled' });
  shots.push('low-confidence-expanded.png');

  // restarted-clean-state
  await page.getByRole('button', { name: '重新运行' }).first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, 'restarted-clean-state.png'), animations: 'disabled' });
  shots.push('restarted-clean-state.png');

  // completed-1440x900
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push('completed-1440x900.png');

  await ctx.close();
  await browser.close();

  const { readdir, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) await rename(path.join(OUT, webm), path.join(OUT, 'competitor-analysis-demo.webm'));

  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    screenshots: await Promise.all(shots.map(async (f) => ({ file: f, sha256: await sha256(path.join(OUT, f)) }))),
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：截图 ${shots.length} 张`);
}

main().catch((e) => { console.error(e); process.exit(1); });
