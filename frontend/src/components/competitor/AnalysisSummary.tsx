import { useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import type {
  SummaryField,
  VisualLanguageField,
} from '@/types/competitor-analysis';

/**
 * 分析摘要 + 视觉语言 + 继承策略 + 通用折叠分区（右侧检查器，任务书 §6.4）。
 * 紧凑键值对与标签，依赖分割线而非卡片堆叠（任务书 §7.3）。
 */

export function AnalysisSummary({ fields }: { fields: SummaryField[] }) {
  return (
    <Section title="分析摘要">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {fields.map((f) => (
          <div key={f.labelZh} className="contents">
            <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
              {f.labelZh}
            </dt>
            <dd className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>
              {f.valueZh}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function VisualLanguage({ fields }: { fields: VisualLanguageField[] }) {
  return (
    <Section title="视觉语言">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {fields.map((f) => (
          <div key={f.labelZh} className="contents">
            <dt className="text-xs" style={{ color: 'var(--gc-text-faint)' }}>
              {f.labelZh}
            </dt>
            <dd className="text-xs" style={{ color: 'var(--gc-text-mid)' }}>
              {f.valueZh}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/**
 * 可继承 / 禁止继承内容（mvp-prd §7.2）。
 * 可继承：构图方向、光线结构…（蓝色 ✓）
 * 禁止继承：竞品 Logo、型号、包装文字…（红色 ✕）
 * 明确区分是高级感来源（任务书 §7.4）。
 */
export function InheritanceLists({
  inheritableZh,
  prohibitedZh,
}: {
  inheritableZh: string[];
  prohibitedZh: string[];
}) {
  return (
    <Section title="继承策略">
      <div className="mb-3">
        <div
          className="mb-1.5 flex items-center gap-1.5 text-2xs"
          style={{ color: 'var(--gc-accent-blue)' }}
        >
          <Check size={11} strokeWidth={2} />
          <span>可继承</span>
          <span className="gc-data" style={{ color: 'var(--gc-text-faint)' }}>
            {inheritableZh.length}
          </span>
        </div>
        <ul className="flex flex-wrap gap-1">
          {inheritableZh.map((item) => (
            <li
              key={item}
              className="text-2xs"
              style={{
                color: 'var(--gc-text-mid)',
                background: 'var(--gc-accent-blue-soft)',
                border: '1px solid var(--gc-accent-blue-line)',
                padding: '2px 6px',
                borderRadius: 2,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div
          className="mb-1.5 flex items-center gap-1.5 text-2xs"
          style={{ color: 'var(--gc-accent-red)' }}
        >
          <X size={11} strokeWidth={2} />
          <span>禁止继承</span>
          <span className="gc-data" style={{ color: 'var(--gc-text-faint)' }}>
            {prohibitedZh.length}
          </span>
        </div>
        <ul className="flex flex-wrap gap-1">
          {prohibitedZh.map((item) => (
            <li
              key={item}
              className="text-2xs"
              style={{
                color: 'var(--gc-text-mid)',
                background: 'var(--gc-accent-red-soft)',
                border: '1px solid rgba(224,89,79,0.45)',
                padding: '2px 6px',
                borderRadius: 2,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/** 通用折叠分区容器（任务书 §6.4：可用可折叠分组，但不要全做成 Card）*/
export function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="border-b px-4 py-3"
      style={{ borderColor: 'var(--gc-line)' }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-2 flex w-full items-center justify-between"
      >
        <span className="gc-section-label">{title}</span>
        <ChevronRight
          size={12}
          strokeWidth={1.5}
          style={{
            color: 'var(--gc-text-faint)',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 140ms',
          }}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
