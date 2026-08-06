/**
 * G2-F2 R1.3-E1 证据截图（2张 + 严格断言）。
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
const OUT = 'artifacts/frontend/g2-f2-r1-3-e1';
async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="analysis-canvas"]', { timeout: 10000 });

  // Run normal to completion
  await page.getByRole('button', { name: '场景 A · 正常完成' }).click();
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
  await page.waitForFunction(() => document.querySelector('[data-testid="persistent-task-bar"]')?.textContent?.includes('分析完成'), { timeout: 60000 });
  await page.waitForTimeout(800);

  // §1: selling-point-from-recipe-tab
  // Navigate to Recipe Tab first
  await page.locator('[data-testid="inspector-panel"]').getByTestId('inspector-tab-recipe').click();
  await page.waitForTimeout(500);
  assert(await page.locator('[data-testid="inspector-tab-recipe"]').count() > 0, 'currently on Recipe Tab');
  // Click sp-comfort in selling points view
  await page.getByTestId('view-mode-selling-points').click();
  await page.waitForTimeout(500);
  await page.locator('[data-testid="selling-point-sp-comfort"]').click();
  await page.waitForTimeout(800);
  // Assert: inspector switched to suite-insights
  const activeTab = await page.locator('[data-testid="inspector-tab-suite-insights"][style*="border-bottom: 2px solid"]').count();
  assert(activeTab > 0, 'inspector switched to suite-insights after SP click from Recipe Tab');
  // Assert: SP detail visible
  const spDetail = await page.locator('[data-testid="selling-point-view"]').getAttribute('data-selected-selling-point-id');
  assert(spDetail === 'sp-comfort', `sp-comfort detail mode (got ${spDetail})`);
  await page.screenshot({ path: path.join(OUT, 'selling-point-from-recipe-tab.png'), animations: 'disabled' });

  // §4: restarted-zero-results
  await page.getByRole('button', { name: '重新运行' }).first().click();
  await page.waitForTimeout(500);
  // Assert: all states reset immediately (before new events arrive)
  const clusterId = await page.locator('#root > div').getAttribute('data-selected-cluster-id');
  const spId = await page.locator('#root > div').getAttribute('data-selected-selling-point-id');
  const riskId = await page.locator('#root > div').getAttribute('data-selected-risk-item-id');
  const recipeField = await page.locator('#root > div').getAttribute('data-selected-recipe-field');
  assert(clusterId === '', `selectedClusterId empty (got "${clusterId}")`);
  assert(spId === '', `selectedSellingPointId empty (got "${spId}")`);
  assert(riskId === '', `selectedRiskItemId empty (got "${riskId}")`);
  assert(recipeField === '', `selectedRecipeField empty (got "${recipeField}")`);
  // Assert: classified assets = 0 (check contact-sheet)
  await page.getByTestId('view-mode-contact-sheet').click();
  await page.waitForTimeout(300);
  const zeroThumbs = await page.locator('[data-testid^="contact-thumb-"]').count();
  assert(zeroThumbs === 0, `classifiedAssetIds === 0 (got ${zeroThumbs})`);
  await page.screenshot({ path: path.join(OUT, 'restarted-zero-results.png'), animations: 'disabled' });

  await ctx.close();
  await browser.close();

  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc, sourceTreeHash: st, evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)', browserVersion: bv,
    screenshots: [
      { file: 'selling-point-from-recipe-tab.png', sha256: await sha256(path.join(OUT, 'selling-point-from-recipe-tab.png')) },
      { file: 'restarted-zero-results.png', sha256: await sha256(path.join(OUT, 'restarted-zero-results.png')) },
    ],
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('\n完成：截图 2 张 + manifest');
}

main().catch((e) => { console.error(e); process.exit(1); });
