/**
 * 右侧属性检查器（F2 §七）。
 * 4 Tab：当前图片 / 套图洞察 / Creative Recipe / 风险排除。
 * 紧凑 Tab 导航，不再只是一个长列表。
 */
import { useState } from 'react';
import type {
  CompetitorAnalysisState,
  CompetitorAsset,
  InspectorTab,
} from '@/types/competitor-analysis';
import {
  InheritanceLists,
  Section,
} from '@/components/competitor/AnalysisSummary';
import { ConfidenceBadge } from '@/components/competitor/ConfidenceBadge';
import { SuiteInsightsTab } from '@/components/competitor/SuiteInsightsTab';
import { CreativeRecipeTab } from '@/components/competitor/CreativeRecipeTab';
import { RiskExclusionTab } from '@/components/competitor/RiskExclusionTab';

interface InspectorPanelProps {
  state: CompetitorAnalysisState;
  selectedAssetId: string;
  /** F2：Recipe 完成度（来自事件流） */
  recipeCompletenessPct?: number;
  /** F2：点击洞察/风险关联图片 */
  onSelectAsset: (id: string) => void;
  /** F2：外部控制 Tab（如点击聚类切换到洞察） */
  activeTab?: InspectorTab;
  onTabChange?: (tab: InspectorTab) => void;
}

const TABS: { tab: InspectorTab; labelZh: string }[] = [
  { tab: 'current-image', labelZh: '当前图片' },
  { tab: 'suite-insights', labelZh: '套图洞察' },
  { tab: 'recipe', labelZh: 'Recipe' },
  { tab: 'risk-exclusion', labelZh: '风险排除' },
];

export function InspectorPanel({
  state,
  selectedAssetId,
  recipeCompletenessPct = 0,
  onSelectAsset,
  activeTab: externalTab,
  onTabChange,
}: InspectorPanelProps) {
  const [internalTab, setInternalTab] = useState<InspectorTab>('current-image');
  const activeTab = externalTab ?? internalTab;
  const setTab = (t: InspectorTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

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
      {/* Tab 导航 */}
      <nav className="flex shrink-0 border-b" style={{ borderColor: 'var(--gc-line)' }}>
        {TABS.map(({ tab, labelZh }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              data-testid={`inspector-tab-${tab}`}
              className="flex-1 py-2 text-center text-2xs transition-colors duration-snap"
              style={{
                color: isActive ? 'var(--gc-accent-blue)' : 'var(--gc-text-lo)',
                borderBottom: isActive ? '2px solid var(--gc-accent-blue)' : '2px solid transparent',
                background: isActive ? 'var(--gc-accent-blue-soft)' : 'transparent',
              }}
            >
              {labelZh}
            </button>
          );
        })}
      </nav>

      {/* Tab 内容 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'current-image' && <CurrentImageTab asset={asset} state={state} />}
        {activeTab === 'suite-insights' && (
          <SuiteInsightsTab
            insights={state.insights}
            assets={state.assets}
            onSelectAsset={onSelectAsset}
          />
        )}
        {activeTab === 'recipe' && (
          <CreativeRecipeTab
            recipe={state.recipe}
            completenessPct={recipeCompletenessPct}
          />
        )}
        {activeTab === 'risk-exclusion' && (
          <RiskExclusionTab
            riskExclusion={state.riskExclusion}
            onSelectAsset={onSelectAsset}
          />
        )}
      </div>
    </aside>
  );
}

/** 当前图片 Tab（F2 §7.1） */
function CurrentImageTab({
  asset,
  state,
}: {
  asset: CompetitorAsset;
  state: CompetitorAnalysisState;
}) {
  const vl = asset.visualLanguage;
  return (
    <>
      <Section title="当前图片分析">
        <div className="mb-2 flex items-center justify-between">
          <span className="gc-data text-2xs" style={{ color: 'var(--gc-accent-blue)' }}>
            {asset.filename}
          </span>
          {asset.confidence && <ConfidenceBadge confidence={asset.confidence} />}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <SummaryRow label="用途" value={asset.purposeZh} />
          <SummaryRow label="构图" value={asset.compositionZh} />
          <SummaryRow label="占比" value={`${asset.productRatioPct}%`} mono />
          <SummaryRow label="角度" value={asset.cameraAngleZh} />
          <SummaryRow label="背景" value={asset.backgroundZh} />
          <SummaryRow label="状态" value={asset.status} tone={asset.status === '待人工确认' ? 'amber' : 'green'} />
        </dl>
      </Section>

      <Section title="视觉语言">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <SummaryRow label="主光" value={vl.keyLightZh} />
          <SummaryRow label="轮廓光" value={vl.rimLightZh} />
          <SummaryRow label="色调" value={vl.toneZh} />
          <SummaryRow label="景深" value={vl.depthZh} />
        </dl>
      </Section>

      {/* 当前风险 */}
      <Section title="当前风险">
        {asset.risksZh.length === 0 ? (
          <span className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
            未检出风险
          </span>
        ) : (
          <ul className="flex flex-col gap-1">
            {asset.risksZh.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--gc-text-mid)' }}>
                <span className="mt-1 shrink-0" style={{ width: 5, height: 5, borderRadius: 9999, background: 'var(--gc-accent-amber)' }} />
                {r}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 套图级继承策略（折叠） */}
      <Section title="套图继承策略" defaultOpen={false}>
        <InheritanceLists inheritableZh={state.inheritableZh} prohibitedZh={state.prohibitedZh} />
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
  const color =
    tone === 'amber'
      ? 'var(--gc-accent-amber)'
      : tone === 'green'
        ? 'var(--gc-accent-green)'
        : 'var(--gc-text-mid)';
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
