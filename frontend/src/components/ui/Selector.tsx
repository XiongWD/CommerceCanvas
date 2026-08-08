/**
 * F3.5 R5 — Graphite Native Selector（无 Astryx runtime）。
 *
 * 原生 select，Graphite 深色样式。受控 value + onChange。
 * hasClear 在值非空时显示清除按钮。
 *
 * 契约（兼容 R2 Astryx Selector API 子集）：
 *   label, options: [{ label, value }], value (string|null), onChange(string|null), hasClear
 */
import { type ChangeEvent, type CSSProperties, type ReactNode } from 'react';

export interface SelectorOption {
  label: ReactNode;
  value: string;
}

export interface SelectorProps {
  label?: ReactNode;
  options?: SelectorOption[];
  value?: string | null;
  onChange?: (value: string | null) => void;
  hasClear?: boolean;
  placeholder?: string;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  style?: CSSProperties;
}

export function Selector({
  label,
  options = [],
  value = null,
  onChange,
  hasClear = false,
  placeholder,
  testId,
  style,
}: SelectorProps) {
  const wrapperStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, ...style };
  const selectStyle: CSSProperties = {
    height: 28,
    width: '100%',
    padding: '0 24px 0 8px',
    background: 'var(--gc-bg-elev-2)',
    color: value ? 'var(--gc-text-hi)' : 'var(--gc-text-lo)',
    border: '1px solid var(--gc-line-strong)',
    borderRadius: 4,
    fontSize: '13px',
    appearance: 'none',
    cursor: 'pointer',
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value || null);
  };

  return (
    <div data-cc-component="Selector" data-cc-testid={testId} style={wrapperStyle}>
      {label && (
        <label style={{ fontSize: '12px', color: 'var(--gc-text-lo)' }}>{label}</label>
      )}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select value={value ?? ''} onChange={handleChange} style={selectStyle}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {!placeholder && (value === null || value === '') && <option value="">请选择…</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {String(opt.label)}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: hasClear && value ? 22 : 8,
            pointerEvents: 'none',
            color: 'var(--gc-text-lo)',
            fontSize: 10,
          }}
        >
          ▾
        </span>
        {hasClear && value && (
          <button
            type="button"
            aria-label="清除"
            onClick={() => onChange?.(null)}
            style={{
              position: 'absolute',
              right: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--gc-text-lo)',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

Selector.displayName = 'CommerceCanvas.Selector';
