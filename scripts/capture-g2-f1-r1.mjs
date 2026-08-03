/**
 * G2-F1 截图 + WebM 录像脚本（独立 Playwright Chromium，非 IAB）。
 *
 * 输出 8 张截图 + 1 段 webm + manifest：
 *   idle / running-analysis / evidence-focus / risk-review / task-panel-expanded
 *   disconnected / recovered / completed
 *
 * 录像：以 2× 速度运行 normal 场景，展示轨迹流入/Evidence/里程碑/任务栏/风险/点击定位。
 * 使用 Locator + data-testid 定位，每个 viewport 全新 BrowserContext。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH =
  'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;

const URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4175/';
const OUT = 'artifacts/frontend/g2-f1-r1';

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

/** 等待直到页面 trace 出现指定数量的轨迹条目（轮询 DOM） */
async function waitForTraceCount(page, minCount, timeoutMs = 15000) {
  await page.waitForFunction(
    (n) => {
      const items = document.querySelectorAll('[data-testid="analysis-canvas"] ~ aside ol li, aside ol li');
      return items.length >= n;
    },
    minCount,
    { timeout: timeoutMs },
  );
}

async function clickScenario(page, scenarioLabel) {
  await page.getByRole('button', { name: scenarioLabel }).click();
}

async function clickStart(page) {
  await page.getByRole('button', { name: '开始演示分析' }).click();
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
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });
  await page.waitForTimeout(1200);

  const shots = [];

  // 1. idle（初始）
  await page.screenshot({ path: path.join(OUT, 'idle.png'), animations: 'disabled' });
  shots.push({ file: 'idle.png', kind: 'idle' });

  // 启动 normal 场景，2× 速度
  await clickScenario(page, '场景 A · 正常完成');
  await page.getByRole('button', { name: '2×' }).click();
  await clickStart(page);

  // 2. running：等到轨迹有几条 + 有阶段在跑
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, 'running.png'), animations: 'disabled' });
  shots.push({ file: 'running.png', kind: 'running' });

  // 等到出现 evidence 类轨迹（点击定位证据）
  await page.waitForFunction(
    () => Array.from(document.querySelectorAll('li')).some((li) => li.textContent?.includes('点击定位证据')),
    { timeout: 20000 },
  );
  // 3. evidence-focus：点击第一条「点击定位证据」
  const evBtn = page.locator('li', { hasText: '点击定位证据' }).first();
  await evBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'evidence-focus.png'), animations: 'disabled' });
  shots.push({ file: 'evidence-focus.png', kind: 'evidence-focus' });

  // 4. task-panel-expanded：展开任务详情（限定在底部任务栏内，避免与全局图标栏同名按钮冲突）
  await page.locator('[data-testid="persistent-task-bar"]').getByRole('button', { name: '任务详情' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'task-panel-expanded.png'), animations: 'disabled' });
  shots.push({ file: 'task-panel-expanded.png', kind: 'task-panel' });
  // 收起（ExpandedTaskPanel 头部的收起按钮）
  await page.locator('[data-testid="persistent-task-bar"]').getByRole('button', { name: '收起' }).first().click();
  await page.waitForTimeout(300);

  // 等待 normal 完成
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成') ?? false,
    { timeout: 30000 },
  );
  await page.waitForTimeout(800);
  // 8. completed
  await page.screenshot({ path: path.join(OUT, 'completed.png'), animations: 'disabled' });
  shots.push({ file: 'completed.png', kind: 'completed' });

  // 5. risk-review：切换到风险场景，运行到完成
  await clickScenario(page, '场景 B · 高风险待确认');
  await page.getByRole('button', { name: '2×' }).click();
  await clickStart(page);
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('等待人工确认') ?? false,
    { timeout: 40000 },
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'risk-review.png'), animations: 'disabled' });
  shots.push({ file: 'risk-review.png', kind: 'risk' });

  // 6/7. disconnected/recovered：切换到 reconnect 场景
  await clickScenario(page, '场景 C · 断线恢复');
  await page.getByRole('button', { name: '2×' }).click();
  await clickStart(page);
  // 等到出现「连接中断」
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('中断') ?? false,
    { timeout: 30000 },
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'disconnected.png'), animations: 'disabled' });
  shots.push({ file: 'disconnected.png', kind: 'disconnected' });
  // 等到恢复
  await page.waitForFunction(
    () => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('恢复') ?? false,
    { timeout: 30000 },
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'recovered-4-events.png'), animations: 'disabled' });
  shots.push({ file: 'recovered-4-events.png', kind: 'recovered' });

  // 关闭以结束录像
  await context.close();
  await browser.close();

  return { browserVersion, shots };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { browserVersion, shots } = await captureViewport(1440, 900);

  // 录像：Playwright 把 webm 写到 OUT 下的随机名文件，重命名为标准名
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(OUT);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (webm) {
    await copyFile(path.join(OUT, webm), path.join(OUT, 'live-intelligence-demo.webm'));
    // 删除原始随机名
    const { unlink } = await import('node:fs/promises');
    await unlink(path.join(OUT, webm));
  }

  // manifest
  let commit = 'unknown';
  try { commit = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  const manifest = {
    commit,
    browser: 'Playwright Chromium (独立，非 ZCode IAB)',
    browserVersion,
    captureTool: 'Playwright',
    deviceScaleFactor: 1,
    pageZoom: 1,
    url: URL,
    screenshots: await Promise.all(
      shots.map(async (s) => ({
        ...s,
        sha256: await sha256(path.join(OUT, s.file)),
      })),
    ),
    video: { file: 'live-intelligence-demo.webm' },
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest 已写入。截图 ${shots.length} 张 + webm。`);
}

main().catch((e) => { console.error(e); process.exit(1); });
