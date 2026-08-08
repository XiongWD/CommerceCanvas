/**
 * F3.5 R4 P0 — DropdownMenu B Wrapper with controlled Escape close.
 *
 * R3: Astryx Beta uncontrolled mode Escape 不关闭。
 * R4: controlled isMenuOpen + onOpenChange adapter，Astryx 行为（keyboard/focus/a11y）不变。
 */
import { useState, useCallback } from 'react';
import { DropdownMenu as AstryxDropdownMenu } from '@astryxdesign/core/DropdownMenu';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DropdownMenu(props: any) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = props.isMenuOpen ?? internalOpen;

  const handleOpenChange = useCallback((open: boolean) => {
    setInternalOpen(open);
    props.onOpenChange?.(open);
  }, [props]);

  return (
    <AstryxDropdownMenu
      data-cc-component="DropdownMenu"
      {...props}
      isMenuOpen={isOpen}
      onOpenChange={handleOpenChange}
    />
  );
}
