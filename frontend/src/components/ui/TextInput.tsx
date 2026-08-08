/**
 * F3.5 R5 — Graphite Native TextInput（无 Astryx runtime）。
 *
 * 原生 input，Graphite 深色样式（28px 紧凑高度）。
 *
 * 契约（兼容 R2 Astryx TextInput API 子集）：
 *   label, placeholder, value, onChange, type, disabled
 */
import { type ChangeEvent, type CSSProperties, type ReactNode } from 'react';

export interface TextInputProps {
  label?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email' | 'number';
  isDisabled?: boolean;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
  style?: CSSProperties;
}

export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  isDisabled = false,
  testId,
  style,
}: TextInputProps) {
  const wrapperStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, ...style };
  const inputStyle: CSSProperties = {
    height: 28,
    width: '100%',
    padding: '0 8px',
    background: 'var(--gc-bg-elev-2)',
    color: 'var(--gc-text-hi)',
    border: '1px solid var(--gc-line-strong)',
    borderRadius: 4,
    fontSize: '13px',
    outline: 'none',
    cursor: isDisabled ? 'not-allowed' : 'text',
    opacity: isDisabled ? 0.5 : 1,
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value);

  return (
    <div data-cc-component="TextInput" data-cc-testid={testId} style={wrapperStyle}>
      {label && <label style={{ fontSize: '12px', color: 'var(--gc-text-lo)' }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={isDisabled}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
  );
}

TextInput.displayName = 'CommerceCanvas.TextInput';
