import type { CompetitorAnalysisState } from '@/types/competitor-analysis';
import {
  AnalysisSummary,
  VisualLanguage,
  InheritanceLists,
  Section,
} from '@/components/competitor/AnalysisSummary';
import { CreativeRecipeDraftView } from '@/components/competitor/CreativeRecipeDraft';

/**
 * 右侧属性检查器（任务书 §6.4）。
 * 320–360px，分区：分析摘要 / 视觉语言 / 继承策略 / Creative Recipe 草案。
 * 使用分割线与背景层级组织，不堆叠圆角 Card（任务书 §7.3）。
 */
export function InspectorPanel({ state }: { state: CompetitorAnalysisState }) {
  return (
    <aside
      className="flex shrink-0 flex-col border-l"
      style={{
        width: 'var(--gc-inspector-width)',
        background: 'var(--gc-bg-app)',
        borderColor: 'var(--gc-line)',
      }}
    >
      <header
        className="flex shrink-0 items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--gc-line)' }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--gc-text-hi)' }}
        >
          属性检查器
        </span>
        <span
          className="gc-data text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          竞品分析 · 完成态
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnalysisSummary fields={state.summary} />
        <VisualLanguage fields={state.visualLanguage} />
        <InheritanceLists
          inheritableZh={state.inheritableZh}
          prohibitedZh={state.prohibitedZh}
        />
        <CreativeRecipeDraftView recipe={state.recipe} />

        {/* 待人工确认提示（OD-007：强制人工复核）*/}
        <Section title="质量结论" defaultOpen={true}>
          <div
            className="flex items-start gap-2 px-2.5 py-2"
            style={{
              background: 'var(--gc-accent-amber-soft)',
              border: '1px solid rgba(224,169,58,0.4)',
              borderRadius: 2,
            }}
          >
            <span
              className="mt-0.5 shrink-0"
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: 'var(--gc-accent-amber)',
              }}
            />
            <span
              className="text-2xs leading-relaxed"
              style={{ color: 'var(--gc-text-mid)' }}
            >
              {state.stats.pendingHumanReview} 项待人工确认：第 12 张参数图存在型号文字，
              商品结构判断置信度较低。请在生成工作室启用商品保真策略前完成复核。
            </span>
          </div>
        </Section>
      </div>
    </aside>
  );
}
