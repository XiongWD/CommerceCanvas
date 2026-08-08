/**
 * 场景 A：正常完成（R1 修复业务事实）。
 *
 * R1 修复：
 *   - 3 条可区分的普通风险（不是只 1 条 warning.created）
 *   - 0 项结构冲突（里程碑文案不再写"2 项结构冲突"）
 *   - Recipe 7/7 字段全部标记（recipeFields 数组，逐字段）
 *   - 24 项发现通过权威 summaryMetrics 更新（不从轨迹反推）
 *
 * 业务计数：12 图 / 4 用途 / 4 构图 / 5 光线 / 7 Logo / 24 发现 / 3 风险 / 1 Artifact。
 * 终态：completed。
 */

import type { LiveEventEnvelope } from '@/types/live-event';
import type { ScenarioScript } from './event-simulator';
import { advance, emitStage, ev } from './event-simulator';

export function buildNormalScenario(): ScenarioScript {
  const ctx = { jobId: 'job-normal-001', seq: 0, t: 0 };
  const out: LiveEventEnvelope[] = [];

  out.push(
    ev(ctx, {
      kind: 'session.started',
      jobId: ctx.jobId,
      titleZh: '已创建竞品分析任务，正在校验 12 张图片',
      summaryZh: '演示运行 · 模拟事件流',
      metrics: { activeNodes: 3, totalImages: 12 },
    }),
  );
  advance(ctx, 1);

  // 阶段 1：校验竞品图片（determinate 12 张）
  emitStage(ctx, out, 'validate_images', {
    durationSec: 5,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'validate_images',
        titleZh: '12 张图片已完成格式与尺寸校验',
        summaryZh: '均为 1600×1600，无损坏文件',
      });
    },
  });

  // 阶段 2：识别图片用途
  emitStage(ctx, out, 'classify_purpose', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'classify_purpose',
        titleZh: '已识别前 4 张图片用途：主图 1 张、场景图 2 张、卖点图 1 张',
        summaryZh: '部分分类完成',
        resultRefs: { classifiedAssetIds: ['img-01', 'img-02', 'img-03', 'img-04'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'classify_purpose',
        titleZh: '已识别中间 4 张图片用途：场景图 2 张、卖点图 2 张',
        summaryZh: '分类推进中',
        resultRefs: { classifiedAssetIds: ['img-05', 'img-06', 'img-07', 'img-08'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'classify_purpose',
        titleZh: '已识别全部 12 张图片用途：主图 1、场景 4、卖点 5、细节 1、参数 1',
        summaryZh: '4 类用途分类完成',
        resultRefs: { classifiedAssetIds: ['img-09', 'img-10', 'img-11', 'img-12'] },
      });
      emit({
        kind: 'evidence.created',
        stageId: 'classify_purpose',
        titleZh: '其中 5 张使用右侧主体、左侧文案构图',
        summaryZh: '可定位到对应图片',
        evidenceRefs: [{ assetId: 'img-01', layer: 'subject' }],
      });
      // F3-R2 P0-1：用途分类结果由 classify_purpose 真实生产（producer = classify_purpose）
      emit({
        kind: 'artifact.created',
        stageId: 'classify_purpose',
        titleZh: '图片用途分类结果',
        summaryZh: '12 张图片 · 4 种用途分类完成',
        artifactRefs: ['art-purpose'],
        metrics: {
          artifactType: '用途分类结果',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-01', 'img-02', 'img-03', 'img-04', 'img-05', 'img-06', 'img-07', 'img-08', 'img-09', 'img-10', 'img-11', 'img-12'],
          parentArtifactIds: [],
        },
        resultRefs: { classifiedAssetIds: ['img-01', 'img-02', 'img-03', 'img-04', 'img-05', 'img-06', 'img-07', 'img-08', 'img-09', 'img-10', 'img-11', 'img-12'] },
      });
    },
    onComplete: (emit) => {
      emit({
        kind: 'milestone.reached',
        titleZh: '图片用途识别完成',
        summaryZh: '12 张图片 · 4 种用途',
        severity: 'success',
        metrics: { milestoneId: 'purpose_classified' },
      });
    },
  });

  // 阶段 3：分离商品与背景
  emitStage(ctx, out, 'segment_subject', {
    durationSec: 5,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'evidence.created',
        stageId: 'segment_subject',
        titleZh: '已分离 12 张图片的商品主体与背景',
        evidenceRefs: [
          { assetId: 'img-01', layer: 'subject' },
          { assetId: 'img-01', layer: 'safe' },
        ],
      });
      // F3-R2 P0-1：Evidence 索引由 segment_subject 真实生产（producer = segment_subject）
      emit({
        kind: 'artifact.created',
        stageId: 'segment_subject',
        titleZh: 'Evidence 索引',
        summaryZh: '商品主体与背景分离证据索引',
        artifactRefs: ['art-evidence'],
        metrics: {
          artifactType: 'Evidence 索引',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-01', 'img-02'],
          parentArtifactIds: ['art-purpose'],
        },
      });
    },
  });

  // 阶段 4：检测文字、Logo 和型号 —— R1：3 条可区分普通风险
  emitStage(ctx, out, 'detect_text_logo', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      // 风险 1：竞品 Logo / 型号区域
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '检测到 7 处竞品 Logo 或型号区域，已加入排除清单',
        summaryZh: '涉及 5 张图片',
        severity: 'warning',
        evidenceRefs: [
          { assetId: 'img-01', layer: 'logo', regionId: 'ev-01-logo' },
          { assetId: 'img-03', layer: 'logo' },
          { assetId: 'img-12', layer: 'logo', regionId: 'ev-12-logo' },
        ],
        resultRefs: { riskItemIds: ['risk-logo', 'risk-model'] },
      });
      // 风险 2：高密度文案布局需要重新排版
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '卖点图存在高密度文案布局，生成时需要重新排版',
        summaryZh: '非阻断：可在生成阶段处理',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-08', layer: 'subject' }],
        resultRefs: { riskItemIds: ['risk-packaging'] },
      });
      // 风险 3：参数或功能声明必须以 Product Master 为准
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '部分参数图包含功能声明，必须以 Product Master 为准',
        summaryZh: '非阻断：生成时锁定自有产品参数',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-12', layer: 'logo' }],
        resultRefs: { riskItemIds: ['risk-inear', 'risk-exclusive-feature'] },
      });
      emit({
        kind: 'action.created',
        stageId: 'detect_text_logo',
        titleZh: '已将 7 处竞品标识加入禁止继承清单',
        summaryZh: '生成时不会复用这些区域',
      });
      // F3-R2 P0-1：风险排除清单由 detect_text_logo 真实生产（producer = detect_text_logo）
      emit({
        kind: 'artifact.created',
        stageId: 'detect_text_logo',
        titleZh: '风险排除清单',
        summaryZh: '7 处品牌资产 + 3 项普通风险排除',
        artifactRefs: ['art-risk-list'],
        metrics: {
          artifactType: '风险排除清单',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-01', 'img-03', 'img-08', 'img-12'],
          parentArtifactIds: ['art-evidence'],
        },
        resultRefs: { riskItemIds: ['risk-logo', 'risk-model', 'risk-packaging', 'risk-inear', 'risk-exclusive-feature'] },
      });
    },
    onComplete: (emit) => {
      // R1 修复：正常场景 0 项结构冲突
      emit({
        kind: 'milestone.reached',
        titleZh: '风险排除清单建立',
        summaryZh: '7 处品牌资产 · 3 项普通风险 · 0 项结构冲突',
        severity: 'success',
        metrics: { milestoneId: 'risk_list_built' },
        resultRefs: { riskItemIds: ['fact-battery', 'fact-waterproof', 'fact-material', 'fact-compat', 'fact-size', 'safe-composition', 'safe-light', 'safe-background', 'safe-rhythm', 'safe-textzone'] },
      });
    },
  });

  // 阶段 5：提取构图与视觉语言
  emitStage(ctx, out, 'extract_composition', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'extract_composition',
        titleZh: '聚类出 2 种构图模式：右侧主体、中心对称',
        summaryZh: '前 2 类构图',
        resultRefs: { clusterIds: ['cluster-a', 'cluster-b'], insightIds: ['ins-usage', 'ins-cluster'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'extract_composition',
        titleZh: '聚类出另外 2 种构图模式：局部特写、参数结构',
        summaryZh: '4 类构图',
        resultRefs: { clusterIds: ['cluster-c', 'cluster-d'], insightIds: ['ins-light', 'ins-color'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'extract_composition',
        titleZh: '识别出 5 种可复用光线模式：左上柔光、冷色轮廓光、顶部柔光、逆光、侧光',
        summaryZh: '5 种光线',
      });
      emit({
        kind: 'decision.created',
        stageId: 'extract_composition',
        titleZh: '该构图适合作为自有商品场景卖点图模板',
        summaryZh: '保留构图与光线语言',
      });
      // F3-R2 P0-1：构图聚类由 extract_composition 真实生产（producer = extract_composition）
      emit({
        kind: 'artifact.created',
        stageId: 'extract_composition',
        titleZh: '构图聚类',
        summaryZh: '4 种构图模式聚类结果',
        artifactRefs: ['art-clusters'],
        metrics: {
          artifactType: '构图聚类',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-01', 'img-03', 'img-05', 'img-07'],
          parentArtifactIds: ['art-evidence'],
        },
        resultRefs: { clusterIds: ['cluster-a', 'cluster-b', 'cluster-c', 'cluster-d'] },
      });
    },
    onComplete: (emit) => {
      emit({
        kind: 'milestone.reached',
        titleZh: '视觉结构提取完成',
        summaryZh: '4 种构图模式 · 5 种光线模式',
        severity: 'success',
        metrics: { milestoneId: 'composition_extracted' },
      });
    },
  });

  // 阶段 6：归纳卖点顺序
  emitStage(ctx, out, 'summarize_selling_points', {
    durationSec: 5,
    inline: (emit) => {
      emit({
        kind: 'decision.created',
        stageId: 'summarize_selling_points',
        titleZh: '已归纳卖点：舒适性、稳定佩戴、声音体验',
        summaryZh: '前 3 个卖点',
        resultRefs: { sellingPointIds: ['sp-comfort', 'sp-stability', 'sp-sound'] },
      });
      emit({
        kind: 'decision.created',
        stageId: 'summarize_selling_points',
        titleZh: '已归纳卖点：续航、防水、参数与兼容性',
        summaryZh: '可作为页面节奏参考',
        resultRefs: { sellingPointIds: ['sp-battery', 'sp-waterproof', 'sp-spec'], insightIds: ['ins-rhythm', 'ins-material', 'ins-safe-zone'] },
      });
    },
  });

  // 阶段 7：形成套图 Creative Recipe —— R1：7 字段全部标记
  // F3-R2 P0-1：上游 Artifact 已由各自阶段真实生产（classify_purpose/segment_subject/
  //   extract_composition/detect_text_logo）。本阶段只生产最终 Creative Recipe（final），
  //   其 parentArtifactIds 指向真实上游 Artifact，形成可对账 lineage。
  emitStage(ctx, out, 'build_recipe', {
    durationSec: 6,
    inline: (emit) => {
      // R1：逐字段标记，最终 7/7
      emit({
        kind: 'observation.created',
        stageId: 'build_recipe',
        titleZh: 'Recipe 字段补全：用途、画布、商品位置',
        metrics: { recipeFields: ['purpose', 'canvas', 'position'] },
        resultRefs: { recipeFields: ['purpose', 'canvas', 'position'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'build_recipe',
        titleZh: 'Recipe 字段补全：商品占比、背景、光线',
        metrics: { recipeFields: ['ratio', 'background', 'lighting'] },
        resultRefs: { recipeFields: ['ratio', 'background', 'lighting'] },
      });
      // F3-R2 P0-1：最终 Creative Recipe 由 build_recipe 生产（producer = build_recipe, role = final）
      // parentArtifactIds = 真实上游（构图聚类 + 风险排除清单），可对账 lineage
      emit({
        kind: 'artifact.created',
        stageId: 'build_recipe',
        titleZh: '套图 Creative Recipe 草案已生成，可提前查看',
        summaryZh: '草案 v1',
        artifactRefs: ['recipe-draft-v1'],
        metrics: {
          recipeFields: ['textSafetyZone'],
          artifactType: 'Creative Recipe',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'final',
          linkedAssetIds: ['img-01'],
          parentArtifactIds: ['art-clusters', 'art-risk-list'],
        },
        resultRefs: { recipeFields: ['textSafetyZone'] },
      });
    },
    onComplete: (emit) => {
      emit({
        kind: 'milestone.reached',
        titleZh: 'Creative Recipe 草案已生成',
        severity: 'success',
        metrics: { milestoneId: 'recipe_generated' },
      });
    },
  });

  // 风险汇总 + 完成 —— R1：权威 summaryMetrics
  advance(ctx, 1);

  // F3：成本预估
  out.push(
    ev(ctx, {
      kind: 'cost.estimate.created',
      titleZh: '成本预估：均衡策略，预计 ¥1.50（约 $0.21）',
      traceCategory: '成本',
      metrics: { estimatedCents: 21, currency: 'USD' },
    }),
  );
  advance(ctx, 0.5);

  // F3-R1：QC 检查（5 项，全部通过）。差异化 Evidence：每项指向对应类型，非全部同一 subject。
  // qcReview 必须是 boolean（R0 错用 string 'true'/'false'）。
  const qcChecks = [
    { id: 'qc-structure', nameZh: '商品结构一致性', status: 'pass', targetZh: '开放式耳机结构', reasonZh: undefined, evidenceCount: 12, evidence: { assetId: 'img-01', layer: 'subject' as const }, review: false },
    { id: 'qc-logo', nameZh: 'Logo/型号排除', status: 'pass', targetZh: '7 处竞品标识', evidenceCount: 7, evidence: { assetId: 'img-01', layer: 'logo' as const, regionId: 'ev-01-logo' }, review: false },
    { id: 'qc-master', nameZh: 'Product Master 事实一致性', status: 'pass', targetZh: 'SKU OW-A31-BLK', evidenceCount: 5, evidence: { assetId: 'img-12', layer: 'text' as const }, review: false },
    { id: 'qc-recipe', nameZh: 'Recipe 完整度', status: 'pass', targetZh: '7/7 字段', evidenceCount: 7, evidence: { assetId: 'img-01', layer: 'safe' as const }, review: false },
    { id: 'qc-coverage', nameZh: '图片覆盖度', status: 'pass', targetZh: '12/12 张', evidenceCount: 12, evidence: { assetId: 'img-05', layer: 'subject' as const }, review: false },
  ];
  for (const qc of qcChecks) {
    advance(ctx, 0.3);
    out.push(
      ev(ctx, {
        kind: 'qc.result.created',
        titleZh: `QC 检查：${qc.nameZh} — 通过`,
        traceCategory: '质量检查',
        severity: 'success',
        evidenceRefs: [qc.evidence],
        metrics: { qcId: qc.id, qcName: qc.nameZh, qcStatus: qc.status, qcTarget: qc.targetZh, qcReason: qc.reasonZh ?? '', qcEvidence: qc.evidenceCount, qcReview: qc.review },
        resultRefs: { qcResultIds: [qc.id] },
      }),
    );
  }

  // F3：成本更新（实际成本）
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'cost.updated',
      titleZh: '实际成本：¥1.38（约 $0.19），低于预估',
      traceCategory: '成本',
      metrics: { actualCents: 19, deltaCents: -2, currency: 'USD' },
    }),
  );
  advance(ctx, 0.5);

  out.push(
    ev(ctx, {
      kind: 'observation.created',
      // F3-R3 §7：metrics.artifacts 语义 = 最终产物数（= artifactMetrics.final），非 total。
      // 文案明确「最终产物」，避免与 artifactMetrics.total=5 语义冲突。
      titleZh: '分析汇总：共 24 项发现、3 项普通风险、1 份最终产物（共 5 份中间+最终）',
      summaryZh: '3 项风险均为非阻断，0 项结构冲突，可在生成阶段处理',
      metrics: { findings: 24, risks: 3, artifacts: 1, blockingConflicts: 0 },
    }),
  );
  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'job.completed',
      titleZh: '任务已完成：竞品套图分析通过，可进入生成工作室',
      severity: 'success',
      metrics: { elapsedSeconds: Math.round(ctx.t), findings: 24, risks: 3, artifacts: 1 },
    }),
  );

  return { scenarioId: 'normal', jobId: ctx.jobId, events: out };
}
