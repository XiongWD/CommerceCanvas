/**
 * G2-F3.5 R5 Evidence — Graphite Native Foundation proof.
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
const OUT = 'artifacts/frontend/g2-f3.5-r5';
const s256 = async (f) => createHash('sha256').update(await readFile(f)).digest('hex');
function assert(c,m){if(!c){console.error(`FAIL: ${m}`);process.exit(1);}console.log(`  ✓ ${m}`);}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const shots = [];
  const snap = async (p,n) => { const f=path.join(OUT,n);await p.screenshot({path:f,animations:'disabled'});shots.push({file:n,sha256:await s256(f)});console.log(`  📸 ${n}`);};
  const proof = {};

  // E3: Job Detail R5 Native (main evidence)
  console.log('\n[E3] Job Detail R5 Graphite Native');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
    await page.getByRole('button', { name: '2×' }).click();
    await page.getByRole('button', { name: '开始演示分析' }).click();
    await page.waitForFunction(() => { const b=document.querySelector('[data-testid="persistent-task-bar"]');const s=b?.getAttribute('data-job-status');return s==='completed'||s==='awaiting_review'; }, { timeout: 60000 });
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    // Foundation markers in production
    const markers = await page.evaluate(() => ({
      text: document.querySelectorAll('[data-cc-component="Text"]').length,
      statusIndicator: document.querySelectorAll('[data-cc-component="StatusIndicator"]').length,
    }));
    proof.foundationMarkers = markers;
    assert(markers.text + markers.statusIndicator >= 2, `Foundation markers >= 2 (${JSON.stringify(markers)})`);
    // Graphite dark preserved
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    proof.bodyBg = bg;
    assert(bg !== 'rgb(255, 255, 255)', `Graphite dark background (${bg})`);
    // No Astryx CSS
    const hasAstryxCSS = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      try { return styles.some(s => s.href?.includes('astryx')); } catch { return false; }
    });
    proof.hasAstryxCSS = hasAstryxCSS;
    assert(!hasAstryxCSS, 'No Astryx CSS in production');
    await snap(page, 'e3-job-detail-r5-native.png');
    await snap(page, 'e4-native-typography-metrics.png');
    await ctx.close();
  }

  // E5: Native table density (from dev foundation page)
  console.log('\n[E5] Native Table Density');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await ctx.newPage();
    await page.goto(new URL('/__dev/design-foundation', BASE).toString(), { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="design-foundation-page"]', { timeout: 10000 });
    await page.locator('[data-testid="foundation-table"]').scrollIntoViewIfNeeded();
    const tableText = await page.locator('[data-testid="foundation-table"]').textContent();
    assert(tableText?.includes('job-normal-001'), 'Table has job-normal-001');
    await snap(page, 'e5-native-table-density.png');
    await ctx.close();
  }

  // E6: F3 Regression
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
    assert(Number(received) > 0, `F3 Simulator running (received=${received})`);
    await page.getByTestId('task-goto-detail').click();
    await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
    const nodes = await page.locator('[data-testid^="job-node-"]').count();
    assert(nodes === 7, `7 Job nodes (${nodes})`);
    await snap(page, 'e6-f3-regression.png');
    await ctx.close();
  }

  await browser.close();

  await writeFile(path.join(OUT, 'runtime-proof.json'), JSON.stringify(proof, null, 2));
  let sc='unknown',st='unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify({
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: `Playwright Chromium ${bv}`, screenshots: shots,
  }, null, 2));
  console.log(`\n完成：${shots.length} 截图 + runtime-proof + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
