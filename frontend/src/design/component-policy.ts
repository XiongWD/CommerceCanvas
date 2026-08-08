/**
 * F3.5 R1 §24 — 结构化 Component Policy 权威数据源。
 * component-policy.md 和 f4-ui-foundation-map.md 必须与此一致。
 * 自动测试可读取此文件检测 drift。
 */

export type ComponentPolicy = 'A' | 'B' | 'C';
/** A = Astryx Direct, B = CommerceCanvas Wrapper, C = CommerceCanvas Custom */

export interface ComponentPolicyEntry {
  component: string;
  policy: ComponentPolicy;
  astryxExport?: string;
  ccWrapperPath?: string;
  status: 'verified' | 'planned';
}

export const COMPONENT_POLICY: ComponentPolicyEntry[] = [
  // Policy A — Astryx Direct
  { component: 'IconButton', policy: 'A', astryxExport: '@astryxdesign/core/IconButton', status: 'verified' },
  { component: 'TextInput', policy: 'A', astryxExport: '@astryxdesign/core/TextInput', status: 'verified' },
  { component: 'TextArea', policy: 'A', astryxExport: '@astryxdesign/core/TextArea', status: 'verified' },
  { component: 'Selector', policy: 'A', astryxExport: '@astryxdesign/core/Selector', status: 'verified' },
  { component: 'CheckboxInput', policy: 'A', astryxExport: '@astryxdesign/core/CheckboxInput', status: 'verified' },
  { component: 'Switch', policy: 'A', astryxExport: '@astryxdesign/core/Switch', status: 'verified' },
  { component: 'ProgressBar', policy: 'A', astryxExport: '@astryxdesign/core/ProgressBar', status: 'verified' },
  { component: 'Skeleton', policy: 'A', astryxExport: '@astryxdesign/core/Skeleton', status: 'verified' },
  { component: 'EmptyState', policy: 'A', astryxExport: '@astryxdesign/core/EmptyState', status: 'verified' },
  { component: 'Code', policy: 'A', astryxExport: '@astryxdesign/core/Code', status: 'verified' },
  { component: 'Divider', policy: 'A', astryxExport: '@astryxdesign/core/Divider', status: 'verified' },
  { component: 'Stack', policy: 'A', astryxExport: '@astryxdesign/core/Stack', status: 'verified' },
  { component: 'Popover', policy: 'A', astryxExport: '@astryxdesign/core/Popover', status: 'verified' },
  { component: 'DropdownMenu', policy: 'A', astryxExport: '@astryxdesign/core/DropdownMenu', status: 'verified' },

  // Policy B — CommerceCanvas Wrapper
  { component: 'Button', policy: 'B', astryxExport: '@astryxdesign/core/Button', ccWrapperPath: '@/components/ui/Button', status: 'verified' },
  { component: 'Text', policy: 'B', astryxExport: '@astryxdesign/core/Text', ccWrapperPath: '@/components/ui/Text', status: 'verified' },
  { component: 'Heading', policy: 'B', astryxExport: '@astryxdesign/core/Heading', ccWrapperPath: '@/components/ui/Heading', status: 'verified' },
  { component: 'TabList', policy: 'B', astryxExport: '@astryxdesign/core/TabList', ccWrapperPath: '@/components/ui/TabList', status: 'verified' },
  { component: 'Badge', policy: 'B', astryxExport: '@astryxdesign/core/Badge', ccWrapperPath: '@/components/ui/Badge', status: 'verified' },
  { component: 'Tooltip', policy: 'B', astryxExport: '@astryxdesign/core/Tooltip', ccWrapperPath: '@/components/ui/Tooltip', status: 'verified' },
  { component: 'Dialog', policy: 'B', astryxExport: '@astryxdesign/core/Dialog', ccWrapperPath: '@/components/ui/Dialog', status: 'verified' },
  { component: 'Table', policy: 'B', astryxExport: '@astryxdesign/core/Table', ccWrapperPath: '@/components/ui/Table', status: 'planned' },
  { component: 'List', policy: 'B', astryxExport: '@astryxdesign/core/List', ccWrapperPath: '@/components/ui/List', status: 'verified' },

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

/** 查找组件 policy */
export function getPolicy(component: string): ComponentPolicyEntry | undefined {
  return COMPONENT_POLICY.find((e) => e.component.toLowerCase() === component.toLowerCase());
}
