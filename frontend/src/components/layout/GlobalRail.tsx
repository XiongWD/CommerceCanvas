import {
  ListTree,
  Package,
  ScanSearch,
  Sparkles,
  Languages,
  ShieldCheck,
  Activity,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

/**
 * 全局图标栏（任务书 §6.1）。
 * 固定 64px，克制，不显示大段文字，悬停中文 Tooltip，底部用户/设置。
 * 不是传统左侧后台菜单（FD-027 / 反模式验收）。
 * 当前"竞品分析"为选中态。
 */

interface RailEntry {
  /** 中文导航名（glossary.md 客户名） */
  labelZh: string;
  icon: LucideIcon;
  selected?: boolean;
}

const entries: RailEntry[] = [
  { labelZh: '工作队列', icon: ListTree },
  { labelZh: '商品工作区', icon: Package },
  { labelZh: '竞品分析', icon: ScanSearch, selected: true },
  { labelZh: '生成工作室', icon: Sparkles },
  { labelZh: '本地化工作室', icon: Languages },
  { labelZh: '审核室', icon: ShieldCheck },
  { labelZh: '任务详情', icon: Activity },
];

export function GlobalRail() {
  return (
    <nav
      aria-label="主导航"
      className="flex shrink-0 flex-col items-center justify-between border-r py-3"
      style={{
        width: 'var(--gc-rail-width, 64px)',
        background: 'var(--gc-bg-base)',
        borderColor: 'var(--gc-line)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* 品牌标记：克制，仅小尺寸 */}
        <div
          className="mb-3 flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            background:
              'linear-gradient(135deg, var(--gc-bg-elev-2), var(--gc-bg-elev-1))',
            border: '1px solid var(--gc-line-strong)',
          }}
          title="CommerceCanvas"
        >
          <span
            className="font-mono text-xs"
            style={{ color: 'var(--gc-accent-blue)', fontWeight: 600 }}
          >
            CC
          </span>
        </div>

        {entries.map((e) => (
          <RailButton key={e.labelZh} entry={e} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Tooltip label="设置" side="right">
          <button
            aria-label="设置"
            className="flex h-9 w-9 items-center justify-center rounded-sm transition-colors duration-snap hover:bg-[var(--gc-bg-elev-1)]"
            style={{ color: 'var(--gc-text-lo)' }}
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </Tooltip>
        {/* 用户头像占位 */}
        <Tooltip label="当前用户：演示工作室" side="right">
          <button
            aria-label="用户"
            className="flex h-9 w-9 items-center justify-center rounded-sm"
            style={{
              background: 'var(--gc-accent-blue-soft)',
              border: '1px solid var(--gc-accent-blue-line)',
              color: 'var(--gc-accent-blue)',
            }}
          >
            <span className="text-xs font-medium">OW</span>
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}

function RailButton({ entry }: { entry: RailEntry }) {
  const { icon: Icon, labelZh, selected } = entry;
  return (
    <Tooltip label={labelZh} side="right">
      <button
        aria-label={labelZh}
        aria-current={selected ? 'page' : undefined}
        className="group relative flex h-9 w-9 items-center justify-center rounded-sm transition-colors duration-snap"
        style={{
          background: selected ? 'var(--gc-accent-blue-soft)' : 'transparent',
          color: selected
            ? 'var(--gc-accent-blue)'
            : 'var(--gc-text-lo)',
        }}
      >
        {/* 选中态：左侧 2px 蓝色指示条，克制非发光（FD-027）*/}
        {selected && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2"
            style={{
              width: 2,
              height: 18,
              background: 'var(--gc-accent-blue)',
            }}
          />
        )}
        <Icon size={18} strokeWidth={1.5} />
      </button>
    </Tooltip>
  );
}
