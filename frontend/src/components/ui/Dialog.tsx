/**
 * CommerceCanvas UI — Dialog + DialogHeader (Policy B, F3.5 R1 §11).
 *
 * Thin wrapper over `@astryxdesign/core/Dialog`. Per component-policy.md all
 * CommerceCanvas code MUST import Dialog / DialogHeader from
 * `@/components/ui/Dialog`.
 *
 * Graphite surface tokens (backdrop, dialog background, borders) are resolved
 * in the Astryx theme override (`--gc-bg-elev-*`, `--gc-line-strong`), not by
 * remapping props here.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/Dialog/):
 *   Dialog:       isOpen (boolean, required), onOpenChange (boolean => unknown,
 *                 required), width, maxHeight, position, variant, purpose,
 *                 padding, isInline, children.
 *   DialogHeader: title (string, required), subtitle, onOpenChange,
 *                 startContent, endContent, hasDivider.
 */
import {
  Dialog as AstryxDialog,
  type DialogProps as AstryxDialogProps,
  DialogHeader,
  type DialogHeaderProps,
} from '@astryxdesign/core/Dialog';

export type { DialogVariant, DialogPurpose, DialogPosition } from '@astryxdesign/core/Dialog';

/**
 * CommerceCanvas Dialog props. Identical to Astryx DialogProps plus an optional
 * `testId` shorthand rendered as `data-cc-testid`.
 */
export type DialogProps = Omit<AstryxDialogProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas Dialog — thin Astryx pass-through. Render a `DialogHeader`
 * (plus `Layout` content / footer) inside as children.
 *
 * `DialogHeader` is re-exported verbatim from Astryx; it has no CC-specific
 * additions.
 *
 * @example
 *   import { Dialog, DialogHeader } from '@/components/ui/Dialog';
 *   <Dialog isOpen={open} onOpenChange={setOpen} testId="confirm-dialog">
 *     <DialogHeader title="Confirm" onOpenChange={setOpen} />
 *   </Dialog>
 */
export function Dialog({ testId, ...props }: DialogProps) {
  return (
    <AstryxDialog
      data-cc-component="Dialog"
      data-cc-testid={testId}
      {...props}
    />
  );
}

Dialog.displayName = 'CommerceCanvas.Dialog';
// DialogHeader is a pure Astryx re-export (no CC additions).
export { DialogHeader };
export type { DialogHeaderProps };
