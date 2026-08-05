/**
 * 风险排除 Tab（F2-R1.2：onNavigateRisk → Evidence+轨迹）。
 * 点击风险条目调用 onNavigateRisk（统一导航），不再只 onSelectAsset。
 */
import type { RiskExclusionList, RiskExclusionItem } from '@/types/competitor-analysis';
import { X, HelpCircle, Check } from 'lucide-react';

interface RiskExclusionTabProps {
  riskExclusion: RiskExclusionList;
  onSelectAsset: (id: string) => void;
  /** F2-R1.2：统一导航（风险→Evidence→轨迹） */
  onNavigateRisk?: (riskItemId: string) => void;
  selectedRiskItemId?: string | null;
}

export function RiskExclusionTab({ riskExclusion, onNavigateRisk, selectedRiskItemId }: RiskExclusionTabProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <RiskSection
        title="禁止继承"
        icon={<X size={12} />}
        color="var(--gc-accent-red)"
        items={riskExclusion.prohibited}
        onNavigateRisk={onNavigateRisk}
        selectedRiskItemId={selectedRiskItemId}
      />
      <RiskSection
        title="待事实校验"
        icon={<HelpCircle size={12} />}
        color="var(--gc-accent-amber)"
        items={riskExclusion.factCheck}
        onNavigateRisk={onNavigateRisk}
        selectedRiskItemId={selectedRiskItemId}
      />
      <RiskSection
        title="可安全借鉴"
        icon={<Check size={12} />}
        color="var(--gc-accent-green)"
        items={riskExclusion.safe}
        onNavigateRisk={onNavigateRisk}
        selectedRiskItemId={selectedRiskItemId}
      />
    </div>
  );
}

function RiskSection({
  title,
  icon,
  color,
  items,
  onNavigateRisk,
  selectedRiskItemId,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: RiskExclusionItem[];
  onNavigateRisk?: (riskItemId: string) => void;
  selectedRiskItemId?: string | null;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="gc-section-label" style={{ color }}>{title}</span>
        <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{items.length}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isSelected = selectedRiskItemId === item.id;
          return (
            <li
              key={item.id}
              data-testid={`risk-item-${item.id}`}
              onClick={() => onNavigateRisk?.(item.id)}
              className="cursor-pointer rounded-sm px-2 py-1.5 transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
              style={{
                borderLeft: `2px solid ${color}`,
                background: isSelected ? 'var(--gc-accent-blue-soft)' : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>{item.nameZh}</span>
                {item.needsReview && (
                  <span className="text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>待确认</span>
                )}
              </div>
              <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>{item.reasonZh}</div>
              <div className="mt-0.5 flex items-center gap-2 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
                <span>证据 {item.evidenceCount}</span>
                {item.assetIds.length > 0 && <span>· {item.assetIds.length} 张关联</span>}
                {isSelected && <span style={{ color: 'var(--gc-accent-blue)' }}>· 已定位</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
