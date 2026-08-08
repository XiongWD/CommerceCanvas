/**
 * F3.5 R5 — Graphite Native Dialog（无 Astryx runtime）。
 *
 * 极简原生 dialog 占位：受控 isOpen + onOpenChange，固定遮罩 + 居中面板。
 * 不实现 focus trap / 动画 / a11y 完整语义（标注为 placeholder，后续 R6+ 完善）。
 *
 * 契约（兼容 R2 Astryx Dialog API 子集）：
 *   Dialog:       isOpen, onOpenChange, children
 *   DialogHeader: title, subtitle, onOpenChange（占位渲染标题）
 *
 * PLACEHOLDER: 本组件为 R5 最小实现，仅满足 DesignFoundationPage smoke 渲染。
 */
import type { CSSProperties, ReactNode } from 'react';

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  width?: number | string;
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
}

export function Dialog({ isOpen, onOpenChange, width = 480, children, testId }: DialogProps) {
  if (!isOpen) return null;
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };
  const panelStyle: CSSProperties = {
    width,
    maxWidth: '90vw',
    maxHeight: '85vh',
    background: 'var(--gc-bg-elev-2)',
    border: '1px solid var(--gc-line-strong)',
    borderRadius: '6px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };
  return (
    <div
      data-cc-component="Dialog"
      data-cc-testid={testId}
      role="dialog"
      aria-modal="true"
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div style={panelStyle}>{children}</div>
    </div>
  );
}

Dialog.displayName = 'CommerceCanvas.Dialog';

export interface DialogHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  startContent?: ReactNode;
  endContent?: ReactNode;
  hasDivider?: boolean;
}

export function DialogHeader({
  title,
  subtitle,
  onOpenChange,
  startContent,
  endContent,
  hasDivider = true,
}: DialogHeaderProps) {
  return (
    <div
      data-cc-component="DialogHeader"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 20px',
        borderBottom: hasDivider ? '1px solid var(--gc-line)' : undefined,
      }}
    >
      {startContent}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gc-text-hi)' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: 'var(--gc-text-lo)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {endContent}
      {onOpenChange && (
        <button
          type="button"
          aria-label="关闭"
          onClick={() => onOpenChange(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--gc-text-lo)',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            padding: '2px 6px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

DialogHeader.displayName = 'CommerceCanvas.DialogHeader';
