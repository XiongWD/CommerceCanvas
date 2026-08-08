/**
 * F3.5 R5 — Graphite Native TextArea（无 Astryx runtime）。
 *
 * 原生 textarea，Graphite 深色样式。
 *
 * 契约（兼容 R2 Astryx TextArea API 子集）：
 *   label, placeholder, value, onChange, rows, disabled
 */
import { type ChangeEvent, type CSSProperties, type ReactNode } from 'react';

export interface TextAreaProps {
  label?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  isDisabled?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  style?: CSSProperties;
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  isDisabled = false,
  testId,
  style,
}: TextAreaProps) {
  const wrapperStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, ...style };
  const taStyle: CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    background: 'var(--gc-bg-elev-2)',
    color: 'var(--gc-text-hi)',
    border: '1px solid var(--gc-line-strong)',
    borderRadius: 4,
    fontSize: '13px',
    lineHeight: '18px',
    outline: 'none',
    resize: 'vertical',
    cursor: isDisabled ? 'not-allowed' : 'text',
    opacity: isDisabled ? 0.5 : 1,
    fontFamily: 'var(--gc-font-sans)',
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value);

  return (
    <div data-cc-component="TextArea" data-cc-testid={testId} style={wrapperStyle}>
      {label && <label style={{ fontSize: '12px', color: 'var(--gc-text-lo)' }}>{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        rows={rows}
        disabled={isDisabled}
        onChange={handleChange}
        style={taStyle}
      />
    </div>
  );
}

TextArea.displayName = 'CommerceCanvas.TextArea';
