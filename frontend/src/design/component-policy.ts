/**
 * F3.5 R2 §12-15 — 结构化 Component Policy 权威数据源（唯一 source of truth）。
 *
 * R2 修正：恢复 FROZEN contract（component-policy.md），所有 LOCKED B 组件为 B。
 * component-policy.md / f4-ui-foundation-map.md 必须与此一致。
 */
export type ComponentPolicy = 'A' | 'B' | 'C';

export interface ComponentPolicyEntry {
  component: string;
  policy: ComponentPolicy;
  astryxExport?: string;
  ccWrapperPath?: string;
  status: 'verified' | 'planned';
}

export const COMPONENT_POLICY: ComponentPolicyEntry[] = [
  // Policy B — CommerceCanvas Wrapper（全部 LOCKED B per component-policy.md）
  { component: 'Button', policy: 'B', astryxExport: '@astryxdesign/core/Button', ccWrapperPath: '@/components/ui/Button', status: 'verified' },
  { component: 'IconButton', policy: 'B', astryxExport: '@astryxdesign/core/IconButton', ccWrapperPath: '@/components/ui/IconButton', status: 'verified' },
  { component: 'Text', policy: 'B', astryxExport: '@astryxdesign/core/Text', ccWrapperPath: '@/components/ui/Text', status: 'verified' },
  { component: 'Heading', policy: 'B', astryxExport: '@astryxdesign/core/Heading', ccWrapperPath: '@/components/ui/Heading', status: 'verified' },
  { component: 'TextInput', policy: 'B', astryxExport: '@astryxdesign/core/TextInput', ccWrapperPath: '@/components/ui/TextInput', status: 'verified' },
  { component: 'TextArea', policy: 'B', astryxExport: '@astryxdesign/core/TextArea', ccWrapperPath: '@/components/ui/TextArea', status: 'verified' },
  { component: 'Selector', policy: 'B', astryxExport: '@astryxdesign/core/Selector', ccWrapperPath: '@/components/ui/Selector', status: 'verified' },
  { component: 'TabList', policy: 'B', astryxExport: '@astryxdesign/core/TabList', ccWrapperPath: '@/components/ui/TabList', status: 'verified' },
  { component: 'Tooltip', policy: 'B', astryxExport: '@astryxdesign/core/Tooltip', ccWrapperPath: '@/components/ui/Tooltip', status: 'verified' },
  { component: 'Popover', policy: 'B', astryxExport: '@astryxdesign/core/Popover', ccWrapperPath: '@/components/ui/Popover', status: 'verified' },
  { component: 'DropdownMenu', policy: 'B', astryxExport: '@astryxdesign/core/DropdownMenu', ccWrapperPath: '@/components/ui/DropdownMenu', status: 'verified' },
  { component: 'Dialog', policy: 'B', astryxExport: '@astryxdesign/core/Dialog', ccWrapperPath: '@/components/ui/Dialog', status: 'verified' },
  { component: 'Badge', policy: 'B', astryxExport: '@astryxdesign/core/Badge', ccWrapperPath: '@/components/ui/Badge', status: 'verified' },
  { component: 'Table', policy: 'B', astryxExport: '@astryxdesign/core/Table', ccWrapperPath: '@/components/ui/Table', status: 'verified' },
  { component: 'List', policy: 'B', astryxExport: '@astryxdesign/core/List', ccWrapperPath: '@/components/ui/List', status: 'verified' },
  { component: 'ProgressBar', policy: 'B', astryxExport: '@astryxdesign/core/ProgressBar', ccWrapperPath: '@/components/ui/ProgressBar', status: 'verified' },
  { component: 'EmptyState', policy: 'B', astryxExport: '@astryxdesign/core/EmptyState', ccWrapperPath: '@/components/ui/EmptyState', status: 'verified' },

  // Policy A — Astryx Direct（无 CommerceCanvas 定制需求）
  { component: 'CheckboxInput', policy: 'A', astryxExport: '@astryxdesign/core/CheckboxInput', status: 'verified' },
  { component: 'RadioList', policy: 'A', astryxExport: '@astryxdesign/core/RadioList', status: 'verified' },
  { component: 'Switch', policy: 'A', astryxExport: '@astryxdesign/core/Switch', status: 'verified' },
  { component: 'Skeleton', policy: 'A', astryxExport: '@astryxdesign/core/Skeleton', status: 'verified' },
  { component: 'Code', policy: 'A', astryxExport: '@astryxdesign/core/Code', status: 'verified' },
  { component: 'Divider', policy: 'A', astryxExport: '@astryxdesign/core/Divider', status: 'verified' },
  { component: 'Stack', policy: 'A', astryxExport: '@astryxdesign/core/Stack', status: 'verified' },

  // Policy C — CommerceCanvas Custom
  { component: 'AppShell', policy: 'C', status: 'verified' },
  { component: 'MediaCanvas', policy: 'C', status: 'verified' },
  { component: 'EvidenceViewer', policy: 'C', status: 'verified' },
  { component: 'LiveIntelligenceTrace', policy: 'C', status: 'verified' },
  { component: 'PersistentTask', policy: 'C', status: 'verified' },
  { component: 'ArtifactLineage', policy: 'C', status: 'verified' },
  { component: 'QCResultSurface', policy: 'C', status: 'verified' },
  { component: 'JobNodeRail', policy: 'C', status: 'verified' },
];

export function getPolicy(component: string): ComponentPolicyEntry | undefined {
  return COMPONENT_POLICY.find((e) => e.component.toLowerCase() === component.toLowerCase());
}
