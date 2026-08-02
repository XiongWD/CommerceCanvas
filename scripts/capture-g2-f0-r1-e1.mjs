#!/usr/bin/env node
/**
 * G2-F0 R1-E1 独立截图脚本（脱离 ZCode IAB）。
 *
 * 使用 Playwright 独立 Chromium（非 IAB），为每个 viewport 创建全新
 * BrowserContext，避免异常 Surface 平移复制。
 *
 * 截图目标：npm run preview 起的 http://127.0.0.1:4175/
 * 输出：artifacts/frontend/g2-f0-r1-e1/
 *
 * 运行前确保：npm run build && npm run preview --port 4175 --host 127.0.0.1
 *
 * 依赖：全局已安装的 playwright（@executeautomation/playwright-mcp-server），
 * 不修改 frontend/package.json。
 */

// 复用全局 playwright-core（不向业务工程加依赖）。Windows ESM 需 file:// URL + 显式入口。
// CJS 包经 ESM 动态导入时，具名导出在 default 下。
import { pathToFileURL } from 'node:url';
const PW_PATH =
  'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;

import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4175/';
const OUT_DIR = 'artifacts/frontend/g2-f0-r1-e1';

const VIEWPORTS = [
  { name: 'full-1440x900', width: 1440, height: 900 },
  { name: 'full-1280x800', width: 1280, height: 800 },
];

async function sha256OfFile(file) {
  const { readFile } = await import('node:fs/promises');
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function captureViewport(browser, vw, vh, outDir) {
  // 每个 viewport 一个全新 BrowserContext
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  // 等待主图 SVG 加载完成
  await page.waitForSelector('img[alt^="演示素材"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  const manifest = { viewport: [vw, vh], screenshots: [] };

  // 全页截图（视口尺寸）
  const fullFile = path.join(outDir, `${vw}x${vh}` === '1440x900' ? 'full-1440x900.png' : 'full-1280x800.png');
  await page.screenshot({ path: fullFile, fullPage: false, animations: 'disabled' });
  const fullPx = await readPngDims(fullFile);
  manifest.screenshots.push({
    file: path.basename(fullFile),
    kind: 'full',
    actualPixels: [fullPx.w, fullPx.h],
  });

  // 仅在 1440 视口采集局部截图（用 Locator，稳定 testid）
  if (vw === 1440) {
    const canvasFile = path.join(outDir, 'region-canvas.png');
    await page.locator('[data-testid="analysis-canvas"]').screenshot({ path: canvasFile, animations: 'disabled' });
    manifest.screenshots.push({ file: 'region-canvas.png', kind: 'region' });

    const inspFile = path.join(outDir, 'region-inspector.png');
    await page.locator('[data-testid="inspector-panel"]').screenshot({ path: inspFile, animations: 'disabled' });
    manifest.screenshots.push({ file: 'region-inspector.png', kind: 'region' });

    const taskFile = path.join(outDir, 'region-taskbar.png');
    await page.locator('[data-testid="persistent-task-bar"]').screenshot({ path: taskFile, animations: 'disabled' });
    manifest.screenshots.push({ file: 'region-taskbar.png', kind: 'region' });
  }

  await context.close();
  return manifest;
}

async function readPngDims(file) {
  const { readFile } = await import('node:fs/promises');
  const buf = await readFile(file);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { w, h };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // 独立 Chromium（Playwright 自带，非 IAB）
  const browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  console.log(`浏览器: Playwright Chromium ${browserVersion}`);
  console.log(`executablePath: ${chromium.executablePath()}`);
  console.log(`目标 URL: ${URL}\n`);

  const allShots = [];
  for (const vp of VIEWPORTS) {
    console.log(`采集 ${vp.name} (${vp.width}x${vp.height})...`);
    const m = await captureViewport(browser, vp.width, vp.height, OUT_DIR);
    for (const s of m.screenshots) {
      const file = path.join(OUT_DIR, s.file);
      s.sha256 = await sha256OfFile(file);
      s.viewport = [vp.width, vp.height];
      allShots.push(s);
      console.log(`  -> ${s.file} ${s.actualPixels ? s.actualPixels.join('x') : ''} sha=${s.sha256.slice(0, 12)}…`);
    }
  }
  await browser.close();

  // 写 manifest
  const { execSync } = await import('node:child_process');
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse HEAD').toString().trim();
  } catch {}
  const manifest = {
    commit,
    browser: 'Playwright Chromium (独立，非 ZCode IAB)',
    browserVersion,
    captureTool: 'Playwright',
    deviceScaleFactor: 1,
    pageZoom: 1,
    url: URL,
    screenshots: allShots,
  };
  await writeFile(path.join(OUT_DIR, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest 已写入 ${OUT_DIR}/screenshot-manifest.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
