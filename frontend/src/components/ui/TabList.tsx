/**
 * CommerceCanvas UI — TabList + Tab (Policy B, F3.5 R1 §11).
 *
 * Thin wrapper over `@astryxdesign/core/TabList`. Per component-policy.md all
 * CommerceCanvas code MUST import TabList / Tab from `@/components/ui/TabList`.
 *
 * Graphite accent mapping (the active tab's underline) is resolved in the
 * Astryx theme override (`--gc-accent-blue`), not by remapping props here.
 *
 * API (verified against node_modules/@astryxdesign/core/dist/TabList/):
 *   TabList: value (string, required), onChange (string => void, required),
 *            size (sm|md|lg), layout (hug|fill), hasDivider, children.
 *   Tab:     value (string, required), label (string, required),
 *            isLabelHidden, href, icon, selectedIcon, endContent.
 */
import {
  TabList as AstryxTabList,
  type TabListProps as AstryxTabListProps,
  Tab,
} from '@astryxdesign/core/TabList';

export type { TabProps, TabListSize, TabListLayout } from '@astryxdesign/core/TabList';

/**
 * CommerceCanvas TabList props. Identical to Astryx TabListProps plus an
 * optional `testId` shorthand rendered as `data-cc-testid`.
 */
export type TabListProps = Omit<AstryxTabListProps, 'data-testid'> & {
  /** CommerceCanvas test identifier; rendered as `data-cc-testid`. */
  testId?: string;
};

/**
 * CommerceCanvas TabList — thin Astryx pass-through. Wraps children (Tab /
 * TabMenu) in Astryx TabList context.
 *
 * `Tab` is re-exported verbatim from Astryx; it has no CC-specific additions.
 *
 * @example
 *   import { TabList, Tab } from '@/components/ui/TabList';
 *   <TabList value={tab} onChange={setTab} testId="settings-tabs">
 *     <Tab value="general" label="General" />
 *     <Tab value="advanced" label="Advanced" />
 *   </TabList>
 */
export function TabList({ testId, ...props }: TabListProps) {
  return (
    <AstryxTabList
      data-cc-component="TabList"
      data-cc-testid={testId}
      {...props}
    />
  );
}

TabList.displayName = 'CommerceCanvas.TabList';
// Tab is a pure Astryx re-export (no CC additions).
export { Tab };
