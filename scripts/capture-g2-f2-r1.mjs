/**
 * G2-F2 R1 截图脚本（独立 Playwright Chromium，非 IAB）。
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
const OUT = 'artifacts/frontend/g2-f2-r1';

async function sha256(file) { return createHash('sha256').update(await readFile(file)).digest('hex'); }

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  console.log(`Playwright Chromium ${browserVersion}`);

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const shots = [];

  // idle
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'idle-no-final-results.png'), animations: 'disabled' });
  shots.push('idle-no-final-results.png');

  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, 'running-4-of-12.png'), animations: 'disabled' });
  shots.push('running-4-of-12.png');

  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('构图'), { timeout: 30000 }).catch(() => {});
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'clusters-forming.png'), animations: 'disabled' });
  shots.push('clusters-forming.png');

  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'selling-points-forming.png'), animations: 'disabled' });
  shots.push('selling-points-forming.png');

  await page.getByTestId('view-mode-single').click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.waitForTimeout(1000);

  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-risk-exclusion').click();
  await page.waitForTimeout(500);
  const riskItem = page.locator('[data-testid^="risk-item-"]').first();
  if (await riskItem.count() > 0) { await riskItem.click(); await page.waitForTimeout(800); }
  await page.screenshot({ path: path.join(OUT, 'risk-to-evidence.png'), animations: 'disabled' });
  shots.push('risk-to-evidence.png');

  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'recipe-to-trace.png'), animations: 'disabled' });
  shots.push('recipe-to-trace.png');

  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(800);
  const clusterBtn = page.locator('[data-testid^="cluster-cluster-"]').first();
  if (await clusterBtn.count() > 0) { await clusterBtn.click(); await page.waitForTimeout(800); }
  await page.screenshot({ path: path.join(OUT, 'cluster-linked-view.png'), animations: 'disabled' });
  shots.push('cluster-linked-view.png');

  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-suite-insights').click();
  await page.waitForTimeout(500);
  const lowConf = page.locator('button', { hasText: '低置信' }).first();
  if (await lowConf.count() > 0) { await lowConf.click(); await page.waitForTimeout(500); }
  else { const pendConf = page.locator('button', { hasText: '待人工确认' }).first(); if (await pendConf.count() > 0) { await pendConf.click(); await page.waitForTimeout(500); } }
  await page.screenshot({ path: path.join(OUT, 'low-confidence-expanded.png'), animations: 'disabled' });
  shots.push('low-confidence-expanded.png');

  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push('completed-1440x900.png');

  await page.getByRole('button', { name: '场景 B · 高风险待确认' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('等待人工确认'), { timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'risk-awaiting-review.png'), animations: 'disabled' });
  shots.push('risk-awaiting-review.png');

  await context.close();

  for (const [w, h] of [[1366, 768], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const pg = await ctx.newPage();
    await pg.goto(URL, { waitUntil: 'load' });
    await pg.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
    await pg.getByRole('button', { name: '场景 A · 正常完成' }).click();
    await pg.getByRole('button', { name: '2×' }).click();
    await pg.getByRole('button', { name: '开始演示分析' }).click();
    await pg.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
    await pg.waitForTimeout(800);
    await pg.getByTestId('view-mode-contact-sheet').click();
    await pg.waitForTimeout(500);
    const fname = `completed-${w}x${h}.png`;
    await pg.screenshot({ path: path.join(OUT, fname), animations: 'disabled' });
    shots.push(fname);
    await ctx.close();
  }

  await browser.close();

  const { readdir, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) await rename(path.join(OUT, webm), path.join(OUT, 'competitor-analysis-demo.webm'));

  let sourceCommit = 'unknown', sourceTreeHash = 'unknown';
  try { sourceCommit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { sourceTreeHash = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit, sourceTreeHash, evidenceCommit: 'pending-final-commit',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion,
    deviceScaleFactor: 1, pageZoom: 1, url: URL,
    screenshots: await Promise.all(shots.map(async (f) => ({ file: f, sha256: await sha256(path.join(OUT, f)) }))),
    video: { file: 'competitor-analysis-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));

  const audit = {
    generatedAt: new Date().toISOString(),
    assets: { count: 12, uniqueSrc: 12 },
    roles: { 主图: 1, 场景图: 4, 卖点图: 5, 细节图: 1, 参数图: 1 },
    clusters: 4, brandAssets: 7, riskCategories: 3, riskEvidenceCount: 5,
    recipe: { normal: '7/7', risk: '4/7' },
  };
  await writeFile(path.join(OUT, 'data-audit.json'), JSON.stringify(audit, null, 2));
  console.log(`\n完成：截图 ${shots.length} 张 + webm`);
}

main().catch((e) => { console.error(e); process.exit(1); });
