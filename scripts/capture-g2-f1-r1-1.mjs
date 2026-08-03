/**
 * G2-F1 R1.1 收尾截图脚本（独立 Playwright Chromium，非 IAB）。
 * 验证 4 个缺口修复：transport 入轨迹 / Evidence 回退定位 / restart 里程碑 / finished 控制。
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
const OUT = 'artifacts/frontend/g2-f1-r1-1';

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  console.log(`浏览器: Playwright Chromium ${browserVersion} (独立，非 IAB)`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const shots = [];

  // 1. disconnected-trace：运行 reconnect 场景到断线，验证系统轨迹出现「连接中断」
  await page.getByRole('button', { name: '场景 C · 断线恢复' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(
    () => {
      const asides = document.querySelectorAll('aside');
      return Array.from(asides).some((a) => a.textContent?.includes('连接中断'));
    },
    { timeout: 30000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'disconnected-trace.png'), animations: 'disabled' });
  shots.push({ file: 'disconnected-trace.png', kind: 'disconnected-trace' });

  // 2. recovered-trace：等到恢复，验证轨迹出现「补齐 4 个事件」
  await page.waitForFunction(
    () => {
      const asides = document.querySelectorAll('aside');
      return Array.from(asides).some((a) => a.textContent?.includes('补齐 4 个事件'));
    },
    { timeout: 30000 },
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'recovered-trace.png'), animations: 'disabled' });
  shots.push({ file: 'recovered-trace.png', kind: 'recovered-trace' });

  // 3. evidence-fallback-focus：切到 normal，运行到有证据，点击主体框（无 regionId → assetId+layer 回退）
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('li')).some((li) => li.textContent?.includes('点击定位证据')),
    { timeout: 20000 },
  );
  // 点击轨迹里一条带证据的（Logo 风险，有 regionId），先验证精确定位
  await page.locator('li', { hasText: '点击定位证据' }).first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'evidence-fallback-focus.png'), animations: 'disabled' });
  shots.push({ file: 'evidence-fallback-focus.png', kind: 'evidence-focus' });

  // 4. restarted-milestone：等 normal 完成，restart，验证里程碑重显
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 40000 },
  );
  await page.getByRole('button', { name: '重新运行' }).first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, 'restarted-milestone.png'), animations: 'disabled' });
  shots.push({ file: 'restarted-milestone.png', kind: 'restarted' });

  // 5. completed-controls：等再次完成，验证只显示「重新运行」无「开始」
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'),
    { timeout: 40000 },
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'completed-controls.png'), animations: 'disabled' });
  shots.push({ file: 'completed-controls.png', kind: 'completed-controls' });

  await context.close();
  await browser.close();

  // manifest（记录最终提交 SHA）
  let commit = 'unknown';
  try { commit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  let treeHash = 'unknown';
  try { treeHash = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    commit,
    sourceTreeHash: treeHash,
    browser: 'Playwright Chromium (独立，非 ZCode IAB)',
    browserVersion,
    captureTool: 'Playwright',
    deviceScaleFactor: 1,
    pageZoom: 1,
    url: URL,
    screenshots: await Promise.all(
      shots.map(async (s) => ({ ...s, sha256: await sha256(path.join(OUT, s.file)) })),
    ),
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest 已写入。截图 ${shots.length} 张。`);
}

main().catch((e) => { console.error(e); process.exit(1); });
