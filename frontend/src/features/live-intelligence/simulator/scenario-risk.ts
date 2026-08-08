/**
 * 场景 B：高风险待人工确认（R1.2：补齐 resultRefs）。
 *
 * 所有产生业务结果的事件均携带 resultRefs，ID 与 mock 数据对齐。
 * 终态：awaiting_review（非全绿）。
 */

import type { LiveEventEnvelope } from '@/types/live-event';
import type { ScenarioScript } from './event-simulator';
import { advance, emitStage, ev } from './event-simulator';

export function buildRiskScenario(): ScenarioScript {
  const ctx = { jobId: 'job-risk-002', seq: 0, t: 0 };
  const out: LiveEventEnvelope[] = [];

  out.push(
    ev(ctx, {
      kind: 'session.started',
      jobId: ctx.jobId,
      titleZh: '已创建竞品分析任务，正在校验 12 张图片',
      summaryZh: '演示运行 · 高风险场景 · 模拟事件流',
      metrics: { activeNodes: 3, totalImages: 12 },
    }),
  );
  advance(ctx, 1);

  emitStage(ctx, out, 'validate_images', {
    durationSec: 5,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'validate_images',
        titleZh: '12 张图片已完成格式与尺寸校验',
      });
    },
  });

  emitStage(ctx, out, 'classify_purpose', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'classify_purpose',
        titleZh: '已识别图片用途：主图 1 张、场景图 4 张、卖点图 5 张、细节图 1 张、参数图 1 张',
        resultRefs: { classifiedAssetIds: ['img-01', 'img-02', 'img-03', 'img-04', 'img-05', 'img-06', 'img-07', 'img-08', 'img-09', 'img-10', 'img-11', 'img-12'] },
      });
      // F3-R2 P0-1：用途分类结果由 classify_purpose 真实生产
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
        resultRefs: { insightIds: ['ins-usage'] },
      });
    },
  });

  emitStage(ctx, out, 'segment_subject', {
    durationSec: 5,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'warning.created',
        stageId: 'segment_subject',
        titleZh: '商品结构与 Product Master 不一致（阻断）',
        summaryZh: '竞品为入耳式结构，自有商品 OW-A31-BLK 为开放式',
        severity: 'warning',
        requiresAction: true,
        evidenceRefs: [{ assetId: 'img-06', layer: 'subject' }],
        resultRefs: { riskItemIds: ['risk-inear'] },
      });
      emit({
        kind: 'decision.created',
        stageId: 'segment_subject',
        titleZh: '系统保留构图与光线，禁止继承商品结构和功能描述',
        summaryZh: '入耳式结构、竞品独有功能描述已加入禁止继承清单',
        resultRefs: { riskItemIds: ['risk-exclusive-feature'] },
      });
      // F3-R2 P0-1：Evidence 索引由 segment_subject 真实生产
      emit({
        kind: 'artifact.created',
        stageId: 'segment_subject',
        titleZh: 'Evidence 索引',
        summaryZh: '商品结构与竞品标识证据索引',
        artifactRefs: ['art-evidence'],
        metrics: {
          artifactType: 'Evidence 索引',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-06', 'img-01'],
          parentArtifactIds: ['art-purpose'],
        },
      });
    },
  });

  emitStage(ctx, out, 'detect_text_logo', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '检测到 7 处竞品 Logo 或型号区域',
        summaryZh: '已加入排除清单',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-01', layer: 'logo', regionId: 'ev-01-logo' }],
        resultRefs: { riskItemIds: ['risk-logo', 'risk-model'] },
      });
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '卖点图存在高密度文案布局，生成时需要重新排版',
        summaryZh: '非阻断',
        severity: 'warning',
        resultRefs: { riskItemIds: ['risk-packaging'] },
      });
      emit({
        kind: 'action.created',
        stageId: 'detect_text_logo',
        titleZh: '已将竞品 Logo、型号、包装文字加入禁止继承清单',
      });
      // F3-R2 P0-1：风险排除清单由 detect_text_logo 真实生产
      emit({
        kind: 'artifact.created',
        stageId: 'detect_text_logo',
        titleZh: '风险排除清单',
        summaryZh: '7 处品牌资产 + 结构阻断排除',
        artifactRefs: ['art-risk-list'],
        metrics: {
          artifactType: '风险排除清单',
          version: 'v1',
          artifactStatus: '已生成',
          artifactRole: 'intermediate',
          linkedAssetIds: ['img-01', 'img-06', 'img-12'],
          parentArtifactIds: ['art-evidence'],
        },
        resultRefs: { riskItemIds: ['risk-logo', 'risk-model', 'risk-packaging', 'risk-inear', 'risk-exclusive-feature'] },
      });
    },
    onComplete: (emit) => {
      emit({
        kind: 'milestone.reached',
        titleZh: '风险排除清单建立',
        summaryZh: '7 处品牌资产 · 2 项普通风险 · 1 项结构阻断',
        severity: 'success',
        metrics: { milestoneId: 'risk_list_built' },
        resultRefs: { riskItemIds: ['fact-battery', 'fact-waterproof', 'fact-material', 'fact-compat', 'fact-size', 'safe-composition', 'safe-light', 'safe-background', 'safe-rhythm', 'safe-textzone'] },
      });
    },
  });

  emitStage(ctx, out, 'extract_composition', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      emit({
        kind: 'observation.created',
        stageId: 'extract_composition',
        titleZh: '聚类出 2 种构图模式：右侧主体、中心对称',
        summaryZh: '构图与光线可继承',
        resultRefs: { clusterIds: ['cluster-a', 'cluster-b'], insightIds: ['ins-cluster'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'extract_composition',
        titleZh: '聚类出另外 2 种构图模式：局部特写、参数结构',
        summaryZh: '5 种光线模式',
        resultRefs: { clusterIds: ['cluster-c', 'cluster-d'], insightIds: ['ins-light', 'ins-color'] },
      });
      emit({
        kind: 'decision.created',
        stageId: 'extract_composition',
        titleZh: '保留构图方向、光线结构、背景气氛、卖点顺序、页面节奏',
        summaryZh: '禁止继承：竞品 Logo、型号、包装文字、入耳式结构、竞品独有功能描述',
      });
      // F3-R2 P0-1：构图聚类由 extract_composition 真实生产
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

  emitStage(ctx, out, 'summarize_selling_points', {
    durationSec: 5,
    inline: (emit) => {
      emit({
        kind: 'decision.created',
        stageId: 'summarize_selling_points',
        titleZh: '已归纳卖点：舒适性、稳定佩戴、声音体验',
        summaryZh: '续航、佩戴可继承',
        resultRefs: { sellingPointIds: ['sp-comfort', 'sp-stability', 'sp-sound'] },
      });
      emit({
        kind: 'decision.created',
        stageId: 'summarize_selling_points',
        titleZh: '已归纳卖点：续航、防水、参数与兼容性（需人工确认）',
        summaryZh: '降噪参数需复核',
        requiresAction: true,
        resultRefs: { sellingPointIds: ['sp-battery', 'sp-waterproof', 'sp-spec'], insightIds: ['ins-rhythm', 'ins-material', 'ins-safe-zone'] },
      });
    },
  });

  // build_recipe：部分完成（4/7）→ 显式 awaiting_review
  out.push(
    ev(ctx, { kind: 'stage.queued', stageId: 'build_recipe', titleZh: '阶段排队' }),
  );
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'stage.started',
      stageId: 'build_recipe',
      titleZh: '阶段开始',
      metrics: { activeNodes: 3 },
    }),
  );
  advance(ctx, 4);
  out.push(
    ev(ctx, {
      kind: 'stage.progress',
      stageId: 'build_recipe',
      titleZh: '阶段进度',
      progress: { mode: 'indeterminate' },
      metrics: { elapsedSeconds: Math.round(ctx.t), activeNodes: 3 },
    }),
  );
  advance(ctx, 1);
  // F3-R2 P0-1：上游 Artifact 已由各自阶段真实生产。本阶段只生产最终 Recipe（待确认版本），
  // 其 parentArtifactIds 指向真实上游（构图聚类 + 风险排除清单），可对账 lineage。
  // Recipe 部分完成：4/7（purpose/canvas/position/ratio）
  out.push(
    ev(ctx, {
      kind: 'artifact.created',
      stageId: 'build_recipe',
      titleZh: '套图 Creative Recipe 草案已部分生成，等待人工确认',
      summaryZh: '草案 v1 · 待确认 · 4/7 字段',
      artifactRefs: ['recipe-draft-v1-risk'],
      requiresAction: true,
      metrics: {
        recipeFields: ['purpose', 'canvas', 'position', 'ratio'],
        artifactType: 'Creative Recipe',
        version: 'v1',
        artifactStatus: '待确认',
        artifactRole: 'final',
        linkedAssetIds: ['img-06'],
        parentArtifactIds: ['art-clusters', 'art-risk-list'],
      },
      resultRefs: { recipeFields: ['purpose', 'canvas', 'position', 'ratio'] },
    }),
  );
  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'stage.awaiting_review',
      stageId: 'build_recipe',
      titleZh: '检测到商品结构阻断，build_recipe 阶段进入待人工确认',
      summaryZh: '请在生成工作室启用商品保真策略前完成复核',
      severity: 'warning',
      requiresAction: true,
    }),
  );

  advance(ctx, 1);

  // F3：成本预估（均衡策略）
  out.push(
    ev(ctx, {
      kind: 'cost.estimate.created',
      titleZh: '成本预估：均衡策略，预计 ¥1.50（约 $0.21）',
      traceCategory: '成本',
      metrics: { estimatedCents: 21, currency: 'USD' },
    }),
  );
  advance(ctx, 0.5);

  // F3-R1：QC 检查（结构冲突 → 阻断）。差异化 Evidence：每项指向对应类型，非全部同一 subject。
  // qcReview 必须是 boolean（R0 错用 string 'true'/'false'，导致 requiresReview 永远 false）。
  const riskQC = [
    { id: 'qc-structure-risk', nameZh: '商品结构一致性', status: 'block', targetZh: '入耳式 vs 开放式', reasonZh: '竞品为入耳式结构，与 Product Master 开放式不一致', evidenceCount: 1, evidence: { assetId: 'img-06', layer: 'subject' as const }, review: true },
    { id: 'qc-logo-risk', nameZh: 'Logo/型号排除', status: 'pass', targetZh: '7 处竞品标识', reasonZh: undefined, evidenceCount: 7, evidence: { assetId: 'img-01', layer: 'logo' as const, regionId: 'ev-01-logo' }, review: false },
    { id: 'qc-master-risk', nameZh: 'Product Master 事实一致性', status: 'warning', targetZh: 'SKU OW-A31-BLK', reasonZh: '降噪参数需复核', evidenceCount: 3, evidence: { assetId: 'img-12', layer: 'text' as const }, review: true },
    { id: 'qc-recipe-risk', nameZh: 'Recipe 完整度', status: 'warning', targetZh: '4/7 字段', reasonZh: 'Recipe 部分完成，等待人工确认', evidenceCount: 4, evidence: { assetId: 'img-01', layer: 'safe' as const }, review: true },
    { id: 'qc-coverage-risk', nameZh: '图片覆盖度', status: 'pass', targetZh: '12/12 张', reasonZh: undefined, evidenceCount: 12, evidence: { assetId: 'img-05', layer: 'subject' as const }, review: false },
  ];
  for (const qc of riskQC) {
    advance(ctx, 0.3);
    out.push(
      ev(ctx, {
        kind: 'qc.result.created',
        titleZh: `QC 检查：${qc.nameZh} — ${qc.status === 'pass' ? '通过' : qc.status === 'warning' ? '待检查' : '阻断'}`,
        traceCategory: '质量检查',
        severity: qc.status === 'pass' ? 'success' : qc.status === 'warning' ? 'warning' : 'error',
        evidenceRefs: [qc.evidence],
        metrics: { qcId: qc.id, qcName: qc.nameZh, qcStatus: qc.status, qcTarget: qc.targetZh, qcReason: qc.reasonZh ?? '', qcEvidence: qc.evidenceCount, qcReview: qc.review },
        resultRefs: { qcResultIds: [qc.id] },
      }),
    );
  }

  // F3：路由升级（均衡 → 商品保真优先）
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'route.upgraded',
      titleZh: '路由升级：均衡 → 商品保真优先',
      summaryZh: '低成本分析路径结果不充分，系统升级到商品保真策略',
      traceCategory: '系统',
      severity: 'warning',
      metrics: {
        fromStrategy: '均衡', toStrategy: '商品保真优先',
        reasonZh: '商品结构冲突导致均衡策略结果不充分',
        estimatedCostDeltaCents: 15, estimatedTimeDeltaSeconds: 12,
      },
    }),
  );

  // F3：成本更新（升级后实际成本）
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'cost.updated',
      titleZh: '实际成本：¥2.58（约 $0.36），因路由升级增加',
      traceCategory: '成本',
      metrics: { actualCents: 36, deltaCents: 15, currency: 'USD' },
    }),
  );

  // F3：节点重试
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'retry.scheduled',
      titleZh: '第 1 次重试已排期：build_recipe',
      summaryZh: '原因：商品结构阻断，自动重试 1 次',
      traceCategory: '重试',
      stageId: 'build_recipe',
      severity: 'warning',
      metrics: { attempt: 1, maxAttempts: 2, reasonCode: 'STRUCTURE_CONFLICT', reasonZh: '商品结构冲突导致自动重试' },
    }),
  );
  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'retry.started',
      titleZh: '第 1 次重试开始：商品保真优先策略',
      traceCategory: '重试',
      stageId: 'build_recipe',
      metrics: { attempt: 1, maxAttempts: 2, reasonCode: 'STRUCTURE_CONFLICT', reasonZh: '商品保真策略重试' },
    }),
  );
  advance(ctx, 2);
  out.push(
    ev(ctx, {
      kind: 'retry.completed',
      titleZh: '第 1 次重试完成：结构冲突仍存在',
      summaryZh: '重试后结构冲突未被自动解决，进入人工确认',
      traceCategory: '重试',
      stageId: 'build_recipe',
      severity: 'warning',
      metrics: { attempt: 1, maxAttempts: 2, reasonCode: 'STRUCTURE_CONFLICT', reasonZh: '重试后冲突仍存在' },
    }),
  );

  // F3：人工审核请求
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'human.review.requested',
      titleZh: '需要人工审核：商品结构阻断',
      summaryZh: '请在生成工作室启用商品保真策略前确认结构差异',
      traceCategory: '系统',
      requiresAction: true,
    }),
  );
  advance(ctx, 0.5);

  out.push(
    ev(ctx, {
      kind: 'observation.created',
      titleZh: '分析汇总：24 项发现、3 项风险（含 1 项结构阻断）、1 份待确认产物',
      summaryZh: '结构阻断为阻断项，需人工复核后才能进入生成',
      metrics: { findings: 24, risks: 3, artifacts: 1, blockingConflicts: 1 },
    }),
  );
  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'job.completed',
      titleZh: '任务已完成部分分析：等待人工确认商品结构阻断',
      summaryZh: '分析完成 · 等待人工确认',
      requiresAction: true,
      metrics: { elapsedSeconds: Math.round(ctx.t), findings: 24, risks: 3, artifacts: 1 },
    }),
  );

  return { scenarioId: 'risk', jobId: ctx.jobId, events: out };
}
