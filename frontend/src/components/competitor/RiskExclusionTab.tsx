/**
 * 风险排除 Tab（F2 §7.4）。
 * 三分类：禁止继承 / 待事实校验 / 可安全借鉴。
 * 每项显示状态、原因、证据数量、关联图片、是否需人工确认。
 * 点击风险排除项定位对应图片和 Evidence。
 */
import type { RiskExclusionList, RiskExclusionItem } from '@/types/competitor-analysis';
import { X, HelpCircle, Check } from 'lucide-react';

interface RiskExclusionTabProps {
  riskExclusion: RiskExclusionList;
  onSelectAsset: (id: string) => void;
}

export function RiskExclusionTab({ riskExclusion, onSelectAsset }: RiskExclusionTabProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <RiskSection
        title="禁止继承"
        icon={<X size={12} />}
        color="var(--gc-accent-red)"
        items={riskExclusion.prohibited}
        onSelectAsset={onSelectAsset}
      />
      <RiskSection
        title="待事实校验"
        icon={<HelpCircle size={12} />}
        color="var(--gc-accent-amber)"
        items={riskExclusion.factCheck}
        onSelectAsset={onSelectAsset}
      />
      <RiskSection
        title="可安全借鉴"
        icon={<Check size={12} />}
        color="var(--gc-accent-green)"
        items={riskExclusion.safe}
        onSelectAsset={onSelectAsset}
      />
    </div>
  );
}

function RiskSection({
  title,
  icon,
  color,
  items,
  onSelectAsset,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: RiskExclusionItem[];
  onSelectAsset: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span style={{ color }}>{icon}</span>
        <span className="gc-section-label" style={{ color }}>
          {title}
        </span>
        <span className="gc-data text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
          {items.length}
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            data-testid={`risk-item-${item.id}`}
            onClick={() => item.assetIds[0] && onSelectAsset(item.assetIds[0])}
            className="cursor-pointer rounded-sm px-2 py-1.5 transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
            style={{ borderLeft: `2px solid ${color}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>
                {item.nameZh}
              </span>
              {item.needsReview && (
                <span className="text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
                  待确认
                </span>
              )}
            </div>
            <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
              {item.reasonZh}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
              <span>证据 {item.evidenceCount}</span>
              {item.assetIds.length > 0 && (
                <span>· {item.assetIds.length} 张关联</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
