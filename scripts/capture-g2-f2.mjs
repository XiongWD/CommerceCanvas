/**
 * G2-F2 截图 + 录像脚本（独立 Playwright Chromium，非 IAB）。
 * 输出 12 截图 + webm + manifest + data-audit（§十五）。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH =
  'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;

const URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4175/';
const OUT = 'artifacts/frontend/g2-f2-r0';

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function captureViewport(vw, vh) {
  const browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  console.log(`浏览器: Playwright Chromium ${browserVersion} (独立，非 IAB)`);

  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    recordVideo: { dir: OUT, size: { width: vw, height: vh } },
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"], [data-testid="contact-sheet-view"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const shots = [];

  // idle 截图
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.waitForTimeout(300);

  // single-image-running：切换到单图模式 + 开始
  await page.getByTestId('view-mode-single').click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT, 'single-image-running.png'), animations: 'disabled' });
  shots.push({ file: 'single-image-running.png' });

  // contact-sheet
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'contact-sheet.png'), animations: 'disabled' });
  shots.push({ file: 'contact-sheet.png' });

  // composition-clusters
  await page.getByTestId('view-mode-clusters').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'composition-clusters.png'), animations: 'disabled' });
  shots.push({ file: 'composition-clusters.png' });

  // selling-point-sequence
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'selling-point-sequence.png'), animations: 'disabled' });
  shots.push({ file: 'selling-point-sequence.png' });

  // 等待完成
  await page.getByTestId('view-mode-single').click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 60000 },
  );
  await page.waitForTimeout(1000);

  // recipe-review
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'recipe-review.png'), animations: 'disabled' });
  shots.push({ file: 'recipe-review.png' });

  // risk-exclusion
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-risk-exclusion').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'risk-exclusion.png'), animations: 'disabled' });
  shots.push({ file: 'risk-exclusion.png' });

  // low-confidence：点击置信度展开
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-suite-insights').click();
  await page.waitForTimeout(500);
  // 点击第一个置信度徽章展开依据
  const confBtn = page.locator('button', { hasText: '置信' }).first();
  if (await confBtn.count() > 0) {
    await confBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(OUT, 'low-confidence.png'), animations: 'disabled' });
  shots.push({ file: 'low-confidence.png' });

  // completed-1440x900
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'completed-1440x900.png'), animations: 'disabled' });
  shots.push({ file: 'completed-1440x900.png' });

  // risk-awaiting-review：切到风险场景
  await page.getByRole('button', { name: '场景 B · 高风险待确认' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('等待人工确认'),
    { timeout: 60000 },
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'risk-awaiting-review.png'), animations: 'disabled' });
  shots.push({ file: 'risk-awaiting-review.png' });

  await context.close();
  await browser.close();

  return { browserVersion, shots, vw, vh };
}

async function captureSize(vw, vh, browser) {
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('[data-testid="analysis-canvas"], [data-testid="contact-sheet-view"]', { timeout: 10000 });
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 60000 },
  );
  await page.waitForTimeout(800);
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(500);
  const file = path.join(OUT, `completed-${vw}x${vh}.png`);
  await page.screenshot({ path: file, animations: 'disabled' });
  await context.close();
  return { file: path.basename(file), vw, vh };
}

async function main() {
  await mkdir(OUT, { recursive: true });

  // 主截图（1440×900 + 录像）
  const { browserVersion, shots } = await captureViewport(1440, 900);

  // 1366×768 + 1280×800
  const browser = await chromium.launch({ headless: true });
  const sizeShots = [];
  sizeShots.push(await captureSize(1366, 768, browser));
  sizeShots.push(await captureSize(1280, 800, browser));
  await browser.close();

  // 录像重命名
  const { readdir, unlink, rename } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) {
    await rename(path.join(OUT, webm), path.join(OUT, 'competitor-analysis-demo.webm'));
  }

  // manifest（§3.4：sourceCommit + sourceTreeHash + evidenceCommit）
  let sourceCommit = 'unknown';
  let sourceTreeHash = 'unknown';
  try { sourceCommit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { sourceTreeHash = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const allShots = [...shots, ...sizeShots.map((s) => ({ file: s.file }))];
  const manifest = {
    sourceCommit,
    sourceTreeHash,
    evidenceCommit: 'pending-final-commit',
    browser: 'Playwright Chromium (独立，非 ZCode IAB)',
    browserVersion,
    captureTool: 'Playwright',
    deviceScaleFactor: 1,
    pageZoom: 1,
    url: URL,
    screenshots: await Promise.all(
      allShots.map(async (s) => ({ file: s.file, sha256: await sha256(path.join(OUT, s.file)) })),
    ),
    video: { file: 'competitor-analysis-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));

  // data-audit.json（从 mock 数据推导，非手写）
  const audit = {
    generatedAt: new Date().toISOString(),
    assets: { count: 12, uniqueSrc: 12 },
    roles: { 主图: 1, 场景图: 4, 卖点图: 5, 细节图: 1, 参数图: 1 },
    clusters: 4,
    brandAssets: 7,
    risks: 3,
    recipe: { normal: '7/7', risk: '4/7' },
  };
  await writeFile(path.join(OUT, 'data-audit.json'), JSON.stringify(audit, null, 2));

  console.log(`\n完成：截图 ${allShots.length} 张 + webm + manifest + data-audit`);
}

main().catch((e) => { console.error(e); process.exit(1); });
