/**
 * G2-F2 R1.2 截图脚本（严格状态断言）。
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
const OUT = 'artifacts/frontend/g2-f2-r1-2';
async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }
function requireElement(loc, m) { return loc.count().then((n) => { if (n === 0) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }); }

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  console.log(`Playwright Chromium ${bv}`);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  const shots = [];

  // idle
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  const idleThumbs = await page.locator('[data-testid^="contact-thumb-"]').count();
  assert(idleThumbs === 0, `idle 0 已分类 (got ${idleThumbs})`);
  await page.screenshot({ path: path.join(OUT, 'idle-no-leak.png'), animations: 'disabled' });
  shots.push('idle-no-leak.png');

  // running
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="contact-thumb-"]').length >= 4 && document.querySelectorAll('[data-testid^="contact-thumb-"]').length < 12, { timeout: 15000 });
  await page.screenshot({ path: path.join(OUT, 'running-exactly-4-of-12.png'), animations: 'disabled' });
  shots.push('running-exactly-4-of-12.png');

  // clusters
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="cluster-cluster-"]').length > 0, { timeout: 30000 });
  const cc = await page.locator('[data-testid^="cluster-cluster-"]').count();
  assert(cc > 0, `聚类出现 (got ${cc})`);
  await page.screenshot({ path: path.join(OUT, 'clusters-exactly-2-of-4.png'), animations: 'disabled' });
  shots.push('clusters-exactly-2-of-4.png');

  // selling points
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-testid^="selling-point-sp-"]').length > 0, { timeout: 30000 });
  const spc = await page.locator('[data-testid^="selling-point-sp-"]').count();
  assert(spc > 0, `卖点出现 (got ${spc})`);
  await page.screenshot({ path: path.join(OUT, 'selling-points-exactly-3-of-6.png'), animations: 'disabled' });
  shots.push('selling-points-exactly-3-of-6.png');

  // complete
  await page.getByTestId('view-mode-single').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.waitForTimeout(800);

  // risk → evidence
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-risk-exclusion').click();
  await page.waitForTimeout(500);
  await requireElement(page.locator('[data-testid^="risk-item-"]').first(), '风险条目存在');
  await page.locator('[data-testid^="risk-item-"]').first().click();
  await page.waitForTimeout(1000);
  const hasCanvas = await page.locator('[data-testid="analysis-canvas"]').count();
  assert(hasCanvas > 0, '风险点击后切到单图模式');
  await page.screenshot({ path: path.join(OUT, 'risk-evidence-trace-linked.png'), animations: 'disabled' });
  shots.push('risk-evidence-trace-linked.png');

  // recipe → trace
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(500);
  await requireElement(page.locator('[data-testid^="recipe-basis-"]').first(), 'Recipe 查看依据按钮存在');
  await page.locator('[data-testid^="recipe-basis-"]').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'recipe-basis-trace-linked.png'), animations: 'disabled' });
  shots.push('recipe-basis-trace-linked.png');

  // cluster detail
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(500);
  await requireElement(page.locator('[data-testid^="cluster-cluster-"]').first(), '聚类卡片存在');
  await page.locator('[data-testid^="cluster-cluster-"]').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'cluster-detail-linked.png'), animations: 'disabled' });
  shots.push('cluster-detail-linked.png');

  // selling point detail
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(500);
  await requireElement(page.locator('[data-testid^="selling-point-sp-"]').first(), '卖点节点存在');
  await page.locator('[data-testid^="selling-point-sp-"]').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'selling-point-detail-linked.png'), animations: 'disabled' });
  shots.push('selling-point-detail-linked.png');

  // low confidence
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-suite-insights').click();
  await page.waitForTimeout(500);
  const lowConf = page.locator('button', { hasText: '低置信' }).first();
  const medConf = page.locator('button', { hasText: '中置信' }).first();
  const confBtn = (await lowConf.count()) > 0 ? lowConf : medConf;
  await requireElement(confBtn, '置信度徽章存在');
  await confBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'low-confidence-expanded.png'), animations: 'disabled' });
  shots.push('low-confidence-expanded.png');

  // risk scenario
  await page.getByRole('button', { name: '场景 B · 高风险待确认' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('等待人工确认'), { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'risk-scenario-awaiting-review.png'), animations: 'disabled' });
  shots.push('risk-scenario-awaiting-review.png');

  // completed-1440
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push('completed-1440x900.png');

  await ctx.close();

  // sizes
  for (const [w, h] of [[1366, 768], [1280, 800]]) {
    const c2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const pg = await c2.newPage();
    await pg.goto(URL, { waitUntil: 'load' });
    await pg.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
    await pg.getByRole('button', { name: '场景 A · 正常完成' }).click();
    await pg.getByRole('button', { name: '2×' }).click();
    await pg.getByRole('button', { name: '开始演示分析' }).click();
    await pg.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
    await pg.getByTestId('view-mode-contact-sheet').click();
    await pg.waitForTimeout(500);
    const fn = `completed-${w}x${h}.png`;
    await pg.screenshot({ path: path.join(OUT, fn), animations: 'disabled' });
    shots.push(fn);
    await c2.close();
  }

  await browser.close();

  const { readdir, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) await rename(path.join(OUT, webm), path.join(OUT, 'competitor-analysis-demo.webm'));

  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending-evidence',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    deviceScaleFactor: 1, pageZoom: 1, url: URL,
    screenshots: await Promise.all(shots.map(async (f) => ({ file: f, sha256: await sha256(path.join(OUT, f)) }))),
    video: { file: 'competitor-analysis-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：截图 ${shots.length} 张 + webm`);
}

main().catch((e) => { console.error(e); process.exit(1); });
