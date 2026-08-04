/**
 * Product Master 摘要（F2 §4.1）。
 * 紧凑展示商品名称/SKU/类目/形态/主色/材质/核心身份特征/禁止变化属性。
 * 不得展示成大型表单。
 */
import type { ProductMaster } from '@/types/competitor-analysis';

export function ProductMasterSummary({ pm }: { pm: ProductMaster }) {
  return (
    <div className="px-3 py-2">
      <div className="gc-section-label mb-1.5">Product Master</div>
      <div className="text-xs font-semibold" style={{ color: 'var(--gc-text-hi)' }}>
        {pm.productNameZh}
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        <Row label="SKU">
          <span className="gc-mono-chip">{pm.sku}</span>
        </Row>
        <Row label="类目">{pm.categoryZh}</Row>
        <Row label="形态">
          <span style={{ color: 'var(--gc-accent-blue)' }}>{pm.formFactorZh}</span>
        </Row>
        <Row label="主色">{pm.primaryColorZh}</Row>
        <Row label="材质">{pm.materialZh}</Row>
      </div>
      {/* 核心身份特征 */}
      <div className="mt-2">
        <div className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>核心身份特征</div>
        <ul className="mt-0.5 flex flex-wrap gap-0.5">
          {pm.identityFeaturesZh.map((f, i) => (
            <li
              key={i}
              className="text-2xs"
              style={{
                color: 'var(--gc-text-mid)',
                background: 'var(--gc-bg-elev-2)',
                padding: '1px 5px',
                border: '1px solid var(--gc-line)',
              }}
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
      {/* 禁止变化属性 */}
      <div className="mt-1.5">
        <div className="text-2xs" style={{ color: 'var(--gc-accent-red)' }}>禁止变化</div>
        <ul className="mt-0.5 flex flex-wrap gap-0.5">
          {pm.prohibitedChangesZh.map((f, i) => (
            <li
              key={i}
              className="text-2xs"
              style={{
                color: 'var(--gc-text-mid)',
                background: 'var(--gc-accent-red-soft)',
                padding: '1px 5px',
                border: '1px solid rgba(224,89,79,0.3)',
              }}
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-2xs" style={{ color: 'var(--gc-text-faint)' }}>
        {label}
      </span>
      <span className="text-right text-2xs" style={{ color: 'var(--gc-text-mid)' }}>
        {children}
      </span>
    </div>
  );
}
