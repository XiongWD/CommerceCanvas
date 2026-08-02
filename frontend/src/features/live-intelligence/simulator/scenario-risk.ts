/**
 * 场景 B：高风险待人工确认（任务书 §六）。
 *
 * 关键差异：检测到竞品为入耳式结构，自有商品为开放式，存在商品结构冲突。
 *   - 检测到竞品 Logo（与 normal 一致）
 *   - 商品结构与 Product Master 不一致（入耳式 vs 开放式）
 *   - 系统保留构图和光线，禁止继承商品结构和功能描述
 *   - build_recipe 阶段进入"待人工确认"
 *   - 生成部分结果，但不宣称全部通过
 * 最终状态：分析完成 · 等待人工确认（非全绿）。
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
      // 关键风险：商品结构不一致
      emit({
        kind: 'warning.created',
        stageId: 'segment_subject',
        titleZh: '商品结构与 Product Master 不一致',
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
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '检测到 7 处竞品 Logo 或型号区域',
        summaryZh: '已加入排除清单',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-01', layer: 'logo', regionId: 'ev-01-logo' }],
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
        summaryZh: '7 处品牌资产 · 2 项结构冲突',
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

  // build_recipe 阶段进入"待人工确认"——产出草案但不完成
  out.push(
    ev(ctx, {
      kind: 'stage.queued',
      stageId: 'build_recipe',
      titleZh: '阶段排队',
    }),
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
  out.push(
    ev(ctx, {
      kind: 'artifact.created',
      stageId: 'build_recipe',
      titleZh: '套图 Creative Recipe 草案已部分生成，等待人工确认',
      summaryZh: '草案 v1 · 待确认',
      artifactRefs: ['recipe-draft-v1-risk'],
      requiresAction: true,
      metrics: { recipeField: 'purpose' },
    }),
  );
  advance(ctx, 1);
  // 阶段标记 awaiting_review（非 completed，非全绿）
  out.push(
    ev(ctx, {
      kind: 'warning.created',
      stageId: 'build_recipe',
      titleZh: '检测到商品结构冲突，本阶段进入待人工确认',
      summaryZh: '请在生成工作室启用商品保真策略前完成复核',
      severity: 'warning',
      requiresAction: true,
    }),
  );

  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'observation.created',
      titleZh: '分析汇总：24 项发现、3 项风险（含 1 项结构冲突）、1 份待确认产物',
      summaryZh: '结构冲突为阻断项，需人工复核后才能进入生成',
      metrics: { findings: 24, risks: 3, artifacts: 1 },
    }),
  );
  advance(ctx, 1);
  out.push(
    ev(ctx, {
      kind: 'job.completed',
      titleZh: '任务已完成部分分析：等待人工确认商品结构冲突',
      summaryZh: '分析完成 · 等待人工确认',
      requiresAction: true,
      metrics: { elapsedSeconds: Math.round(ctx.t) },
    }),
  );

  return { scenarioId: 'risk', jobId: ctx.jobId, events: out };
}
