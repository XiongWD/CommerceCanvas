/**
 * F3.5 R5 — Graphite Native DropdownMenu（无 Astryx runtime）。
 *
 * 原生 button + 下拉浮层。受控 isMenuOpen + onOpenChange（保留 R4 P0 fix：
 * Escape 关闭由内部 handler 处理；外部可受控）。
 *
 * 契约（兼容 R2 Astryx DropdownMenu API 子集）：
 *   button: { label, variant }
 *   items: [{ label, onClick } | { type: 'divider' }]
 *   hasChevron, isMenuOpen, onOpenChange
 *
 * PLACEHOLDER: 最小实现，不含完整键盘导航/focus trap。
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';

export interface DropdownMenuItem {
  label?: ReactNode;
  onClick?: () => void;
  type?: 'divider';
  isDisabled?: boolean;
}

export interface DropdownMenuProps {
  button?: { label?: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' };
  items?: DropdownMenuItem[];
  hasChevron?: boolean;
  isMenuOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
}

export function DropdownMenu({
  button: buttonProp,
  items = [],
  hasChevron = false,
  isMenuOpen,
  onOpenChange,
  children,
  testId,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isMenuOpen ?? internalOpen;
  const rootRef = useRef<HTMLSpanElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  // R4 P0：Escape 关闭 + 外部点击关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, setOpen]);

  const triggerVariant = buttonProp?.variant ?? 'secondary';

  return (
    <span
      ref={rootRef}
      data-cc-component="DropdownMenu"
      data-cc-testid={testId}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      <Button
        variant={triggerVariant}
        onClick={() => setOpen(!isOpen)}
        label={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {buttonProp?.label}
            {hasChevron && <span aria-hidden style={{ fontSize: 10 }}>▾</span>}
          </span>
        }
      />
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: 160,
            background: 'var(--gc-bg-elev-2)',
            border: '1px solid var(--gc-line-strong)',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            padding: '4px 0',
            zIndex: 1000,
          }}
        >
          {items.map((item, idx) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`divider-${idx}`}
                  style={{ height: 1, background: 'var(--gc-line)', margin: '4px 0' }}
                />
              );
            }
            return (
              <button
                key={`item-${idx}`}
                type="button"
                role="menuitem"
                disabled={item.isDisabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gc-text-mid)',
                  fontSize: '12px',
                  cursor: item.isDisabled ? 'not-allowed' : 'pointer',
                  opacity: item.isDisabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!item.isDisabled) (e.currentTarget.style.background = 'var(--gc-bg-elev-1)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </button>
            );
          })}
          {children}
        </div>
      )}
    </span>
  );
}

DropdownMenu.displayName = 'CommerceCanvas.DropdownMenu';
