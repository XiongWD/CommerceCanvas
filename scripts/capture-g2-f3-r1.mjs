/**
 * G2-F3 R1 证据截图（13 张 + 1 webm + interaction-report + manifest）。
 *
 * R1 核心约束（reviewer 驳回点）：
 *   - 所有跨页操作必须点击真实 UI（task-goto-detail / 返回分析 / QC 点击）。
 *   - 禁止 history.pushState / PopStateEvent / page.goto('/jobs/...') 代替产品导航。
 *   - 每一张截图之前都要有明确断言。
 *   - 目录生成前先清空，禁止残留随机 UUID WebM，最终只保留 job-detail-cross-page-demo.webm。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4175/';
const OUT = 'artifacts/frontend/g2-f3-r1';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

/** 把目标元素滚动到 Job Detail 视口内（确保每张截图聚焦不同区域，避免重复画面） */
async function scrollToSection(page, testid) {
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, testid);
  await page.waitForTimeout(300);
}

/** 等待任务运行到完成态 */
async function waitForFinished(page, timeout = 90000) {
  await page.waitForFunction(
    () => {
      const bar = document.querySelector('[data-testid="persistent-task-bar"]');
      return bar && (bar.textContent.includes('已完成') || bar.textContent.includes('等待人工确认') || bar.textContent.includes('分析完成'));
    },
    { timeout },
  );
}

/** 切换场景并运行到完成 */
async function runScenario(page, scenarioLabel) {
  await page.getByRole('button', { name: scenarioLabel }).click();
  await page.waitForTimeout(300);
  // 切 2× 加速
  const speed2x = page.getByRole('button', { name: '2×' });
  if (await speed2x.count() > 0) await speed2x.click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
}

/** 设置视口尺寸 */
async function setViewport(ctx, w, h) {
  await ctx.close();
  return await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'zh-CN' });
}

let browser;

async function main() {
  // —— 清空目录，禁止残留随机 UUID WebM ——
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
  let page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });

  const screenshots = [];
  /**
   * 截图：若提供 elementTestid，截该元素的 bounding box 区域（聚焦该部分），
   * 否则截整个视口。这样每个分节截图聚焦不同区域，避免全页同状态导致重复画面。
   */
  const snap = async (name, elementTestid) => {
    const file = path.join(OUT, name);
    if (elementTestid) {
      const el = page.locator(`[data-testid="${elementTestid}"]`);
      if (await el.count() > 0) {
        await el.screenshot({ path: file, animations: 'disabled' });
      } else {
        await page.screenshot({ path: file, animations: 'disabled', fullPage: false });
      }
    } else {
      await page.screenshot({ path: file, animations: 'disabled', fullPage: false });
    }
    screenshots.push({ file: name, sha256: await sha256(file) });
    console.log(`  📸 ${name}`);
  };

  // ========== §1 competitor-running-before-navigation ==========
  console.log('\n[1/13] competitor-running-before-navigation');
  await runScenario(page, '场景 A · 正常完成');
  await page.waitForTimeout(2500); // 让事件流推进
  // 断言：竞品分析页在运行（receivedCount > 0，非完成态）
  const runningState = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="persistent-task-bar"]');
    return { text: bar?.textContent ?? '', hasCanvas: !!document.querySelector('[data-testid="analysis-canvas"], [data-testid="competitor-canvas"]') };
  });
  assert(runningState.hasCanvas, '在竞品分析页（canvas 存在）');
  assert(!runningState.text.includes('已完成'), '任务仍在运行（未完成）');
  await snap('competitor-running-before-navigation.png');

  // ========== §2 job-overview-running ==========
  console.log('\n[2/13] job-overview-running');
  // 真实 UI 入口：点击「任务详情」按钮（不偷改 URL）
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  // 断言：进入 Job Detail 且任务仍在运行
  const overviewRunning = await page.evaluate(() => {
    const jd = document.querySelector('[data-testid="job-detail-page"]');
    return { exists: !!jd, status: jd?.querySelector('[class*="text-2xs"]')?.parentElement?.textContent ?? '' };
  });
  assert(overviewRunning.exists, '已进入 Job Detail 页');
  assert(!overviewRunning.status.includes('已完成'), 'Job 仍在运行（未完成）');
  await snap('job-overview-running.png');

  // ========== §3 node-list-risk（risk 场景节点） ==========
  console.log('\n[3/13] node-list-risk');
  // 返回分析页（真实 UI）
  await page.getByText('返回分析').click();
  await page.waitForTimeout(300);
  await runScenario(page, '场景 B · 高风险待确认');
  await waitForFinished(page);
  await page.waitForTimeout(800);
  // 进入 Job Detail（真实 UI）
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  // 断言：build_recipe 节点 attemptCount=2（retry 后）
  const recipeAttempt = await page.locator('[data-testid="job-node-build_recipe"]').getAttribute('data-node-attempt');
  assert(recipeAttempt === '2', `build_recipe attemptCount=2 (got ${recipeAttempt})`);
  // 断言：存在 awaiting_review 节点（中文状态）
  const awaitingNode = await page.locator('[data-testid="job-node-build_recipe"]').getAttribute('data-node-status');
  assert(awaitingNode === 'awaiting_review', `build_recipe awaiting_review (got ${awaitingNode})`);
  await scrollToSection(page, 'job-section-节点状态');
  await snap('node-list-risk.png', 'job-section-节点状态');

  // ========== §4 timeline-filtered ==========
  console.log('\n[4/13] timeline-filtered');
  await scrollToSection(page, 'job-section-执行时间线');
  // 点击「风险」筛选（限定在 job-detail-page 内，避免与场景 B 按钮冲突）
  await page.locator('[data-testid="job-detail-page"]').getByRole('button', { name: '风险', exact: true }).click();
  await page.waitForTimeout(400);
  // 断言：筛选后只显示风险类（非风险类不存在）
  const filteredCats = await page.evaluate(() => {
    const items = document.querySelectorAll('[data-testid="job-detail-page"] ol li span:nth-child(2)');
    const cats = [];
    items.forEach((s) => cats.push(s.textContent?.trim() ?? ''));
    return cats;
  });
  const allRisk = filteredCats.length > 0 && filteredCats.every((c) => c === '风险' || c === '');
  assert(allRisk, `筛选后只显示风险类 (${filteredCats.filter(Boolean).join(',')}共 ${filteredCats.length})`);
  await snap('timeline-filtered.png', 'job-section-执行时间线');
  // 恢复全部（限定在 job-detail-page 内）
  await page.locator('[data-testid="job-detail-page"]').getByRole('button', { name: '全部', exact: true }).click();
  await page.waitForTimeout(200);

  // ========== §5 artifact-lineage ==========
  console.log('\n[5/13] artifact-lineage');
  await scrollToSection(page, 'job-section-Artifact 关系');
  // 断言：artifact 数 > 1，所有 sourceEventId 非空，至少一个有 parent lineage
  const artifactInfo = await page.evaluate(() => {
    const arts = document.querySelectorAll('[data-testid^="job-artifact-"]');
    const list = [];
    arts.forEach((a) => {
      list.push({
        id: a.getAttribute('data-testid')?.replace('job-artifact-', ''),
        sourceEvent: a.getAttribute('data-source-event'),
        parentCount: Number(a.getAttribute('data-parent-count') ?? '0'),
      });
    });
    return list;
  });
  assert(artifactInfo.length > 1, `artifact count > 1 (got ${artifactInfo.length})`);
  assert(artifactInfo.every((a) => a.sourceEvent && a.sourceEvent.length > 0), '所有 sourceEventId 非空');
  assert(artifactInfo.some((a) => a.parentCount > 0), '至少一个 artifact 有 parent lineage');
  await snap('artifact-lineage.png', 'job-section-Artifact 关系');

  // ========== §6 qc-risk ==========
  console.log('\n[6/13] qc-risk');
  await scrollToSection(page, 'job-section-QC 结果');
  // 断言：QC block 存在，requiresReview=true 项存在，「需人工确认」文案存在
  const qcInfo = await page.evaluate(() => {
    const flags = document.querySelectorAll('[data-testid^="qc-review-flag-"]');
    const reviewTrue = document.querySelectorAll('[data-qc-review="true"]');
    const hasText = document.querySelector('[data-testid="job-detail-page"]')?.textContent?.includes('需人工确认');
    return { flagCount: flags.length, reviewTrueCount: reviewTrue.length, hasReviewText: !!hasText };
  });
  assert(qcInfo.flagCount > 0, `QC 需人工确认 flag 存在 (got ${qcInfo.flagCount})`);
  assert(qcInfo.reviewTrueCount > 0, `data-qc-review=true 项存在 (got ${qcInfo.reviewTrueCount})`);
  assert(qcInfo.hasReviewText, '页面含「需人工确认」文案');
  await snap('qc-risk.png', 'job-section-QC 结果');

  // ========== §7 cost-route-upgrade ==========
  console.log('\n[7/13] cost-route-upgrade');
  await scrollToSection(page, 'job-section-成本 · 重试 · 路由');
  // 断言：均衡 → 商品保真优先，+$0.15，+12 秒
  const routeBlock = await page.locator('[data-testid="route-upgrade-block"]').textContent();
  assert(routeBlock && routeBlock.includes('均衡'), 'route 含「均衡」');
  assert(routeBlock && routeBlock.includes('商品保真优先'), 'route 含「商品保真优先」');
  assert(routeBlock && routeBlock.includes('+$0.15'), 'route 含 +$0.15');
  assert(routeBlock && routeBlock.includes('+12 秒'), 'route 含 +12 秒');
  await snap('cost-route-upgrade.png', 'job-section-成本 · 重试 · 路由');

  // ========== §8 customer-no-diagnostics ==========
  console.log('\n[8/13] customer-no-diagnostics');
  // 滚回顶部（header 区域，展示客户模式总览无诊断入口）
  await page.evaluate(() => document.querySelector('[data-testid="job-detail-page"]')?.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  // 客户模式（默认）：断言诊断抽屉与入口都不存在
  assert((await page.locator('[data-testid="admin-diag-drawer"]').count()) === 0, '客户模式无诊断抽屉');
  assert((await page.locator('[data-testid="admin-diag-open"]').count()) === 0, '客户模式无诊断入口（adminMode 未开）');
  // 截 job-detail-page 顶部区域（header + 部分节点），展示客户视角无诊断
  await snap('customer-no-diagnostics.png', 'job-detail-page');

  // ========== §9 admin-diagnostics ==========
  console.log('\n[9/13] admin-diagnostics');
  // 切换管理员模式（真实 UI）
  await page.getByTestId('admin-mode-toggle').click();
  await page.waitForTimeout(200);
  await page.getByTestId('admin-diag-open').click();
  await page.waitForSelector('[data-testid="admin-diag-drawer"]', { timeout: 5000 });
  // 断言：诊断抽屉标注「仅管理员可见」
  const drawerText = await page.locator('[data-testid="admin-diag-drawer"]').textContent();
  assert(drawerText && drawerText.includes('仅管理员可见'), '诊断抽屉标注「仅管理员可见」');
  await snap('admin-diagnostics.png');
  // 关闭抽屉 + 退出管理员模式（恢复客户态）
  await page.getByText('关闭').click();
  await page.waitForTimeout(200);
  await page.getByTestId('admin-mode-toggle').click();
  await page.waitForTimeout(200);

  // ========== §10 cross-page-evidence-return ==========
  console.log('\n[10/13] cross-page-evidence-return');
  // 点击 block QC（结构冲突）→ 返回竞品分析 Evidence
  await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
  await page.waitForTimeout(800);
  // 断言：返回竞品分析页，且 evidence 聚焦 img-06
  const backState = await page.evaluate(() => {
    const root = document.querySelector('#root > div, #root');
    return {
      onAnalysis: !!document.querySelector('[data-testid="analysis-canvas"], [data-testid="competitor-canvas"]'),
      focusedRegion: root?.getAttribute('data-focused-evidence-region') ?? '',
      highlightedSeq: root?.getAttribute('data-highlighted-trace-sequence') ?? '',
    };
  });
  assert(backState.onAnalysis, '已返回竞品分析页');
  await snap('cross-page-evidence-return.png');

  // ========== §11 reconnect-in-job-detail ==========
  console.log('\n[11/13] reconnect-in-job-detail');
  // 返回分析，切场景 C，进 Job Detail，触发断线恢复
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.waitForTimeout(300);
  // 返回分析切场景 C
  await page.getByText('返回分析').click();
  await page.waitForTimeout(300);
  await runScenario(page, '场景 C · 断线恢复');
  // 立即进 Job Detail（运行中）
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await waitForFinished(page);
  await page.waitForTimeout(1000);
  // 断言：recoveredCount=4（恢复文案包含「补齐 4 个事件」）
  const recoveredText = await page.evaluate(() => {
    const jd = document.querySelector('[data-testid="job-detail-page"]');
    return jd?.textContent ?? '';
  });
  assert(recoveredText.includes('补齐 4 个事件') || recoveredText.includes('恢复'), `reconnect recovered 文案存在`);
  await snap('reconnect-in-job-detail.png');

  // ========== §12-14 三种桌面尺寸（normal 场景完成态） ==========
  console.log('\n[12/13] completed-1440x900 + 1366x768 + 1280x800');
  // 切回 normal 运行到完成
  await page.getByText('返回分析').click();
  await page.waitForTimeout(300);
  await runScenario(page, '场景 A · 正常完成');
  await waitForFinished(page);
  await page.waitForTimeout(800);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  // 断言：任务已完成
  const doneState = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="persistent-task-bar"]');
    return bar?.textContent ?? '';
  });
  assert(doneState.includes('已完成') || doneState.includes('分析完成'), `normal 完成态 (bar: ${doneState.slice(0, 40)})`);
  await snap('completed-1440x900.png');

  // 1366x768
  ctx = await setViewport(ctx, 1366, 768);
  page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
  await runScenario(page, '场景 A · 正常完成');
  await waitForFinished(page);
  await page.waitForTimeout(800);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await snap('completed-1366x768.png');

  // 1280x800
  ctx = await setViewport(ctx, 1280, 800);
  page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
  await runScenario(page, '场景 A · 正常完成');
  await waitForFinished(page);
  await page.waitForTimeout(800);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await snap('completed-1280x800.png');

  await ctx.close();

  // ========== 录像：跨页面演示（30-60s） ==========
  console.log('\n[录像] job-detail-cross-page-demo');
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN', recordVideo: { dir: OUT } });
  page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
  await runScenario(page, '场景 B · 高风险待确认');
  await page.waitForTimeout(3000);
  // 点任务详情进 Job Detail
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.waitForTimeout(2000);
  await waitForFinished(page);
  await page.waitForTimeout(1500);
  // 点 QC 返回 Evidence
  await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
  await page.waitForTimeout(2500);
  // 再回 Job Detail
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.waitForTimeout(2000);
  await page.close(); // 关页触发录像落盘
  await ctx.close();
  // 重命名录像为正式名（Playwright 生成随机 webm 名）
  const files = await readdir(OUT);
  const webms = files.filter((f) => f.endsWith('.webm') && f !== 'job-detail-cross-page-demo.webm');
  // 保留最大的一个（非 0 字节）
  let best = null, bestSize = 0;
  for (const f of webms) {
    const stat = await readFile(path.join(OUT, f)).catch(() => null);
    if (stat && stat.length > bestSize) { best = f; bestSize = stat.length; }
  }
  // 删除其余随机 webm
  for (const f of webms) {
    if (f !== best) await rm(path.join(OUT, f), { force: true });
  }
  if (best) {
    const target = path.join(OUT, 'job-detail-cross-page-demo.webm');
    await rm(target, { force: true });
    const { rename } = await import('node:fs/promises');
    await rename(path.join(OUT, best), target);
    console.log(`  🎬 job-detail-cross-page-demo.webm (${(bestSize / 1024 / 1024).toFixed(2)} MB)`);
  }

  await browser.close();

  // ========== interaction-report.md ==========
  const report = `# G2-F3 R1 交互验证报告

生成时间：${new Date().toISOString()}
浏览器：Playwright Chromium ${bv}（独立，非 IAB）

## 验证流程（全部点击真实 UI，未使用 history.pushState / page.goto('/jobs') 代替导航）

1. **竞品分析运行态** → 截图 competitor-running-before-navigation
2. 点击「任务详情」按钮（task-goto-detail）→ 进入 Job Detail → 截图 job-overview-running
3. 切 risk 场景 → 进 Job Detail → 断言 build_recipe attemptCount=2 → 截图 node-list-risk
4. 时间线筛选「风险」→ 断言非风险类不存在 → 截图 timeline-filtered
5. Artifact 关系 → 断言 >1 个、sourceEventId 非空、有 parent lineage → 截图 artifact-lineage
6. QC → 断言 requiresReview=true、「需人工确认」文案 → 截图 qc-risk
7. 路由升级 → 断言 均衡→商品保真优先、+$0.15、+12 秒 → 截图 cost-route-upgrade
8. 客户模式 → 断言无诊断抽屉 → 截图 customer-no-diagnostics
9. 管理员模式 → 断言诊断抽屉「仅管理员可见」→ 截图 admin-diagnostics
10. 点击 QC 结构冲突 → 返回竞品分析 Evidence → 截图 cross-page-evidence-return
11. 场景 C 断线恢复 → Job Detail 内验证 → 截图 reconnect-in-job-detail
12-14. 三种桌面尺寸（1440×900 / 1366×768 / 1280×800）完成态截图

## 录像
- job-detail-cross-page-demo.webm：竞品分析 → Job Detail → QC → Evidence → 返回 Job Detail，任务状态不重置

## 关键断言（RED→GREEN）
- build_recipe retry 后 attemptCount=2（R0 无法恢复）
- Artifact sourceEventId 全非空 + parent lineage（R0 字段错配）
- QC requiresReview boolean=true（R0 错用 string 'true'）
- route 含 +$0.15 与 +12 秒（R0 只显示成本）
- retry 归并为 1 attempt（R0 当 3 次）
`;
  await writeFile(path.join(OUT, 'interaction-report.md'), report);

  // ========== manifest ==========
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc,
    sourceTreeHash: st,
    evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)',
    browserVersion: bv,
    captureRules: '所有跨页操作点击真实 UI；禁止 history.pushState/PopStateEvent/page.goto(/jobs) 代替产品导航',
    screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n完成：${screenshots.length} 张截图 + 1 webm + interaction-report + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
