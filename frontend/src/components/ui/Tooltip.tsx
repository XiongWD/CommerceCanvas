/**
 * F3.5 R2 §17-20 — Tooltip B Wrapper（唯一 canonical path）。
 *
 * 基于 Astryx Tooltip，提供兼容 adapter 支持 F0-F3 旧 API：
 *   - 旧 API: label + side ('right'|'top'|'bottom')
 *   - 新 API: content + placement ('start'|'end'|'above'|'below')
 *
 * F4+ canonical import: import { Tooltip } from '@/components/ui/Tooltip'
 * F0-F3 consumers 不需要改（label/side 自动映射）。
 */
import { Tooltip as AstryxTooltip } from '@astryxdesign/core/Tooltip';
import type { ReactNode } from 'react';
import type { LayerPlacement } from '@astryxdesign/core/Layer';

/** F0-F3 旧 side 值 → Astryx placement 映射 */
const SIDE_TO_PLACEMENT: Record<string, LayerPlacement> = {
  right: 'end',
  top: 'above',
  bottom: 'below',
};

export interface TooltipProps {
  /** 旧 API alias for content（F0-F3 兼容） */
  label?: string;
  /** 新 API（Astryx canonical） */
  content?: ReactNode;
  children: ReactNode;
  /** 旧 API: 'right'|'top'|'bottom'（映射到 Astryx placement） */
  side?: 'right' | 'top' | 'bottom';
  /** 新 API: Astryx placement */
  placement?: LayerPlacement;
}

export function Tooltip({ label, content, children, side, placement }: TooltipProps) {
  const resolvedContent = content ?? label;
  const resolvedPlacement = placement ?? (side ? SIDE_TO_PLACEMENT[side] : 'end');
  return (
    <AstryxTooltip content={resolvedContent} placement={resolvedPlacement}>
      {children}
    </AstryxTooltip>
  );
}
