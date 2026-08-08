/**
 * F3.5 R5 — CommerceCanvas Graphite Native B Wrapper components barrel.
 * Policy B 组件统一入口。F4+ MUST import from '@/components/ui/'.
 *
 * R5：所有组件为 Graphite Native（无 Astryx runtime）。
 */
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';
export { Text } from './Text';
export type { TextProps, TextType, TextColor } from './Text';
export { Heading } from './Heading';
export type { HeadingProps, HeadingLevel, HeadingType } from './Heading';
export { TextInput } from './TextInput';
export type { TextInputProps } from './TextInput';
export { TextArea } from './TextArea';
export type { TextAreaProps } from './TextArea';
export { Selector } from './Selector';
export type { SelectorProps, SelectorOption } from './Selector';
export { TabList, Tab } from './TabList';
export type { TabListProps, TabProps, TabListSize, TabListLayout } from './TabList';
export { Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export { Popover } from './Popover';
export type { PopoverProps } from './Popover';
export { DropdownMenu } from './DropdownMenu';
export type { DropdownMenuProps, DropdownMenuItem } from './DropdownMenu';
export { Dialog, DialogHeader } from './Dialog';
export type { DialogProps, DialogHeaderProps } from './Dialog';
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
export {
  Table,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableHeader,
  TableBody,
} from './Table';
export type { TableProps } from './Table';
export { List, ListItem } from './List';
export type { ListProps, ListItemProps } from './List';
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
export { StatusDot } from './StatusDot';
export { StatusIndicator } from './StatusIndicator';
export type { StatusIndicatorProps, StatusTone } from './StatusIndicator';
