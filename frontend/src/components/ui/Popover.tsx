/**
 * F3.5 R5 — Graphite Native Popover（无 Astryx runtime）。
 *
 * 原生 click-toggle 浮层。受控 children 作为 trigger。
 *
 * 契约（兼容 R2 Astryx Popover API 子集）：
 *   content (ReactNode), placement ('below'|'above'|'start'|'end'), children
 *
 * PLACEHOLDER: 最小实现，不含完整 focus trap / 精确定位。
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface PopoverProps {
  content?: ReactNode;
  placement?: 'below' | 'above' | 'start' | 'end';
  children: ReactNode;
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
}

export function Popover({ content, placement = 'below', children, testId }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const posStyle: CSSProperties =
    placement === 'below'
      ? { top: '100%', left: 0, marginTop: 4 }
      : placement === 'above'
        ? { bottom: '100%', left: 0, marginBottom: 4 }
        : placement === 'end'
          ? { left: '100%', top: 0, marginLeft: 4 }
          : { right: '100%', top: 0, marginRight: 4 };

  return (
    <span
      ref={rootRef}
      data-cc-component="Popover"
      data-cc-testid={testId}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      <span onClick={() => setOpen(!open)} style={{ display: 'inline-flex', cursor: 'pointer' }}>
        {children}
      </span>
      {open && content && (
        <div
          role="dialog"
          style={{
            position: 'absolute',
            zIndex: 1000,
            background: 'var(--gc-bg-elev-2)',
            border: '1px solid var(--gc-line-strong)',
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            ...posStyle,
          }}
        >
          {content}
        </div>
      )}
    </span>
  );
}

Popover.displayName = 'CommerceCanvas.Popover';
