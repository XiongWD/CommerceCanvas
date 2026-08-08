/**
 * CommerceCanvas UI — Button (Policy B, F3.5 R1 §8).
 *
 * Thin wrapper over `@astryxdesign/core/Button`. Per component-policy.md all
 * CommerceCanvas code MUST import Button from `@/components/ui/Button`, never
 * directly from Astryx. This wrapper:
 *   - centralizes the Astryx import so the policy boundary is enforced in one place,
 *   - stamps `data-cc-component="Button"` + an optional `data-cc-testid` so
 *     Graphite tests / telemetry can identify CC-owned button instances,
 *   - re-exports the props + variant/size types verbatim.
 *
 * Graphite accent mapping (variant=primary -> --gc-accent-blue etc.) happens at
 * the Astryx theme-override layer, NOT by remapping props here. Keeping this a
 * pure pass-through avoids re-implementing variant logic.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/Button/Button.d.ts):
 *   label (required), variant, size, isDisabled, isLoading, isInterruptible,
 *   clickAction, icon, isIconOnly, width, children, endContent, tooltip,
 *   href, as, target, rel, onClick.
 */
import {
  Button as AstryxButton,
  type ButtonProps as AstryxButtonProps,
} from '@astryxdesign/core/Button';

export type { ButtonVariant, ButtonSize } from '@astryxdesign/core/Button';

/**
 * CommerceCanvas Button props. Identical to Astryx ButtonProps plus an optional
 * `testId` shorthand rendered as `data-cc-testid`.
 */
export type ButtonProps = Omit<AstryxButtonProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas Button — thin Astryx pass-through.
 *
 * @example
 *   import { Button } from '@/components/ui/Button';
 *   <Button label="Save" variant="primary" testId="save-btn" />
 */
export function Button({ testId, ...props }: ButtonProps) {
  return (
    <AstryxButton
      data-cc-component="Button"
      data-cc-testid={testId}
      {...props}
    />
  );
}

Button.displayName = 'CommerceCanvas.Button';
