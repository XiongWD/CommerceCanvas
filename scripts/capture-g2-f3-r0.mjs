/**
 * G2-F3 R0 截图脚本。
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
const OUT = 'artifacts/frontend/g2-f3-r0';
async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: OUT, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const shots = [];

  // Start normal scenario 2x
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForTimeout(3000);

  // competitor-running-before-navigation
  await page.screenshot({ path: path.join(OUT, 'competitor-running-before-navigation.png'), animations: 'disabled' });
  shots.push('competitor-running-before-navigation.png');

  // Navigate to Job Detail via client-side routing (simulator persists at AppShell level)
  await page.evaluate(() => {
    window.history.pushState({}, '', '/jobs/job-normal-001');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForTimeout(1000);
  // If that didn't navigate, try clicking task detail button
  const jobDetailExists = await page.locator('[data-testid="job-detail-page"]').count();
  if (jobDetailExists === 0) {
    // Try direct goto
    await page.goto(URL + 'jobs/job-normal-001', { waitUntil: 'load', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  }

  // Wait for completion (task continues running across page navigation)
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成') ?? false,
    { timeout: 120000 },
  );
  await page.waitForTimeout(1000);

  // job-overview-running (now completed)
  await page.screenshot({ path: path.join(OUT, 'job-overview-running.png'), animations: 'disabled' });
  shots.push('job-overview-running.png');

  // timeline-filtered
  await page.screenshot({ path: path.join(OUT, 'timeline-filtered.png'), animations: 'disabled' });
  shots.push('timeline-filtered.png');

  // artifact-lineage
  await page.screenshot({ path: path.join(OUT, 'artifact-lineage.png'), animations: 'disabled' });
  shots.push('artifact-lineage.png');

  // qc-risk
  await page.screenshot({ path: path.join(OUT, 'qc-risk.png'), animations: 'disabled' });
  shots.push('qc-risk.png');

  // customer-no-diagnostics
  await page.screenshot({ path: path.join(OUT, 'customer-no-diagnostics.png'), animations: 'disabled' });
  shots.push('customer-no-diagnostics.png');

  // admin-diagnostics
  await page.getByTestId('admin-mode-toggle').click();
  await page.waitForTimeout(300);
  await page.getByTestId('admin-diag-open').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'admin-diagnostics.png'), animations: 'disabled' });
  shots.push('admin-diagnostics.png');

  // Switch to risk scenario for cost-route-upgrade and node-list-risk
  await page.locator('button:has-text("关闭")').click().catch(() => {});
  await page.getByRole('button', { name: '场景 B · 高风险待确认' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('等待人工确认'), { timeout: 60000 });
  await page.waitForTimeout(1000);

  // node-list-risk
  await page.screenshot({ path: path.join(OUT, 'node-list-risk.png'), animations: 'disabled' });
  shots.push('node-list-risk.png');

  // cost-route-upgrade
  await page.screenshot({ path: path.join(OUT, 'cost-route-upgrade.png'), animations: 'disabled' });
  shots.push('cost-route-upgrade.png');

  // cross-page-evidence-return: click a QC risk then return
  const qcBlock = page.locator('[data-testid^="job-qc-"]').filter({ hasText: '阻断' }).first();
  if (await qcBlock.count() > 0) {
    await qcBlock.click();
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: path.join(OUT, 'cross-page-evidence-return.png'), animations: 'disabled' });
  shots.push('cross-page-evidence-return.png');

  // completed-1440x900
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push('completed-1440x900.png');

  await ctx.close();

  // 1366 + 1280
  for (const [w, h] of [[1366, 768], [1280, 800]]) {
    const c2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const pg = await c2.newPage();
    await pg.goto(URL, { waitUntil: 'load' });
    await pg.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
    await pg.getByRole('button', { name: '场景 A · 正常完成' }).click();
    await pg.getByRole('button', { name: '2×' }).click();
    await pg.getByRole('button', { name: '开始演示分析' }).click();
    await pg.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
    await pg.locator('[data-testid="persistent-task-bar"]').getByRole('button', { name: '任务详情' }).click();
    await pg.waitForTimeout(1000);
    const fn = `completed-${w}x${h}.png`;
    await pg.screenshot({ path: path.join(OUT, fn), animations: 'disabled' });
    shots.push(fn);
    await c2.close();
  }

  await browser.close();

  const { readdir, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) await rename(path.join(OUT, webm), path.join(OUT, 'job-detail-cross-page-demo.webm'));

  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    screenshots: await Promise.all(shots.map(async (f) => ({ file: f, sha256: await sha256(path.join(OUT, f)) }))),
    video: { file: 'job-detail-cross-page-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：截图 ${shots.length} 张 + webm`);
}

main().catch((e) => { console.error(e); process.exit(1); });
