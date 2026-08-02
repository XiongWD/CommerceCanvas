import { Sparkles } from 'lucide-react';
import type { CreativeRecipeDraft as Recipe } from '@/types/competitor-analysis';
import { Section } from './AnalysisSummary';

/**
 * 套图 Creative Recipe 草案（任务书 §6.4 / mvp-prd §7.2 同类借用 / P3 §3）。
 * 标题明确为「套图级」汇总，避免误认为属于当前单张图片。
 * 展示完成态的结构化创意方案。本任务只展示完成态，不实现渐进生成。
 * 紫色仅用于 AI/智能能力（任务书 §7.1），克制点缀。
 */
export function CreativeRecipeDraftView({ recipe }: { recipe: Recipe }) {
  return (
    <Section title="套图 Creative Recipe 草案">
      {/* 头部：用途 + AI 标识（紫色克制）*/}
      <div
        className="mb-3 flex items-center gap-2 px-2.5 py-2"
        style={{
          background: 'var(--gc-bg-elev-2)',
          border: '1px solid var(--gc-line)',
          borderRadius: 2,
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--gc-accent-purple)' }} />
        <span className="text-xs" style={{ color: 'var(--gc-text-hi)' }}>
          {recipe.purposeZh}
        </span>
        <span
          className="gc-data ml-auto text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          草案 v1
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <RecipeRow label="画布">
          <span className="gc-data">{recipe.canvas.width} × {recipe.canvas.height}</span>
        </RecipeRow>
        <RecipeRow label="商品位置">{recipe.productPositionZh}</RecipeRow>
        <RecipeRow label="商品占比">
          <span className="gc-data">
            {recipe.productRatio.min}%–{recipe.productRatio.max}%
          </span>
        </RecipeRow>
        <RecipeRow label="背景">{recipe.backgroundZh}</RecipeRow>
        <RecipeRow label="光线">{recipe.lightingZh}</RecipeRow>
        <RecipeRow label="文字安全区">
          <span className="gc-data">左侧 {recipe.textSafetyZonePct}%</span>
        </RecipeRow>
      </dl>

      {/* 可视化画布示意：极简网格，呈现商品位置 + 文字安全区 */}
      <div
        className="mt-3 mx-auto"
        style={{
          width: '100%',
          maxWidth: 220,
          aspectRatio: '1 / 1',
          background: 'var(--gc-bg-canvas)',
          border: '1px solid var(--gc-line)',
          borderRadius: 2,
          position: 'relative',
        }}
        aria-label="Creative Recipe 构图示意"
      >
        {/* 文字安全区（左侧）*/}
        <span
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: `${recipe.textSafetyZonePct}%`,
            height: '100%',
            background: 'var(--gc-accent-blue-soft)',
            borderRight: '1px dashed var(--gc-accent-blue-line)',
          }}
        />
        {/* 商品主体（中心偏右）*/}
        <span
          className="absolute"
          style={{
            left: `${(recipe.productRatio.min + recipe.productRatio.max) / 2 + 4}%`,
            top: `${50 - (recipe.productRatio.max - recipe.productRatio.min) - 12}%`,
            width: `${recipe.productRatio.max - recipe.productRatio.min + 8}%`,
            height: `${recipe.productRatio.max}%`,
            background: 'var(--gc-accent-purple-soft)',
            border: '1px solid var(--gc-accent-purple)',
            borderRadius: 2,
          }}
        />
        <span
          className="absolute bottom-1.5 left-1.5 text-2xs"
          style={{ color: 'var(--gc-text-faint)' }}
        >
          构图示意
        </span>
      </div>
    </Section>
  );
}

function RecipeRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
        {label}
      </dt>
      <dd className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>
        {children}
      </dd>
    </>
  );
}
