/**
 * CommerceCanvas UI — B Wrapper components barrel (F3.5 R1 §8-11).
 *
 * Policy B 组件的统一入口。CommerceCanvas 代码（F4+）MUST import from
 * '@/components/ui/'，不直接 import Astryx — 这条边界由各 wrapper 文件集中维护。
 *
 * 每个导出的组件都是 Astryx 对应组件的 thin pass-through，额外：
 *   - 注入 `data-cc-component="<Name>"` 用于 CC-owned 实例识别；
 *   - 接受可选 `testId` -> 渲染为 `data-cc-testid`（Tooltip 除外，见下）；
 *   - 透传 Astryx 的 props / variant / size 等类型。
 *
 * Tooltip 说明：历史上本目录同时导出 CC 自定义 Tooltip（Policy C，`label/side`
 * API）和 AstryxTooltip（Policy B wrapper）。现统一为单一 Policy B wrapper，
 * 采用 Astryx 原生 API（`content/placement`）。AstryxTooltip 别名已移除。
 */
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Text } from './Text';
export type { TextProps, TextType, TextSize } from './Text';

export { Heading } from './Heading';
export type { HeadingProps, HeadingLevel, HeadingType } from './Heading';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { TabList, Tab } from './TabList';
export type { TabListProps, TabProps, TabListSize, TabListLayout } from './TabList';

export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

export { Dialog, DialogHeader } from './Dialog';
export type {
  DialogProps,
  DialogHeaderProps,
  DialogVariant,
  DialogPurpose,
  DialogPosition,
} from './Dialog';

// StatusDot 是 Policy C 自定义组件（非 Astryx wrapper），与 B wrapper 共存于本目录。
export { StatusDot } from './StatusDot';
export type { StatusTone } from './StatusDot';
