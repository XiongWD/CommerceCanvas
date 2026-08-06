/**
 * 右侧属性检查器（F2-R1 §七）。
 * 4 Tab + 投影驱动渐进显示 + Recipe 审核按钮（接受/待调整/恢复/查看依据）。
 * 审核状态按 sessionKey 隔离（restart/switchScenario 重置）。
 */
import { useState, useEffect } from 'react';
import type {
  CompetitorAnalysisState,
  CompetitorAsset,
  InspectorTab,
  RiskExclusionItem,
  SuiteInsight,
} from '@/types/competitor-analysis';
import { InheritanceLists, Section } from '@/components/competitor/AnalysisSummary';
import { ConfidenceBadge } from '@/components/competitor/ConfidenceBadge';
import { SuiteInsightsTab } from '@/components/competitor/SuiteInsightsTab';
import { RiskExclusionTab } from '@/components/competitor/RiskExclusionTab';
import type { CompetitorAnalysisProjection } from '@/features/competitor-analysis/state/competitor-analysis-projection';
import type { RecipeFieldKey } from '@/features/competitor-analysis/state/competitor-analysis-projection';
import type { LiveIntelligenceState } from '@/features/live-intelligence/state/live-intelligence-state';
import type { EvidenceFocus } from '@/features/live-intelligence/useLiveIntelligence';

interface InspectorPanelProps {
  state: CompetitorAnalysisState;
  selectedAssetId: string;
  recipeCompletenessPct?: number;
  onSelectAsset: (id: string) => void;
  activeTab?: InspectorTab;
  onTabChange?: (tab: InspectorTab) => void;
  projection: CompetitorAnalysisProjection;
  sessionKey: string;
  liveState: LiveIntelligenceState;
  visibleInsights: SuiteInsight[];
  visibleRiskItems: RiskExclusionItem[];
  onFocusEvidence: (f: EvidenceFocus) => void;
  /** F2-R1.2：风险→Evidence→轨迹 */
  onNavigateRisk?: (riskItemId: string) => void;
  /** F2-R1.2：Recipe→来源事件 */
  onNavigateRecipe?: (field: RecipeFieldKey) => void;
  selectedRiskItemId?: string | null;
  selectedRecipeField?: RecipeFieldKey | null;
  /** F2-R1.3：选中聚类 ID（按聚类过滤洞察） */
  selectedClusterId?: string | null;
  /** F2-R1.3：选中卖点 ID（显示卖点详情） */
  selectedSellingPointId?: string | null;
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
  projection,
  sessionKey,
  visibleInsights,
  visibleRiskItems,
  onNavigateRisk,
  onNavigateRecipe,
  selectedRiskItemId,
  selectedRecipeField,
  selectedClusterId,
  selectedSellingPointId,
}: InspectorPanelProps) {
  const [internalTab, setInternalTab] = useState<InspectorTab>('current-image');
  const activeTab = externalTab ?? internalTab;
  const setTab = (t: InspectorTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  const asset = state.assets.find((a) => a.id === selectedAssetId) ?? state.assets[0];

  // 风险排除：按投影分组（可见项分为 prohibited/factCheck/safe）
  const visibleRiskExclusion = {
    prohibited: visibleRiskItems.filter((r) => r.category === 'prohibited'),
    factCheck: visibleRiskItems.filter((r) => r.category === 'fact-check'),
    safe: visibleRiskItems.filter((r) => r.category === 'safe'),
  };

  return (
    <aside
      data-testid="inspector-panel"
      className="flex shrink-0 flex-col border-l"
      style={{ width: 'var(--gc-inspector-width)', background: 'var(--gc-bg-app)', borderColor: 'var(--gc-line)' }}
    >
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'current-image' && (
          <CurrentImageTab asset={asset} state={state} projection={projection} />
        )}
        {activeTab === 'suite-insights' && (
          selectedSellingPointId ? (
            <SellingPointDetail
              spId={selectedSellingPointId}
              sellingPoints={state.sellingPoints}
              assets={state.assets}
              onSelectAsset={onSelectAsset}
            />
          ) : (
            <SuiteInsightsTab
              insights={
                selectedClusterId
                  ? visibleInsights.filter((i) => {
                      // R1.3：按聚类过滤洞察 — 聚类 ID 首字母匹配洞察 ID 或 assetIds 重叠
                      const cluster = state.clusters.find((c) => c.id === selectedClusterId);
                      if (!cluster) return visibleInsights;
                      return i.assetIds.some((aid) => cluster.assetIds.includes(aid));
                    })
                  : visibleInsights
              }
              assets={state.assets}
              onSelectAsset={onSelectAsset}
            />
          )
        )}
        {activeTab === 'recipe' && (
          <CreativeRecipeTabR1
            recipe={state.recipe}
            completenessPct={recipeCompletenessPct}
            projection={projection}
            sessionKey={sessionKey}
            onNavigateRecipe={onNavigateRecipe}
            selectedRecipeField={selectedRecipeField}
          />
        )}
        {activeTab === 'risk-exclusion' && (
          <RiskExclusionTab
            riskExclusion={visibleRiskExclusion}
            onSelectAsset={onSelectAsset}
            onNavigateRisk={onNavigateRisk}
            selectedRiskItemId={selectedRiskItemId}
          />
        )}
      </div>
    </aside>
  );
}

/** 当前图片 Tab（投影驱动：未分析的资产不显示结论） */
function CurrentImageTab({
  asset,
  state,
  projection,
}: {
  asset: CompetitorAsset;
  state: CompetitorAnalysisState;
  projection: CompetitorAnalysisProjection;
}) {
  const isClassified = projection.classifiedAssetIds.includes(asset.id);
  const vl = asset.visualLanguage;

  if (!isClassified && !projection.isTerminal) {
    return (
      <Section title="当前图片分析">
        <div className="px-2 py-3 text-center text-xs" style={{ color: 'var(--gc-text-faint)' }}>
          {projection.isIdle ? '等待开始分析' : '该图片尚未分析'}
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section title="当前图片分析">
        <div className="mb-2 flex items-center justify-between">
          <span className="gc-data text-2xs" style={{ color: 'var(--gc-accent-blue)' }}>{asset.filename}</span>
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
      <Section title="当前风险">
        {asset.risksZh.length === 0 ? (
          <span className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>未检出风险</span>
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
      <Section title="套图继承策略" defaultOpen={false}>
        <InheritanceLists inheritableZh={state.inheritableZh} prohibitedZh={state.prohibitedZh} />
      </Section>
    </>
  );
}

/** Recipe Tab R1：渐进显示 + 明确审核按钮 + 状态按 sessionKey 隔离 */
function CreativeRecipeTabR1({
  recipe,
  completenessPct,
  projection,
  sessionKey,
  onNavigateRecipe,
  selectedRecipeField,
}: {
  recipe: CompetitorAnalysisState['recipe'];
  completenessPct: number;
  projection: CompetitorAnalysisProjection;
  sessionKey: string;
  onNavigateRecipe?: (field: RecipeFieldKey) => void;
  selectedRecipeField?: RecipeFieldKey | null;
}) {
  // 审核状态按 sessionKey + recipeField 隔离
  const [auditStates, setAuditStates] = useState<Record<string, 'suggested' | 'accepted' | 'adjusting'>>({});
  // sessionKey 变化时重置
  const [lastSession, setLastSession] = useState(sessionKey);
  useEffect(() => {
    if (sessionKey !== lastSession) {
      setLastSession(sessionKey);
      setAuditStates({});
    }
  }, [sessionKey, lastSession]);

  const visibleFields = projection.visibleRecipeFields;
  const allFields: { key: RecipeFieldKey; labelZh: string; valueZh: string; basisZh: string }[] = [
    { key: 'purpose', labelZh: '用途', valueZh: recipe.purposeZh, basisZh: '来自 5 张场景卖点图的用途聚类' },
    { key: 'canvas', labelZh: '画布', valueZh: `${recipe.canvas.width} × ${recipe.canvas.height}`, basisZh: 'Amazon 主图标准尺寸要求' },
    { key: 'position', labelZh: '商品位置', valueZh: recipe.productPositionZh, basisZh: '4/5 张参考图为右侧或中心主体' },
    { key: 'ratio', labelZh: '商品占比', valueZh: `${recipe.productRatio.min}%–${recipe.productRatio.max}%`, basisZh: '套图平均占比 58%–66%' },
    { key: 'background', labelZh: '背景', valueZh: recipe.backgroundZh, basisZh: '6 张图片使用深灰工作空间背景' },
    { key: 'lighting', labelZh: '光线', valueZh: recipe.lightingZh, basisZh: '左上柔光 + 冷色轮廓光在 5 张图片中重复' },
    { key: 'textSafetyZone', labelZh: '文字安全区', valueZh: `左侧 ${recipe.textSafetyZonePct}%`, basisZh: '右侧主体构图对应左侧文案区' },
  ];

  const stateColor = (s: string | undefined) =>
    s === 'accepted' ? 'var(--gc-accent-green)' : s === 'adjusting' ? 'var(--gc-accent-amber)' : 'var(--gc-text-faint)';
  const stateLabel = (s: string | undefined) =>
    s === 'accepted' ? '已接受' : s === 'adjusting' ? '待调整' : '建议';

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between rounded-sm px-2.5 py-2" style={{ background: 'var(--gc-bg-elev-2)', border: '1px solid var(--gc-line)' }}>
        <div>
          <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>套图 Creative Recipe 草案</span>
          <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>尚未进入正式生成</div>
        </div>
        <div className="text-right">
          <div className="gc-data text-base font-semibold" style={{ color: completenessPct >= 100 ? 'var(--gc-accent-green)' : 'var(--gc-accent-blue)' }}>
            {completenessPct}%
          </div>
          <div className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{visibleFields.length}/7 字段</div>
        </div>
      </div>

      <Section title="Recipe 字段">
        <dl className="flex flex-col gap-1">
          {allFields.map((row) => {
            const isVisible = visibleFields.includes(row.key);
            const fs = auditStates[`${sessionKey}#${row.key}`] ?? 'suggested';
            const color = stateColor(fs);
            return (
              <div
                key={row.key}
                data-testid={`recipe-field-${row.key}`}
                className="rounded-sm px-2 py-1"
                style={{ background: !isVisible ? 'var(--gc-bg-base)' : 'transparent' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs shrink-0" style={{ color: 'var(--gc-text-faint)' }}>{row.labelZh}</span>
                  {isVisible ? (
                    <span className="truncate text-xs" style={{ color: 'var(--gc-text-mid)' }}>{row.valueZh}</span>
                  ) : (
                    <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>等待分析</span>
                  )}
                </div>
                {isVisible && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>依据：{row.basisZh}</span>
                    <div className="flex items-center gap-1">
                      <span className="shrink-0 rounded-sm px-1.5 py-0.5 text-2xs" style={{ color, background: `${color}22`, border: `1px solid ${color}44` }}>
                        {stateLabel(fs)}
                      </span>
                      <button
                        onClick={() => setAuditStates((p) => ({ ...p, [`${sessionKey}#${row.key}`]: 'accepted' }))}
                        className="rounded-sm px-1.5 py-0.5 text-2xs"
                        style={{ color: 'var(--gc-accent-green)', border: '1px solid var(--gc-line)' }}
                      >
                        接受
                      </button>
                      <button
                        onClick={() => setAuditStates((p) => ({ ...p, [`${sessionKey}#${row.key}`]: 'adjusting' }))}
                        className="rounded-sm px-1.5 py-0.5 text-2xs"
                        style={{ color: 'var(--gc-accent-amber)', border: '1px solid var(--gc-line)' }}
                      >
                        待调整
                      </button>
                      <button
                        onClick={() => setAuditStates((p) => { const cp = { ...p }; delete cp[`${sessionKey}#${row.key}`]; return cp; })}
                        className="rounded-sm px-1.5 py-0.5 text-2xs"
                        style={{ color: 'var(--gc-text-faint)', border: '1px solid var(--gc-line)' }}
                      >
                        恢复
                      </button>
                      <button
                        onClick={() => onNavigateRecipe?.(row.key)}
                        data-testid={`recipe-basis-${row.key}`}
                        className="rounded-sm px-1.5 py-0.5 text-2xs"
                        style={{
                          color: selectedRecipeField === row.key ? 'var(--gc-accent-blue)' : 'var(--gc-text-lo)',
                          border: `1px solid ${selectedRecipeField === row.key ? 'var(--gc-accent-blue-line)' : 'var(--gc-line)'}`,
                          background: selectedRecipeField === row.key ? 'var(--gc-accent-blue-soft)' : 'transparent',
                        }}
                      >
                        查看依据
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </dl>
      </Section>
    </div>
  );
}

function SummaryRow({ label, value, mono = false, tone }: { label: string; value: string; mono?: boolean; tone?: 'amber' | 'green' }) {
  const color = tone === 'amber' ? 'var(--gc-accent-amber)' : tone === 'green' ? 'var(--gc-accent-green)' : 'var(--gc-text-mid)';
  return (
    <>
      <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>{label}</dt>
      <dd className={mono ? 'gc-data text-xs' : 'text-xs'} style={{ color }}>{value}</dd>
    </>
  );
}

/** F2-R1.3：卖点详情（检查器内展示） */
function SellingPointDetail({
  spId,
  sellingPoints,
  assets,
  onSelectAsset,
}: {
  spId: string;
  sellingPoints: CompetitorAnalysisState['sellingPoints'];
  assets: CompetitorAnalysisState['assets'];
  onSelectAsset: (id: string) => void;
}) {
  const sp = sellingPoints.find((s) => s.id === spId);
  if (!sp) return <div className="px-4 py-3 text-xs" style={{ color: 'var(--gc-text-faint)' }}>未找到卖点</div>;
  const spAssets = sp.assetIds.map((id) => assets.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>{sp.nameZh}</span>
        <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>第 {sp.order} 位</span>
      </div>
      <div className="flex flex-col gap-1">
        <DetailKV label="构图依据" value={sp.compositionZh} />
        <DetailKV label="光线依据" value={sp.lightingZh} />
        <DetailKV label="可继承" value={sp.inheritable ? '是' : '需评估'} tone={sp.inheritable ? 'green' : 'amber'} />
        <DetailKV label="Product Master 事实校验" value={sp.needsFactCheck ? '需要' : '不需要'} tone={sp.needsFactCheck ? 'amber' : 'green'} />
      </div>
      <div className="gc-section-label mt-1">关联图片（{spAssets.length} 张）</div>
      <div className="flex flex-wrap gap-1">
        {spAssets.map((a) => a && (
          <button
            key={a.id}
            onClick={() => onSelectAsset(a.id)}
            className="overflow-hidden rounded-sm transition-transform duration-snap hover:scale-110"
            style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${a.thumbPalette.from}, ${a.thumbPalette.to})` }}
          >
            <img src={a.src} alt="" className="h-full w-full object-cover" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailKV({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'amber' }) {
  const color = tone === 'green' ? 'var(--gc-accent-green)' : tone === 'amber' ? 'var(--gc-accent-amber)' : 'var(--gc-text-mid)';
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{label}</span>
      <span className="text-xs" style={{ color }}>{value}</span>
    </div>
  );
}
