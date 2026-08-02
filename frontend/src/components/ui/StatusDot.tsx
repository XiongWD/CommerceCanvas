/**
 * 状态点：用于在缩略图、轨迹、任务栏等处传达状态色语义（FD-027）。
 *   green  完成/通过
 *   amber  待检查/风险
 *   red    失败/阻断
 *   blue   选中
 *   purple AI/分析能力（克制）
 *   neutral 中性
 */
export type StatusTone = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'neutral';

const toneVar: Record<StatusTone, string> = {
  green: 'var(--gc-accent-green)',
  amber: 'var(--gc-accent-amber)',
  red: 'var(--gc-accent-red)',
  blue: 'var(--gc-accent-blue)',
  purple: 'var(--gc-accent-purple)',
  neutral: 'var(--gc-text-faint)',
};

export function StatusDot({
  tone,
  pulse = false,
  size = 6,
}: {
  tone: StatusTone;
  pulse?: boolean;
  size?: number;
}) {
  return (
    <span
      className="gc-dot"
      style={{
        width: size,
        height: size,
        background: toneVar[tone],
        boxShadow: pulse ? `0 0 0 2px ${toneVar[tone]}33` : undefined,
      }}
    />
  );
}
