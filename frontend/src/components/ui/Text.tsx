/**
 * CommerceCanvas UI — Text (Policy B, F3.5 R1 §9 Typography Contract).
 *
 * Thin wrapper over `@astryxdesign/core/Text`. Per component-policy.md all
 * CommerceCanvas code MUST import Text from `@/components/ui/Text`.
 *
 * Color -> token mapping (done in the Astryx theme override, not here):
 *   color="primary"    -> var(--gc-text-hi)
 *   color="secondary"  -> var(--gc-text-mid)
 *   color="disabled"   -> var(--gc-text-faint)
 *   color="placeholder"-> var(--gc-text-faint)
 *   color="accent"     -> var(--gc-accent-blue)
 *   color="inherit"    -> inherited
 * This wrapper stays a pure pass-through so the Typography Contract lives in
 * one place (the theme), not duplicated per component.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/Text/Text.d.ts):
 *   type (body|large|label|supporting|code|display-1|display-2|display-3|inherit),
 *   color (primary|secondary|disabled|placeholder|accent|inherit), size, weight,
 *   display, maxLines, hasTruncateTooltip, wordBreak, textWrap, justify,
 *   hasCapsize, hasStrikethrough, hasTabularNumbers, as, children.
 */
import { Text as AstryxText, type TextProps as AstryxTextProps } from '@astryxdesign/core/Text';

export type { TextType, TextSize } from '@astryxdesign/core/Text';

/**
 * CommerceCanvas Text props. Identical to Astryx TextProps plus an optional
 * `testId` shorthand rendered as `data-cc-testid`.
 */
export type TextProps = Omit<AstryxTextProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas Text — thin Astryx pass-through.
 *
 * @example
 *   import { Text } from '@/components/ui/Text';
 *   <Text type="label" color="secondary" testId="field-label">Label</Text>
 */
export function Text({ testId, ...props }: TextProps) {
  return (
    <AstryxText
      data-cc-component="Text"
      data-cc-testid={testId}
      {...props}
    />
  );
}

Text.displayName = 'CommerceCanvas.Text';
