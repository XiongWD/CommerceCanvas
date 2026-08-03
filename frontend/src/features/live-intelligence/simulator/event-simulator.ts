/**
 * 确定性事件序列构造器（Scenario Builder）。
 *
 * 设计原则（任务书 §五）：
 *   1. 同一场景每次构造产生**完全相同**的事件序列（禁 Math.random）。
 *   2. sequence 严格递增，eventId 稳定可复现。
 *   3. occurredAt 由确定性偏移生成（模拟时间，非真实墙钟）。
 *   4. 客户可见字段经 withPresentation 映射层解析为中文。
 *
 * 这个 builder 是"事件源"的纯函数替代品；
 * EventSimulator（运行时）只负责按节奏分发这些事件，不发明事件。
 */

import type { LiveEventEnvelope, StageId } from '@/types/live-event';
import { withPresentation } from '../mappings/event-presentation-map';

/** 场景输出：完整事件序列 + 总模拟时长 */
export interface ScenarioScript {
  scenarioId: string;
  jobId: string;
  /** 事件序列（已含中文展示字段，sequence 递增） */
  events: LiveEventEnvelope[];
}

interface BuildCtx {
  jobId: string;
  /** 递增序号 */
  seq: number;
  /** 模拟时间（秒）累加器 */
  t: number;
}

/** 构造单个事件的输入：ev 自动补全 eventId/sequence/occurredAt/jobId。
 *  必填 kind/titleZh；其余可选；severity/traceCategory 由 withPresentation 默认补全。 */
export interface EventInput {
  kind: LiveEventEnvelope['kind'];
  titleZh: string;
  summaryZh?: string;
  stageId?: LiveEventEnvelope['stageId'];
  progress?: LiveEventEnvelope['progress'];
  metrics?: LiveEventEnvelope['metrics'];
  evidenceRefs?: LiveEventEnvelope['evidenceRefs'];
  artifactRefs?: LiveEventEnvelope['artifactRefs'];
  requiresAction?: boolean;
  replayed?: boolean;
  severity?: LiveEventEnvelope['severity'];
  traceCategory?: LiveEventEnvelope['traceCategory'];
  jobId?: string;
}

function ev(ctx: BuildCtx, partial: EventInput): LiveEventEnvelope {
  ctx.seq += 1;
  const base = new Date('2026-08-02T13:32:00Z').getTime();
  const occurredAt = new Date(base + ctx.t * 1000).toISOString();
  return withPresentation({
    eventId: `evt-${String(ctx.seq).padStart(3, '0')}`,
    sequence: ctx.seq,
    occurredAt,
    jobId: partial.jobId ?? ctx.jobId,
    kind: partial.kind,
    titleZh: partial.titleZh,
    summaryZh: partial.summaryZh,
    stageId: partial.stageId,
    progress: partial.progress,
    metrics: partial.metrics,
    evidenceRefs: partial.evidenceRefs,
    artifactRefs: partial.artifactRefs,
    requiresAction: partial.requiresAction,
    replayed: partial.replayed,
    severity: partial.severity,
    traceCategory: partial.traceCategory,
  });
}

/** 推进模拟时间（秒） */
function advance(ctx: BuildCtx, seconds: number) {
  ctx.t += seconds;
}

/**
 * 构造一个标准阶段的事件流：queued → started → (progress*) → completed。
 * progress 携带真实分母（determinate）或省略（indeterminate）。
 */
function emitStage(
  ctx: BuildCtx,
  out: LiveEventEnvelope[],
  stageId: StageId,
  opts: {
    durationSec: number;
    progress?: { current: number; total: number; unitZh?: string };
    /** 阶段内插入的观察/证据/风险事件 */
    inline?: (emit: (e: EventInput) => void) => void;
    /** 阶段完成后的总结事件（如里程碑） */
    onComplete?: (emit: (e: EventInput) => void) => void;
  },
) {
  out.push(ev(ctx, { kind: 'stage.queued', stageId, titleZh: '阶段排队' }));
  advance(ctx, 0.5);
  out.push(
    ev(ctx, {
      kind: 'stage.started',
      stageId,
      titleZh: '阶段开始',
      metrics: { activeNodes: 3 },
    }),
  );

  // 阶段内进度（如有真实分母，分步推进；否则 indeterminate 仅推送心跳）
  if (opts.progress) {
    const steps = 3;
    for (let i = 1; i <= steps; i++) {
      advance(ctx, opts.durationSec / steps);
      const current = Math.round((opts.progress.current * i) / steps);
      out.push(
        ev(ctx, {
          kind: 'stage.progress',
          stageId,
          titleZh: '阶段进度',
          progress: {
            mode: 'determinate',
            current,
            total: opts.progress.total,
            unitZh: opts.progress.unitZh,
          },
          metrics: { elapsedSeconds: Math.round(ctx.t), activeNodes: 3 },
        }),
      );
      // 在第一步后插入阶段内业务事件
      if (i === 1 && opts.inline) {
        opts.inline((p) => {
          advance(ctx, 0.4);
          out.push(ev(ctx, p));
        });
      }
    }
  } else {
    // indeterminate：仅推送心跳式进度（不带百分比）
    advance(ctx, opts.durationSec);
    out.push(
      ev(ctx, {
        kind: 'stage.progress',
        stageId,
        titleZh: '阶段进度',
        progress: { mode: 'indeterminate' },
        metrics: { elapsedSeconds: Math.round(ctx.t), activeNodes: 3 },
      }),
    );
    if (opts.inline) {
      opts.inline((p) => {
        advance(ctx, 0.4);
        out.push(ev(ctx, p));
      });
    }
  }

  out.push(
    ev(ctx, {
      kind: 'stage.completed',
      stageId,
      titleZh: '阶段完成',
      severity: 'success',
      metrics: { elapsedSeconds: Math.round(ctx.t) },
    }),
  );
  if (opts.onComplete) {
    opts.onComplete((p) => {
      advance(ctx, 0.3);
      out.push(ev(ctx, p));
    });
  }
}

export type { BuildCtx };
export { ev, advance, emitStage };
