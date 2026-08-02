import type { CompetitorAnalysisState, CompetitorAsset } from '@/types/competitor-analysis';
import {
  AnalysisSummary,
  VisualLanguage,
  InheritanceLists,
  Section,
} from '@/components/competitor/AnalysisSummary';
import { CreativeRecipeDraftView } from '@/components/competitor/CreativeRecipeDraft';

/**
 * 右侧属性检查器（任务书 §6.4 / P3 同步）。
 * 320–360px，明确区分两块：
 *   1. 「当前图片分析」— 消费选中资产的 per-asset 字段，点击缩略图即同步更新。
 *   2. 「套图整体策略」— 消费套图级摘要、视觉语言、继承策略、套图 Creative Recipe。
 * 使用分割线与背景层级组织，不堆叠圆角 Card（任务书 §7.3）。
 */
interface InspectorPanelProps {
  state: CompetitorAnalysisState;
  selectedAssetId: string;
}

export function InspectorPanel({ state, selectedAssetId }: InspectorPanelProps) {
  const asset = state.assets.find((a) => a.id === selectedAssetId) ?? state.assets[0];

  return (
    <aside
      data-testid="inspector-panel"
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
        {/* —— 当前图片分析：跟随选中资产同步（P3）—— */}
        <CurrentAssetAnalysis asset={asset} />

        {/* 分组分隔：当前图片 vs 套图策略（P3 §4） */}
        <div
          className="px-4 py-2"
          style={{ background: 'var(--gc-bg-base)' }}
        >
          <span className="gc-section-label">套图整体策略</span>
        </div>

        {/* —— 套图级摘要 / 视觉语言 / 继承策略 / Creative Recipe —— */}
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
              className="text-xs leading-relaxed"
              style={{ color: 'var(--gc-text-mid)' }}
            >
              套图共 {state.stats.pendingHumanReview} 项待人工确认，涉及场景、卖点、
              细节与参数图。请在生成工作室启用商品保真策略前完成复核。
            </span>
          </div>
        </Section>
      </div>
    </aside>
  );
}

/**
 * 当前图片分析（P3）：消费选中资产的 per-asset 字段。
 * 点击左侧任意缩略图或底部缩略图条后，本区立即同步更新。
 */
function CurrentAssetAnalysis({ asset }: { asset: CompetitorAsset }) {
  const vl = asset.visualLanguage;
  return (
    <>
      {/* 当前图片标题条：明确这是「当前选中」单张 */}
      <div
        className="flex items-center justify-between px-4 pb-2 pt-3"
        style={{ background: 'var(--gc-bg-elev-1)' }}
      >
        <span className="gc-section-label">当前图片分析</span>
        <span
          className="gc-data text-2xs"
          style={{ color: 'var(--gc-accent-blue)' }}
        >
          {asset.filename}
        </span>
      </div>

      <Section title="分析摘要">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <SummaryRow label="图片用途" value={asset.purposeZh} />
          <SummaryRow label="构图模式" value={asset.compositionZh} />
          <SummaryRow label="商品占比" value={`${asset.productRatioPct}%`} mono />
          <SummaryRow label="镜头角度" value={asset.cameraAngleZh} />
          <SummaryRow label="背景类型" value={asset.backgroundZh} />
          <SummaryRow
            label="分析状态"
            value={asset.status}
            tone={asset.status === '待人工确认' ? 'amber' : 'green'}
          />
        </dl>
      </Section>

      <Section title="视觉语言">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <SummaryRow label="主光" value={vl.keyLightZh} />
          <SummaryRow label="轮廓光" value={vl.rimLightZh} />
          <SummaryRow label="色调" value={vl.toneZh} />
          <SummaryRow label="景深" value={vl.depthZh} />
        </dl>
      </Section>

      {/* 当前图片的风险项（与 riskCount 对应，P3 §1）*/}
      <Section title="风险项">
        {asset.risksZh.length === 0 ? (
          <span className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
            当前图片未检出风险
          </span>
        ) : (
          <ul className="flex flex-col gap-1">
            {asset.risksZh.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs"
                style={{ color: 'var(--gc-text-mid)' }}
              >
                <span
                  className="mt-1 shrink-0"
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 9999,
                    background: 'var(--gc-accent-amber)',
                  }}
                />
                {r}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: 'amber' | 'green';
}) {
  const color = tone === 'amber' ? 'var(--gc-accent-amber)' : tone === 'green' ? 'var(--gc-accent-green)' : 'var(--gc-text-mid)';
  return (
    <>
      <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
        {label}
      </dt>
      <dd className={mono ? 'gc-data text-xs' : 'text-xs'} style={{ color }}>
        {value}
      </dd>
    </>
  );
}
