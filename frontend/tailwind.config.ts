import type { Config } from 'tailwindcss';

// Graphite Canvas 设计 Token：深灰中性、低对比、克制圆角。
// 数值与 styles/tokens.css 保持一致，避免魔法数散落。
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 背景层级（由深到浅）
        graphite: {
          950: 'var(--gc-bg-base)', // 页面主背景：石墨黑
          900: 'var(--gc-bg-app)', // 工作区
          850: 'var(--gc-bg-elev-1)', // 面板/工具栏
          800: 'var(--gc-bg-elev-2)', // 悬浮面板
          700: 'var(--gc-line)', // 分割线/冷灰
        },
        // 文字层级
        ink: {
          hi: 'var(--gc-text-hi)', // 接近白
          mid: 'var(--gc-text-mid)', // 主文字
          lo: 'var(--gc-text-lo)', // 次要文字
          faint: 'var(--gc-text-faint)', // 极弱
        },
        // 状态色（FD-027：克制使用）
        signal: {
          blue: 'var(--gc-accent-blue)', // 选中/主操作
          purple: 'var(--gc-accent-purple)', // 仅 AI/分析能力
          green: 'var(--gc-accent-green)', // 通过/完成
          amber: 'var(--gc-accent-amber)', // 待检查/风险
          red: 'var(--gc-accent-red)', // 失败/阻断
        },
      },
      fontFamily: {
        sans: 'var(--gc-font-sans)',
        mono: 'var(--gc-font-mono)',
      },
      fontSize: {
        // 紧凑字号体系（信息密度但有序）
        '2xs': ['11px', { lineHeight: '16px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '20px' }],
        base: ['14px', { lineHeight: '20px' }],
      },
      borderRadius: {
        // 克制圆角，避免圆角卡片堆叠
        none: '0px',
        xs: '2px',
        sm: '3px',
      },
      spacing: {
        // 工作台柱宽（任务书指定）
        rail: '64px',
        ctx: '244px', // 220–260 区间中值
        inspector: '340px', // 320–360 区间中值
      },
      boxShadow: {
        // 克制阴影，避免大面积阴影
        line: 'inset 0 -1px 0 var(--gc-line)',
      },
      transitionDuration: {
        // 动效预算（计划 §8）：常规 120–180ms，面板 180–240ms
        snap: '140ms',
        panel: '220ms',
      },
    },
  },
  plugins: [],
};

export default config;
