/**
 * CommerceCanvas UI — Heading (Policy B, F3.5 R1 §9 Typography Contract).
 *
 * Thin wrapper over `@astryxdesign/core/Heading`. Per component-policy.md all
 * CommerceCanvas code MUST import Heading from `@/components/ui/Heading`.
 *
 * Graphite typography scale mapping is done in the Astryx theme override
 * (level/type -> --gc-text-* sizes/weights), not by remapping props here.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/Heading/Heading.d.ts):
 *   level (1-6, required), type (display-1|display-2|display-3 optional),
 *   accessibilityLevel, color, display, maxLines, hasTruncateTooltip,
 *   wordBreak, textWrap, justify, hasCapsize, hasStrikethrough, children.
 */
import {
  Heading as AstryxHeading,
  type HeadingProps as AstryxHeadingProps,
} from '@astryxdesign/core/Heading';

export type { HeadingLevel, HeadingType } from '@astryxdesign/core/Heading';

/**
 * CommerceCanvas Heading props. Identical to Astryx HeadingProps plus an
 * optional `testId` shorthand rendered as `data-cc-testid`.
 */
export type HeadingProps = Omit<AstryxHeadingProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas Heading — thin Astryx pass-through.
 *
 * @example
 *   import { Heading } from '@/components/ui/Heading';
 *   <Heading level={2} testId="panel-title">Title</Heading>
 */
export function Heading({ testId, ...props }: HeadingProps) {
  return (
    <AstryxHeading
      data-cc-component="Heading"
      data-cc-testid={testId}
      {...props}
    />
  );
}

Heading.displayName = 'CommerceCanvas.Heading';
