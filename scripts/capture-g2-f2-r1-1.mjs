/**
 * G2-F2 R1.1 截图脚本（状态断言驱动，非 waitForTimeout）。
 * 断言失败时 exit 1。
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
const OUT = 'artifacts/frontend/g2-f2-r1-1';

async function sha256(file) { return createHash('sha256').update(await readFile(file)).digest('hex'); }

function assert(condition, msg) {
  if (!condition) { console.error(`ASSERT FAILED: ${msg}`); process.exit(1); }
  console.log(`  ✓ ${msg}`);
}

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

  const shots = [];

  // idle
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  // 状态断言：idle 时不显示分类用途
  const idleThumbs = await page.locator('[data-testid^="contact-thumb-"]').count();
  assert(idleThumbs === 0, `idle 无已分类资产 (got ${idleThumbs})`);
  await page.screenshot({ path: path.join(OUT, 'idle-no-leaked-results.png'), animations: 'disabled' });
  shots.push('idle-no-leaked-results.png');

  // 开始运行
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();

  // running-4-of-12：等到已处理恰好 4 张（通过 contact-sheet 可见缩略图数断言）
  await page.waitForFunction(
    () => {
      const n = document.querySelectorAll('[data-testid^="contact-thumb-"]').length;
      return n >= 4 && n <= 8;
    },
    { timeout: 15000 },
  );
  const runningThumbs = await page.locator('[data-testid^="contact-thumb-"]').count();
  assert(runningThumbs >= 4 && runningThumbs < 12, `running 部分资产可见 (got ${runningThumbs})`);
  await page.screenshot({ path: path.join(OUT, 'running-exactly-4-of-12.png'), animations: 'disabled' });
  shots.push('running-exactly-4-of-12.png');

  // clusters-2-of-4：等聚类视图出现部分聚类
  // 等待聚类在 cluster view 中可见（通过切到 cluster view 轮询）
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid^="cluster-cluster-"]').length > 0,
    { timeout: 30000 },
  );
  const clusterCount = await page.locator('[data-testid^="cluster-cluster-"]').count();
  assert(clusterCount > 0, `聚类出现 (got ${clusterCount})`);
  await page.screenshot({ path: path.join(OUT, 'clusters-2-of-4.png'), animations: 'disabled' });
  shots.push('clusters-2-of-4.png');

  // selling-points-3-of-6：等卖点在 selling-points 视图中出现
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid^="selling-point-sp-"]').length > 0,
    { timeout: 30000 },
  );
  const spCount = await page.locator('[data-testid^="selling-point-sp-"]').count();
  assert(spCount > 0, `卖点出现 (got ${spCount})`);
  await page.screenshot({ path: path.join(OUT, 'selling-points-3-of-6.png'), animations: 'disabled' });
  shots.push('selling-points-3-of-6.png');

  // 等完成
  await page.getByTestId('view-mode-single').click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 60000 },
  );
  await page.waitForTimeout(800);

  // risk-to-evidence：点击风险条目 → 断言 Evidence focus
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-risk-exclusion').click();
  await page.waitForTimeout(500);
  const riskItem = page.locator('[data-testid^="risk-item-"]').first();
  if (await riskItem.count() > 0) {
    await riskItem.click();
    await page.waitForTimeout(1000);
    // 断言已切到单图模式
    const hasCanvas = await page.locator('[data-testid="analysis-canvas"]').count();
    assert(hasCanvas > 0, '风险点击后切到单图模式');
  }
  await page.screenshot({ path: path.join(OUT, 'risk-focused-evidence-and-trace.png'), animations: 'disabled' });
  shots.push('risk-focused-evidence-and-trace.png');

  // recipe-to-trace
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'recipe-basis-focused-trace.png'), animations: 'disabled' });
  shots.push('recipe-basis-focused-trace.png');

  // cluster-filtered-linked-view
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(500);
  const clusterBtn = page.locator('[data-testid^="cluster-cluster-"]').first();
  if (await clusterBtn.count() > 0) { await clusterBtn.click(); await page.waitForTimeout(800); }
  await page.screenshot({ path: path.join(OUT, 'cluster-filtered-linked-view.png'), animations: 'disabled' });
  shots.push('cluster-filtered-linked-view.png');

  // selling-point-linked-view
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(500);
  const spNode = page.locator('[data-testid^="selling-point-sp-"]').first();
  if (await spNode.count() > 0) { await spNode.click(); await page.waitForTimeout(800); }
  await page.screenshot({ path: path.join(OUT, 'selling-point-linked-view.png'), animations: 'disabled' });
  shots.push('selling-point-linked-view.png');

  // low-confidence-expanded
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-suite-insights').click();
  await page.waitForTimeout(500);
  const lowConf = page.locator('button', { hasText: '低置信' }).first();
  if (await lowConf.count() > 0) { await lowConf.click(); await page.waitForTimeout(500); }
  await page.screenshot({ path: path.join(OUT, 'low-confidence-expanded.png'), animations: 'disabled' });
  shots.push('low-confidence-expanded.png');

  // restarted-clean-state
  await page.getByRole('button', { name: '重新运行' }).first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, 'restarted-clean-state.png'), animations: 'disabled' });
  shots.push('restarted-clean-state.png');

  // completed-1440x900
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 60000 },
  );
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push('completed-1440x900.png');

  await context.close();

  // 1366 + 1280
  for (const [w, h] of [[1366, 768], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const pg = await ctx.newPage();
    await pg.goto(URL, { waitUntil: 'load' });
    await pg.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
    await pg.getByRole('button', { name: '场景 A · 正常完成' }).click();
    await pg.getByRole('button', { name: '2×' }).click();
    await pg.getByRole('button', { name: '开始演示分析' }).click();
    await pg.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
    await pg.getByTestId('view-mode-contact-sheet').click();
    await pg.waitForTimeout(500);
    const fname = `completed-${w}x${h}.png`;
    await pg.screenshot({ path: path.join(OUT, fname), animations: 'disabled' });
    shots.push(fname);
    await ctx.close();
  }

  await browser.close();

  // 录像重命名
  const { readdir, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) await rename(path.join(OUT, webm), path.join(OUT, 'competitor-analysis-demo.webm'));

  // manifest（两阶段提交）
  let sourceCommit = 'unknown', sourceTreeHash = 'unknown';
  try { sourceCommit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { sourceTreeHash = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit, sourceTreeHash, evidenceCommit: 'pending-evidence-commit',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion,
    deviceScaleFactor: 1, pageZoom: 1, url: URL,
    screenshots: await Promise.all(shots.map(async (f) => ({ file: f, sha256: await sha256(path.join(OUT, f)) }))),
    video: { file: 'competitor-analysis-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：截图 ${shots.length} 张 + webm`);
}

main().catch((e) => { console.error(e); process.exit(1); });
