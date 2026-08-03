/**
 * 场景 B：高风险待人工确认（R1 修复）。
 *
 * R1 修复：
 *   - 1 项商品结构阻断（入耳式 vs 开放式）+ 2 项普通风险 = 共 3 风险
 *   - build_recipe 阶段通过 stage.awaiting_review 事件显式进入 awaiting_review
 *   - Recipe 部分完成（4/7：purpose/canvas/position/ratio），非 7/7
 *   - summaryMetrics 与文案一致（findings=24, risks=3, artifacts=1, blockingConflicts=1）
 *   - 产物标记待确认
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

  emitStage(ctx, out, 'segment_subject', {
    durationSec: 5,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      // 风险 1（阻断）：商品结构不一致 —— 1 项 blockingConflicts
      emit({
        kind: 'warning.created',
        stageId: 'segment_subject',
        titleZh: '商品结构与 Product Master 不一致（阻断）',
        summaryZh: '竞品为入耳式结构，自有商品 OW-A31-BLK 为开放式',
        severity: 'warning',
        requiresAction: true,
        evidenceRefs: [{ assetId: 'img-06', layer: 'subject' }],
      });
      emit({
        kind: 'decision.created',
        stageId: 'segment_subject',
        titleZh: '系统保留构图与光线，禁止继承商品结构和功能描述',
        summaryZh: '入耳式结构、竞品独有功能描述已加入禁止继承清单',
      });
    },
  });

  emitStage(ctx, out, 'detect_text_logo', {
    durationSec: 6,
    progress: { current: 12, total: 12, unitZh: '张' },
    inline: (emit) => {
      // 风险 2：竞品 Logo
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '检测到 7 处竞品 Logo 或型号区域',
        summaryZh: '已加入排除清单',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-01', layer: 'logo', regionId: 'ev-01-logo' }],
      });
      // 风险 3：高密度文案
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '卖点图存在高密度文案布局，生成时需要重新排版',
        summaryZh: '非阻断',
        severity: 'warning',
      });
      emit({
        kind: 'action.created',
        stageId: 'detect_text_logo',
        titleZh: '已将竞品 Logo、型号、包装文字加入禁止继承清单',
      });
    },
    onComplete: (emit) => {
      emit({
        kind: 'milestone.reached',
        titleZh: '风险排除清单建立',
        summaryZh: '7 处品牌资产 · 2 项普通风险 · 1 项结构阻断',
        severity: 'success',
        metrics: { milestoneId: 'risk_list_built' },
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
        titleZh: '聚类出 4 种构图模式、5 种可复用光线模式',
        summaryZh: '构图与光线可继承',
      });
      emit({
        kind: 'decision.created',
        stageId: 'extract_composition',
        titleZh: '保留构图方向、光线结构、背景气氛、卖点顺序、页面节奏',
        summaryZh: '禁止继承：竞品 Logo、型号、包装文字、入耳式结构、竞品独有功能描述',
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
        titleZh: '已归纳卖点顺序，但部分卖点依赖竞品独有功能，需人工确认',
        summaryZh: '续航、佩戴可继承；降噪参数需复核',
        requiresAction: true,
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
  // Recipe 部分完成：4/7（purpose/canvas/position/ratio）
  out.push(
    ev(ctx, {
      kind: 'artifact.created',
      stageId: 'build_recipe',
      titleZh: '套图 Creative Recipe 草案已部分生成，等待人工确认',
      summaryZh: '草案 v1 · 待确认 · 4/7 字段',
      artifactRefs: ['recipe-draft-v1-risk'],
      requiresAction: true,
      metrics: { recipeFields: ['purpose', 'canvas', 'position', 'ratio'] },
    }),
  );
  advance(ctx, 1);
  // R1：显式 stage.awaiting_review 事件
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
