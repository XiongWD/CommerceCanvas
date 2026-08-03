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
        titleZh: '已识别图片用途：主图 1 张、场景图 4 张、卖点图 5 张、细节图 1 张、参数图 1 张',
        summaryZh: '4 类用途分类完成',
      });
      emit({
        kind: 'evidence.created',
        stageId: 'classify_purpose',
        titleZh: '其中 5 张使用右侧主体、左侧文案构图',
        summaryZh: '可定位到对应图片',
        evidenceRefs: [{ assetId: 'img-01', layer: 'subject' }],
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
      });
      // 风险 2：高密度文案布局需要重新排版
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '卖点图存在高密度文案布局，生成时需要重新排版',
        summaryZh: '非阻断：可在生成阶段处理',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-08', layer: 'subject' }],
      });
      // 风险 3：参数或功能声明必须以 Product Master 为准
      emit({
        kind: 'warning.created',
        stageId: 'detect_text_logo',
        titleZh: '部分参数图包含功能声明，必须以 Product Master 为准',
        summaryZh: '非阻断：生成时锁定自有产品参数',
        severity: 'warning',
        evidenceRefs: [{ assetId: 'img-12', layer: 'logo' }],
      });
      emit({
        kind: 'action.created',
        stageId: 'detect_text_logo',
        titleZh: '已将 7 处竞品标识加入禁止继承清单',
        summaryZh: '生成时不会复用这些区域',
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
        titleZh: '聚类出 4 种构图模式：右侧主体、居中对称、俯视阵列、生活方式',
        summaryZh: '4 类构图',
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
        titleZh: '已归纳卖点信息顺序：续航、佩戴、降噪、连接、外观',
        summaryZh: '可作为页面节奏参考',
      });
    },
  });

  // 阶段 7：形成套图 Creative Recipe —— R1：7 字段全部标记
  emitStage(ctx, out, 'build_recipe', {
    durationSec: 6,
    inline: (emit) => {
      // R1：逐字段标记，最终 7/7
      emit({
        kind: 'observation.created',
        stageId: 'build_recipe',
        titleZh: 'Recipe 字段补全：用途、画布、商品位置',
        metrics: { recipeFields: ['purpose', 'canvas', 'position'] },
      });
      emit({
        kind: 'observation.created',
        stageId: 'build_recipe',
        titleZh: 'Recipe 字段补全：商品占比、背景、光线',
        metrics: { recipeFields: ['ratio', 'background', 'lighting'] },
      });
      emit({
        kind: 'artifact.created',
        stageId: 'build_recipe',
        titleZh: '套图 Creative Recipe 草案已生成，可提前查看',
        summaryZh: '草案 v1',
        artifactRefs: ['recipe-draft-v1'],
        metrics: { recipeFields: ['textSafetyZone'] },
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
  out.push(
    ev(ctx, {
      kind: 'observation.created',
      titleZh: '分析汇总：共 24 项发现、3 项普通风险、1 份产物',
      summaryZh: '3 项风险均为非阻断，0 项结构冲突，可在生成阶段处理',
      metrics: { findings: 24, risks: 3, artifacts: 1 },
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
