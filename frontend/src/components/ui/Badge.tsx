/**
 * CommerceCanvas UI — Badge (Policy B, F3.5 R1 §10).
 *
 * Thin wrapper over `@astryxdesign/core/Badge`. Per component-policy.md all
 * CommerceCanvas code MUST import Badge from `@/components/ui/Badge`.
 *
 * Graphite status color mapping (done in the Astryx theme override, not here):
 *   variant="success" -> var(--gc-accent-green)
 *   variant="warning" -> var(--gc-accent-amber)
 *   variant="error"   -> var(--gc-accent-red)
 *   variant="info"    -> var(--gc-accent-blue)
 *   variant="purple"  -> var(--gc-accent-purple)
 *   variant="neutral" -> var(--gc-text-mid)
 * Keeping this a pure pass-through means status semantics live in the theme,
 * not duplicated in component code.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/Badge/Badge.d.ts):
 *   variant (success|warning|error|neutral|info|purple|blue|cyan|green|orange|
 *            pink|red|teal|yellow), label (ReactNode), icon.
 */
import { Badge as AstryxBadge, type BadgeProps as AstryxBadgeProps } from '@astryxdesign/core/Badge';

export type { BadgeVariant } from '@astryxdesign/core/Badge';

/**
 * CommerceCanvas Badge props. Identical to Astryx BadgeProps plus an optional
 * `testId` shorthand rendered as `data-cc-testid`.
 */
export type BadgeProps = Omit<AstryxBadgeProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas Badge — thin Astryx pass-through.
 *
 * @example
 *   import { Badge } from '@/components/ui/Badge';
 *   <Badge variant="success" label="Pass" testId="qc-badge" />
 */
export function Badge({ testId, ...props }: BadgeProps) {
  return (
    <AstryxBadge
      data-cc-component="Badge"
      data-cc-testid={testId}
      {...props}
    />
  );
}

Badge.displayName = 'CommerceCanvas.Badge';
