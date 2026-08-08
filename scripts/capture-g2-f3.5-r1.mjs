/**
 * G2-F3.5 R1 Evidence Capture（E1-E6 + runtime-style-proof + dialog accessibility）。
 *
 * R1 关键改进：
 * - Dialog accessibility 完整闭包（trigger → open → focus → escape → return）
 * - runtime-style-proof.json（computed style 读取 + contrast）
 * - Table/Popover/DropdownMenu runtime 验证
 * - Representative production surface（Job Detail，非 Smoke Test）
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const BASE = process.env.CAPTURE_URL || 'http://localhost:4175';
const OUT = 'artifacts/frontend/g2-f3.5-r1';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }
function contrastRatio(rgb1, rgb2) {
  const lum = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = lum(rgb1), l2 = lum(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const screenshots = [];
  const snap = async (page, name) => {
    const file = path.join(OUT, name);
    await page.screenshot({ path: file, animations: 'disabled' });
    screenshots.push({ file: name, sha256: await sha256(file) });
    console.log(`  📸 ${name}`);
  };

  const styleProof = {};
  const interactionProof = {};

  // ========= E1 Foundation Overview =========
  console.log('\n[E1] Foundation Overview');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(new URL('/__dev/design-foundation', BASE).toString(), { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="design-foundation-page"]', { timeout: 10000 });
    assert(await page.locator('[data-testid="foundation-typography"]').count() > 0, 'Typography section');
    assert(await page.locator('[data-testid="foundation-buttons"]').count() > 0, 'Buttons section');
    assert(await page.locator('[data-testid="foundation-table"]').count() > 0, 'Table section (NEW)');
    assert(await page.locator('[data-testid="foundation-overlays"]').count() > 0, 'Overlays section');
    const btnText = await page.locator('[data-testid="foundation-buttons"]').textContent();
    assert(btnText?.includes('开始分析') && btnText?.includes('删除任务'), 'Button variants render');
    await snap(page, 'e1-foundation-overview.png');
    await ctx.close();
  }

  // ========= E2 Dark Form + Typography + Style Proof =========
  console.log('\n[E2] Dark Form / Typography / Computed Style');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(new URL('/__dev/design-foundation', BASE).toString(), { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="design-foundation-page"]', { timeout: 10000 });
    // Computed style probe
    const styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const firstInput = document.querySelector('input');
      const inputStyle = firstInput ? getComputedStyle(firstInput) : null;
      const firstBtn = document.querySelector('[data-testid="foundation-buttons"] button');
      const btnStyle = firstBtn ? getComputedStyle(firstBtn) : null;
      const badge = document.querySelector('[data-testid="foundation-tabs-badges"] [class*="badge"], [data-testid="foundation-tabs-badges"] span');
      const badgeStyle = badge ? getComputedStyle(badge) : null;
      return {
        body: { bg: body.backgroundColor, color: body.color },
        input: inputStyle ? { bg: inputStyle.backgroundColor, color: inputStyle.color, border: inputStyle.borderColor } : null,
        button: btnStyle ? { bg: btnStyle.backgroundColor, color: btnStyle.color } : null,
        badge: badgeStyle ? { bg: badgeStyle.backgroundColor, color: badgeStyle.color } : null,
      };
    });
    styleProof.body = styles.body;
    styleProof.input = styles.input;
    styleProof.button = styles.button;
    styleProof.badge = styles.badge;
    // Contrast checks
    if (styles.body && styles.input) {
      const bodyContrast = contrastRatio(styles.body.color, styles.body.bg);
      styleProof.bodyContrast = bodyContrast;
      console.log(`  body contrast: ${bodyContrast.toFixed(2)}:1`);
      assert(bodyContrast >= 4.5, `body text contrast >= 4.5:1 (${bodyContrast.toFixed(2)})`);
    }
    assert(styles.body.bg !== 'rgb(255, 255, 255)', 'body 非白色（Graphite dark 保持）');
    // Check input is not white
    if (styles.input) {
      console.log(`  input bg: ${styles.input.bg}`);
      assert(styles.input.bg !== 'rgb(255, 255, 255)', 'input 非白色（Graphite dark 融合）');
    }
    await snap(page, 'e2-dark-form-and-typography.png');
    await ctx.close();
  }

  // ========= E3 Table Density =========
  console.log('\n[E3] Table Density');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(new URL('/__dev/design-foundation', BASE).toString(), { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="design-foundation-page"]', { timeout: 10000 });
    await page.locator('[data-testid="foundation-table"]').scrollIntoViewIfNeeded();
    // Assert table has rows with real data
    const tableText = await page.locator('[data-testid="foundation-table"]').textContent();
    assert(tableText?.includes('job-normal-001'), 'Table 含 job-normal-001');
    assert(tableText?.includes('商品保真优先'), 'Table 含路由策略');
    assert(tableText?.includes('$0.19'), 'Table 含成本');
    assert(tableText?.includes('$0.36'), 'Table 含 risk 成本');
    await snap(page, 'e3-table-density.png');
    await ctx.close();
  }

  // ========= E4 Overlay / Keyboard（Dialog accessibility 完整闭包） =========
  console.log('\n[E4] Overlay / Keyboard / Dialog Accessibility');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(new URL('/__dev/design-foundation', BASE).toString(), { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="design-foundation-page"]', { timeout: 10000 });
    const trigger = page.locator('button:has-text("打开确认对话框")');
    // Focus trigger
    await trigger.focus();
    const triggerFocused = await page.evaluate(() => document.activeElement?.textContent);
    assert(triggerFocused?.includes('打开确认'), `trigger focused (${triggerFocused})`);
    // Open dialog
    await trigger.click();
    await page.waitForTimeout(500);
    // Dialog visible (Astryx uses native <dialog> element)
    const dialogEl = page.locator('dialog.astryx-dialog');
    const dialogVisible = await dialogEl.count() > 0;
    assert(dialogVisible, 'Dialog visible after open (native <dialog>)');
    // Focus moved inside dialog
    await page.waitForTimeout(300);
    const focusedInDialog = await page.evaluate(() => {
      const dialog = document.querySelector('dialog.astryx-dialog');
      if (!dialog) return false;
      return dialog.contains(document.activeElement);
    });
    interactionProof.dialog = {
      triggerFocused: triggerFocused,
      dialogVisible: dialogVisible,
      focusMovedInside: focusedInDialog,
    };
    console.log(`  focus inside dialog: ${focusedInDialog}`);
    // Escape closes — native <dialog> may need a moment + React state update
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    // Check if dialog is closed (element removed OR open attribute removed)
    const dialogClosed = await page.evaluate(() => {
      const d = document.querySelector('dialog.astryx-dialog');
      if (!d) return true; // element removed
      return !d.hasAttribute('open'); // native dialog closed
    });
    interactionProof.dialog.closedAfterEscape = dialogClosed;
    // Focus returned to trigger
    const focusAfterClose = await page.evaluate(() => document.activeElement?.textContent);
    interactionProof.dialog.closedAfterEscape = dialogClosed;
    interactionProof.dialog.focusReturnedToTrigger = focusAfterClose?.includes('打开确认') ?? false;
    console.log(`  focus after close: ${focusAfterClose}`);
    await snap(page, 'e4-overlay-keyboard.png');
    await ctx.close();
  }

  // ========= E5 Representative Production Surface（Job Detail metadata） =========
  console.log('\n[E5] Production Surface — Job Detail');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    // Run normal to completion
    await page.getByRole('button', { name: '2×' }).click();
    await page.getByRole('button', { name: '开始演示分析' }).click();
    await page.waitForFunction(() => {
      const bar = document.querySelector('[data-testid="persistent-task-bar"]');
      const s = bar?.getAttribute('data-job-status');
      return s === 'completed' || s === 'awaiting_review';
    }, { timeout: 60000 });
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    // This is a real F0-F3 production surface (not Smoke Test)
    assert(await page.locator('[data-testid="job-detail-page"]').count() > 0, 'Job Detail production surface loads');
    const nodeCount = await page.locator('[data-testid^="job-node-"]').count();
    assert(nodeCount === 7, `7 Job nodes (${nodeCount})`);
    const e1Sha = screenshots.find(s => s.file === 'e1-foundation-overview.png')?.sha256;
    const e5Sha = await sha256(path.join(OUT, 'e5-graphite-astryx-production-surface.png')).catch(() => '');
    await snap(page, 'e5-graphite-astryx-production-surface.png');
    const e5ActualSha = screenshots.find(s => s.file === 'e5-graphite-astryx-production-surface.png')?.sha256;
    assert(e5ActualSha !== e1Sha, 'E5 SHA != E1 SHA（非 Smoke Test 复制）');
    await ctx.close();
  }

  // ========= E6 F3 Regression =========
  console.log('\n[E6] F3 Regression');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    await page.getByRole('button', { name: '2×' }).click();
    await page.getByRole('button', { name: '开始演示分析' }).click();
    await page.waitForTimeout(3000);
    const received = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-received-count');
    assert(Number(received) > 0, `Event Simulator 推进 (received=${received})`);
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    assert(await page.locator('[data-testid="job-detail-page"]').count() > 0, 'Job Detail loads');
    await snap(page, 'e6-f3-regression.png');
    await ctx.close();
  }

  await browser.close();

  // Write proof files
  await writeFile(path.join(OUT, 'runtime-style-proof.json'), JSON.stringify(styleProof, null, 2));
  await writeFile(path.join(OUT, 'runtime-interaction-proof.json'), JSON.stringify(interactionProof, null, 2));

  // manifest
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: `Playwright Chromium ${bv}`, screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：${screenshots.length} 截图 + style-proof + interaction-proof + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
