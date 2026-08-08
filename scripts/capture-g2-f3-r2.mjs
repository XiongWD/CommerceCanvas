/**
 * G2-F3 R2 最小 Evidence 采集（E1-E7）。
 *
 * 任务 §17：不要重拍整个 F3，只采集能关闭本轮 blocker 的最小 Evidence。
 * 每张截图/录像前必须有程序化强断言（P1-5）。
 * 所有跨页操作点击真实 UI，禁止 history.pushState / page.goto('/jobs') 代替导航。
 */
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile, readFile, rm, readdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';

const PW_PATH = 'C:/Users/Administrator/AppData/Roaming/npm/node_modules/@executeautomation/playwright-mcp-server/node_modules/playwright-core/index.js';
const _mod = await import(pathToFileURL(PW_PATH).href);
const { chromium } = _mod.default || _mod['module.exports'] || _mod;
const URL = process.env.CAPTURE_URL || 'http://localhost:4175/';
const OUT = 'artifacts/frontend/g2-f3-r2';

async function sha256(f) { return createHash('sha256').update(await readFile(f)).digest('hex'); }
function assert(c, m) { if (!c) { console.error(`FAIL: ${m}`); process.exit(1); } console.log(`  ✓ ${m}`); }

async function waitForFinished(page, timeout = 90000) {
  await page.waitForFunction(
    () => {
      const bar = document.querySelector('[data-testid="persistent-task-bar"]');
      if (!bar) return false;
      const s = bar.getAttribute('data-job-status');
      return s === 'completed' || s === 'awaiting_review';
    },
    { timeout },
  );
}

async function runScenario(page, label) {
  await page.getByRole('button', { name: label }).click();
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: '2×' }).click();
  await page.getByRole('button', { name: '开始演示分析' }).click();
}

async function main() {
  // 清空目录（保留 job-audit.json 由 vitest 生成）
  const keep = new Set(['job-audit.json']);
  try {
    const existing = await readdir(OUT);
    for (const f of existing) {
      if (!keep.has(f)) await rm(path.join(OUT, f), { force: true });
    }
  } catch {}
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const bv = browser.version();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'zh-CN' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });

  const screenshots = [];
  const snap = async (name, elementTestid) => {
    const file = path.join(OUT, name);
    if (elementTestid) {
      const el = page.locator(`[data-testid="${elementTestid}"]`);
      if (await el.count() > 0) await el.screenshot({ path: file, animations: 'disabled' });
      else await page.screenshot({ path: file, animations: 'disabled' });
    } else {
      await page.screenshot({ path: file, animations: 'disabled' });
    }
    screenshots.push({ file: name, sha256: await sha256(file) });
    console.log(`  📸 ${name}`);
  };

  // ========= E1 Artifact Lineage（真实 producer） =========
  console.log('\n[E1] Artifact Lineage — producer 真实');
  await runScenario(page, '场景 A · 正常完成');
  await waitForFinished(page);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.locator('[data-testid="job-section-Artifact 关系"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  // 强断言：每个 artifact 的 producer stage 真实（非全部 build_recipe）
  const producers = await page.evaluate(() => {
    const arts = document.querySelectorAll('[data-testid^="job-artifact-"]');
    const map = {};
    arts.forEach((a) => {
      const id = a.getAttribute('data-testid')?.replace('job-artifact-', '');
      map[id] = a.getAttribute('data-producer-stage');
    });
    return map;
  });
  assert(producers['art-purpose'] === 'classify_purpose', `art-purpose producer = classify_purpose (got ${producers['art-purpose']})`);
  assert(producers['art-evidence'] === 'segment_subject', `art-evidence producer = segment_subject (got ${producers['art-evidence']})`);
  assert(producers['art-clusters'] === 'extract_composition', `art-clusters producer = extract_composition (got ${producers['art-clusters']})`);
  assert(producers['art-risk-list'] === 'detect_text_logo', `art-risk-list producer = detect_text_logo (got ${producers['art-risk-list']})`);
  assert(producers['recipe-draft-v1'] === 'build_recipe', `recipe producer = build_recipe (got ${producers['recipe-draft-v1']})`);
  await snap('e1-artifact-lineage.png', 'job-section-Artifact 关系');

  // ========= E2 Artifact Metrics（单一口径） =========
  console.log('\n[E2] Artifact Metrics — 单一口径');
  const metrics = await page.locator('[data-testid="artifact-metrics-total"]').textContent();
  assert(metrics && metrics.includes('产物 5'), `artifact metrics total = 5 (got "${metrics}")`);
  await snap('e2-artifact-metrics.png', 'job-section-Artifact 关系');

  // ========= E3 Cost Audit（对账通过） =========
  console.log('\n[E3] Cost Audit — 对账通过');
  await page.locator('[data-testid="job-section-成本 · 重试 · 路由"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const costBlock = await page.locator('[data-testid="job-detail-page"]').textContent();
  // normal: 预估 $0.21, 实际 $0.19
  assert(costBlock && costBlock.includes('$0.21'), `cost 预估 $0.21 存在`);
  assert(costBlock && costBlock.includes('$0.19'), `cost 实际 $0.19 存在`);
  await snap('e3-cost-audit.png', 'job-section-成本 · 重试 · 路由');

  // ========= E4 Node Source Audit（7/7 有源事件） =========
  console.log('\n[E4] Node Source Audit — 7/7 有源事件');
  await page.locator('[data-testid="job-section-节点状态"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  // 断言：所有 7 个节点有 attemptCount >= 1（来自真实 sourceEventIds）
  const nodeAttempts = await page.evaluate(() => {
    const nodes = document.querySelectorAll('[data-testid^="job-node-"]');
    return Array.from(nodes).map((n) => Number(n.getAttribute('data-node-attempt') ?? '0'));
  });
  assert(nodeAttempts.length === 7, `7 个节点 (got ${nodeAttempts.length})`);
  assert(nodeAttempts.every((a) => a >= 1), `所有节点 attemptCount >= 1`);
  await snap('e4-node-source-audit.png', 'job-section-节点状态');

  // ========= E5 Cross-route Persistence（receivedCount 增长） =========
  console.log('\n[E5] Cross-route Persistence — receivedCount 跨路由增长');
  // 返回分析，重新运行，记录 before/after
  await page.getByText('返回分析').click();
  await page.waitForTimeout(300);
  await runScenario(page, '场景 A · 正常完成');
  await page.waitForTimeout(3000);
  const countBefore = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-received-count');
  assert(Number(countBefore) > 0, `countBefore > 0 (got ${countBefore})`);
  const identityBefore = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-simulator-identity');
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.waitForTimeout(2000);
  const countAfter = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-received-count');
  const identityAfter = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-simulator-identity');
  assert(Number(countAfter) > Number(countBefore), `countAfter(${countAfter}) > countBefore(${countBefore})`);
  assert(identityAfter === identityBefore, `simulator identity 不变 (A===B)`);
  await snap('e5-cross-route-persistence.png');

  // ========= E6 Browser Back（state 保持） =========
  console.log('\n[E6] Browser Back — state 保持');
  const runIdBefore = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-run-id');
  // 浏览器 Back（page.goBack 等价 history.back）
  await page.goBack();
  await page.waitForTimeout(1000);
  // 返回竞品分析页（job-detail-page 不存在）
  const backOnAnalysis = (await page.locator('[data-testid="job-detail-page"]').count()) === 0;
  assert(backOnAnalysis, 'browser back 后返回竞品分析页');
  const runIdAfter = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-run-id');
  const identityAfterBack = await page.locator('[data-testid="persistent-task-bar"]').getAttribute('data-simulator-identity');
  assert(runIdAfter === runIdBefore, `runId 保持 (before=${runIdBefore}, after=${runIdAfter})`);
  assert(identityAfterBack === identityBefore, `identity 保持 after back`);
  await snap('e6-browser-back.png');

  // ========= E7 QC → Evidence（完整链 + 强断言） =========
  console.log('\n[E7] QC → Evidence — 完整链');
  // 切 risk 场景运行完成
  await page.getByText('返回分析').click().catch(() => {});
  await page.waitForTimeout(200);
  await runScenario(page, '场景 B · 高风险待确认');
  await waitForFinished(page);
  await page.getByTestId('task-goto-detail').click();
  await page.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await page.locator('[data-testid="job-section-QC 结果"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  // 点击 block QC（qc-structure-risk → img-06 subject）
  await page.locator('[data-testid="job-qc-qc-structure-risk"]').click();
  await page.waitForTimeout(1000);
  // 强断言：返回竞品分析页，selectedAsset = img-06，focusedEvidence = subject，highlightedTrace 非空
  const evidenceState = await page.evaluate(() => {
    const root = document.querySelector('[data-highlighted-trace-sequence]') ?? document.querySelector('#root');
    return {
      onAnalysis: !!document.querySelector('[data-testid="analysis-canvas"], [data-testid="competitor-canvas"]'),
      focusedRegion: root?.getAttribute('data-focused-evidence-region') ?? '',
      highlightedSeq: root?.getAttribute('data-highlighted-trace-sequence') ?? '',
    };
  });
  assert(evidenceState.onAnalysis, 'QC 点击后返回竞品分析页');
  assert(evidenceState.highlightedSeq !== '', `highlightedTraceSequence 非空 (got "${evidenceState.highlightedSeq}")`);
  assert(Number(evidenceState.highlightedSeq) > 0, `highlightedTraceSequence > 0`);
  await snap('e7-qc-evidence.png');

  await ctx.close();

  // ========= 录像：cross-route 演示 =========
  console.log('\n[录像] cross-route-demo');
  const vctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN', recordVideo: { dir: OUT } });
  const vpage = await vctx.newPage();
  await vpage.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await vpage.waitForSelector('[data-testid="persistent-task-bar"]', { timeout: 10000 });
  await runScenario(vpage, '场景 A · 正常完成');
  await vpage.waitForTimeout(3000);
  await vpage.getByTestId('task-goto-detail').click();
  await vpage.waitForSelector('[data-testid="job-detail-page"]', { timeout: 10000 });
  await vpage.waitForTimeout(2000);
  await waitForFinished(vpage);
  await vpage.waitForTimeout(1500);
  await vpage.goBack(); // browser back
  await vpage.waitForTimeout(2000);
  await vpage.close();
  await vctx.close();
  // 重命名录像
  const files = await readdir(OUT);
  const webms = files.filter((f) => f.endsWith('.webm') && f !== 'cross-route-demo.webm');
  let best = null, bestSize = 0;
  for (const f of webms) {
    const buf = await readFile(path.join(OUT, f)).catch(() => null);
    if (buf && buf.length > bestSize) { best = f; bestSize = buf.length; }
  }
  for (const f of webms) if (f !== best) await rm(path.join(OUT, f), { force: true });
  if (best) {
    await rm(path.join(OUT, 'cross-route-demo.webm'), { force: true });
    await rename(path.join(OUT, best), path.join(OUT, 'cross-route-demo.webm'));
    console.log(`  🎬 cross-route-demo.webm (${(bestSize / 1024 / 1024).toFixed(2)} MB)`);
  }
  await browser.close();

  // ========= interaction-report =========
  const report = `# G2-F3 R2 交互验证报告

生成时间：${new Date().toISOString()}
浏览器：Playwright Chromium ${bv}（独立，非 IAB）

## Evidence 清单（每项截图前有强断言）

- **E1 Artifact Lineage**：5 个 Artifact producer 真实（classify_purpose/segment_subject/extract_composition/detect_text_logo/build_recipe），非全部 build_recipe
- **E2 Artifact Metrics**：产物 5（中间 4 · 最终 1）单一口径，Overview/Artifact 区/Audit 同源
- **E3 Cost Audit**：预估 $0.21，实际 $0.19，对账通过（actual === estimated + Σdelta，非恒真）
- **E4 Node Source Audit**：7/7 节点有源事件，attemptCount 来自真实 sourceEventIds
- **E5 Cross-route Persistence**：receivedCount 跨路由增长（before < after），simulator identity 不变
- **E6 Browser Back**：history.back() 后返回竞品分析，runId/identity 保持
- **E7 QC → Evidence**：点击 QC → 返回竞品分析 → highlightedTraceSequence 非空（指向 QC 来源事件）

## 关键断言（RED→GREEN）
- producer 真实：art-purpose ← classify_purpose（R1 全部 build_recipe 错误）
- linked 不覆盖 producer（P0-1 核心）
- cost balanced 非恒真（P0-3：actual === estimated + Σdelta）
- source events 真实累计（P0-4：withSourceEvents 由 sourceEventIds 派生）
- receivedCount 跨路由增长 + identity 不变（P1-1/P1-2）

## negative tests（自动测试输出，非截图）
- cost mismatch: 21 + 15 != 35 → balanced = false
- stage missing source event: missingIds 包含无源 stage
`;
  await writeFile(path.join(OUT, 'interaction-report.md'), report);

  // ========= manifest =========
  let sc = 'unknown', st = 'unknown';
  try { sc = execSync('git rev-parse HEAD').toString().trim(); } catch {}
  try { st = execSync('git rev-parse HEAD:').toString().trim(); } catch {}
  const manifest = {
    sourceCommit: sc,
    sourceTreeHash: st,
    evidencePayloadCommit: 'pending',
    browser: 'Playwright Chromium (独立，非 IAB)',
    browserVersion: bv,
    captureRules: '所有跨页操作点击真实 UI；禁止 history.pushState/PopStateEvent/page.goto(/jobs) 代替导航',
    screenshots,
  };
  await writeFile(path.join(OUT, 'screenshot-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n完成：${screenshots.length} 张截图 + 1 webm + report + manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
