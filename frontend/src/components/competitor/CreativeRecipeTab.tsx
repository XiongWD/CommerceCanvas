/**
 * Creative Recipe Tab（F2 §7.3）。
 * 将 7/7 Recipe 深化成可审核草案 + 原型级操作（接受/标记待调整/恢复建议值）。
 * 本地 UI 状态，不持久化。明确标注「尚未进入正式生成」。
 */
import { useState } from 'react';
import type { CreativeRecipeDraft } from '@/types/competitor-analysis';
import { Section } from './AnalysisSummary';

interface CreativeRecipeTabProps {
  recipe: CreativeRecipeDraft;
  /** Recipe 完成度百分比（来自事件流） */
  completenessPct: number;
}

type FieldState = 'suggested' | 'accepted' | 'adjusting';

interface RecipeFieldRow {
  key: string;
  labelZh: string;
  valueZh: string;
  /** 产生该建议的依据中文 */
  basisZh: string;
}

export function CreativeRecipeTab({ recipe, completenessPct }: CreativeRecipeTabProps) {
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});

  const rows: RecipeFieldRow[] = [
    { key: 'purpose', labelZh: '用途', valueZh: recipe.purposeZh, basisZh: '来自 5 张场景卖点图的用途聚类' },
    { key: 'canvas', labelZh: '画布', valueZh: `${recipe.canvas.width} × ${recipe.canvas.height}`, basisZh: 'Amazon 主图标准尺寸要求' },
    { key: 'position', labelZh: '商品位置', valueZh: recipe.productPositionZh, basisZh: '4/5 张参考图为右侧或中心主体' },
    { key: 'ratio', labelZh: '商品占比', valueZh: `${recipe.productRatio.min}%–${recipe.productRatio.max}%`, basisZh: '套图平均占比 58%–66%' },
    { key: 'background', labelZh: '背景', valueZh: recipe.backgroundZh, basisZh: '6 张图片使用深灰工作空间背景' },
    { key: 'lighting', labelZh: '光线', valueZh: recipe.lightingZh, basisZh: '左上柔光 + 冷色轮廓光在 5 张图片中重复' },
    { key: 'textSafetyZone', labelZh: '文字安全区', valueZh: `左侧 ${recipe.textSafetyZonePct}%`, basisZh: '右侧主体构图对应左侧文案区' },
  ];

  const cycleState = (key: string) => {
    setFieldStates((prev) => {
      const current = prev[key] ?? 'suggested';
      const next: FieldState = current === 'suggested' ? 'accepted' : current === 'accepted' ? 'adjusting' : 'suggested';
      return { ...prev, [key]: next };
    });
  };

  const stateColor = (s: FieldState | undefined) => {
    if (s === 'accepted') return 'var(--gc-accent-green)';
    if (s === 'adjusting') return 'var(--gc-accent-amber)';
    return 'var(--gc-text-faint)';
  };
  const stateLabel = (s: FieldState | undefined) => {
    if (s === 'accepted') return '已接受';
    if (s === 'adjusting') return '待调整';
    return '建议';
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {/* 头部：完成度 + 状态声明 */}
      <div
        className="flex items-center justify-between rounded-sm px-2.5 py-2"
        style={{ background: 'var(--gc-bg-elev-2)', border: '1px solid var(--gc-line)' }}
      >
        <div>
          <span className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
            套图 Creative Recipe 草案
          </span>
          <div className="mt-0.5 text-2xs" style={{ color: 'var(--gc-accent-amber)' }}>
            尚未进入正式生成
          </div>
        </div>
        <div className="text-right">
          <div className="gc-data text-base font-semibold" style={{ color: completenessPct >= 100 ? 'var(--gc-accent-green)' : 'var(--gc-accent-blue)' }}>
            {completenessPct}%
          </div>
          <div className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
            {rows.length} 字段
          </div>
        </div>
      </div>

      {/* 字段列表 */}
      <Section title="Recipe 字段（点击切换 接受/待调整/建议）">
        <dl className="flex flex-col gap-1">
          {rows.map((row) => {
            const fs = fieldStates[row.key] ?? 'suggested';
            const color = stateColor(fs);
            return (
              <div
                key={row.key}
                data-testid={`recipe-field-${row.key}`}
                onClick={() => cycleState(row.key)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1 transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
              >
                <span className="text-xs shrink-0" style={{ color: 'var(--gc-text-faint)' }}>
                  {row.labelZh}
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                  <span className="truncate text-xs" style={{ color: 'var(--gc-text-mid)' }}>
                    {row.valueZh}
                  </span>
                  <span
                    className="shrink-0 rounded-sm px-1.5 py-0.5 text-2xs"
                    style={{ color, background: `${color}22`, border: `1px solid ${color}44` }}
                  >
                    {stateLabel(fs)}
                  </span>
                </div>
              </div>
            );
          })}
        </dl>
      </Section>

      {/* 适用平台 + 来源依据 */}
      <Section title="适用与依据">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>适用平台</dt>
          <dd className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>Amazon 美国站</dd>
          <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>推荐套图槽位</dt>
          <dd className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>主图 · 场景卖点图 · 细节图</dd>
          <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>置信度</dt>
          <dd className="text-xs" style={{ color: 'var(--gc-accent-green)' }}>
            高置信 · 12 张参考图覆盖 4 种用途
          </dd>
        </dl>
      </Section>
    </div>
  );
}
