/**
 * F3.5 R5 — 结构化 Component Policy 权威数据源（唯一 source of truth）。
 *
 * R5 修正：Astryx runtime 完全移除。Policy B 组件全部为 Graphite Native
 * 实现（原生 React + Tailwind/CSS + --gc-* token）。原 Policy A（Astryx
 * Direct）原子（CheckboxInput/Switch/Skeleton/Code/Divider/Stack）退化为
 * Policy C（CommerceCanvas Custom）页面内联原生实现。原 `astryxExport` 字段
 * 保留为可选历史记录，但运行时已不再依赖任何 Astryx 包。
 */
export type ComponentPolicy = 'B' | 'C';

export interface ComponentPolicyEntry {
  component: string;
  policy: ComponentPolicy;
  /** Graphite Native wrapper path（Policy B）。 */
  ccWrapperPath?: string;
  /** 原 Astryx 导出路径，仅作历史记录；R5 后运行时不再使用。 */
  legacyAstryxExport?: string;
  status: 'verified' | 'planned';
}

export const COMPONENT_POLICY: ComponentPolicyEntry[] = [
  // Policy B — CommerceCanvas Graphite Native Wrapper（R5：原生实现，无 Astryx runtime）
  { component: 'Button', policy: 'B', ccWrapperPath: '@/components/ui/Button', status: 'verified' },
  { component: 'IconButton', policy: 'B', ccWrapperPath: '@/components/ui/IconButton', status: 'verified' },
  { component: 'Text', policy: 'B', ccWrapperPath: '@/components/ui/Text', status: 'verified' },
  { component: 'Heading', policy: 'B', ccWrapperPath: '@/components/ui/Heading', status: 'verified' },
  { component: 'TextInput', policy: 'B', ccWrapperPath: '@/components/ui/TextInput', status: 'verified' },
  { component: 'TextArea', policy: 'B', ccWrapperPath: '@/components/ui/TextArea', status: 'verified' },
  { component: 'Selector', policy: 'B', ccWrapperPath: '@/components/ui/Selector', status: 'verified' },
  { component: 'TabList', policy: 'B', ccWrapperPath: '@/components/ui/TabList', status: 'verified' },
  { component: 'Tooltip', policy: 'B', ccWrapperPath: '@/components/ui/Tooltip', status: 'verified' },
  { component: 'Popover', policy: 'B', ccWrapperPath: '@/components/ui/Popover', status: 'verified' },
  { component: 'DropdownMenu', policy: 'B', ccWrapperPath: '@/components/ui/DropdownMenu', status: 'verified' },
  { component: 'Dialog', policy: 'B', ccWrapperPath: '@/components/ui/Dialog', status: 'verified' },
  { component: 'Badge', policy: 'B', ccWrapperPath: '@/components/ui/Badge', status: 'verified' },
  { component: 'Table', policy: 'B', ccWrapperPath: '@/components/ui/Table', status: 'verified' },
  { component: 'List', policy: 'B', ccWrapperPath: '@/components/ui/List', status: 'verified' },
  { component: 'ProgressBar', policy: 'B', ccWrapperPath: '@/components/ui/ProgressBar', status: 'verified' },
  { component: 'EmptyState', policy: 'B', ccWrapperPath: '@/components/ui/EmptyState', status: 'verified' },

  // Policy C — CommerceCanvas Custom（R5：原 Policy A 退化为内联原生实现）
  { component: 'CheckboxInput', policy: 'C', status: 'verified' },
  { component: 'RadioList', policy: 'C', status: 'planned' },
  { component: 'Switch', policy: 'C', status: 'verified' },
  { component: 'Skeleton', policy: 'C', status: 'verified' },
  { component: 'Code', policy: 'C', status: 'verified' },
  { component: 'Divider', policy: 'C', status: 'verified' },
  { component: 'Stack', policy: 'C', status: 'verified' },

  // Policy C — CommerceCanvas Custom（业务组件）
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
