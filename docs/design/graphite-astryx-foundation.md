# Graphite Canvas × Astryx Foundation

> **Document type:** Design System Foundation Contract  
> **Project:** CommerceCanvas — Cross-Border Commerce Visual Studio  
> **Phase:** G2-F3.5  
> **Status:** FROZEN for F4 development  
> **Last Updated:** 2026-08-08

## 1. 最终公式

```text
CommerceCanvas Visual System
=
Graphite Canvas Product Language
+
Astryx Industrial UI Foundation
```

Graphite Canvas 拥有产品视觉主权。Astryx 提供底层 UI grammar（组件、交互状态、排版、无障碍）。

## 2. 职责边界

### Graphite Canvas 负责

| 领域 | 内容 |
|---|---|
| 品牌气质 | 深色媒体工作台、非纯黑、低噪音 UI chrome |
| 布局 | AppShell 产品结构、Media Canvas、Inspector、Persistent Task |
| 业务语义 | Evidence、Trace、Artifact、QC、Job Node Rail |
| 中文交互 | 客户可见 UI 全中文 |
| 状态体系 | 蓝/紫/绿/黄/红状态色，紫色克制 |
| 信息架构 | 页面主次关系、数据密度、Row/List/Table 优先 |

### Astryx 负责

| 领域 | 内容 |
|---|---|
| 组件 | Button、Input、Selector、Tabs、Dialog、Tooltip、Popover、Badge、Table、List |
| 排版 | Typography hierarchy（Text/Heading 组件 + type system） |
| 交互状态 | hover/pressed/focus-visible/disabled/loading 统一 |
| 无障碍 | keyboard navigation、focus trap、aria 语义 |
| Motion | 短、克制、功能性 transition |

## 3. 技术版本

```text
React: 19.2.8
react-dom: 19.2.8
@astryxdesign/core: 0.3.0
@astryxdesign/theme-neutral: 0.3.0
@stylexjs/stylex: 0.19.0
Tailwind CSS: 3.4.15 (v3, NOT v4)
```

## 4. Theme Architecture

```
Astryx neutral theme（foundation）
  ↓ mapped via CSS custom properties
Graphite Canvas semantic tokens（--gc-*）
  ↓ consumed by
CommerceCanvas components
```

Graphite Canvas 保持自己的 CSS 变量系统（`--gc-bg-base`、`--gc-text-hi`、`--gc-accent-blue` 等）。
Astryx 组件通过 StyleX 使用自己的 token，但通过 CSS cascade layer 确保 Graphite Canvas 基础样式优先。

## 5. CSS Layer Architecture

```css
@layer reset, tw-preflight, astryx-reset, astryx-base, astryx-theme, graphite-base, tw-components, tw-utilities;
```

| Layer | 来源 | 优先级 |
|---|---|---|
| `reset` | reserved | lowest |
| `tw-preflight` | Tailwind `@tailwind base` | low |
| `astryx-reset` | Astryx theme-neutral reset | low |
| `astryx-base` | Astryx component StyleX | medium |
| `astryx-theme` | Astryx theme tokens | medium |
| `graphite-base` | Graphite Canvas body/scrollbar/mono | medium-high |
| `tw-components` | `.gc-section-label` etc. | high |
| `tw-utilities` | layout/flex/spacing utilities | highest |

**关键不变量**：无 unlayered reset；Tailwind preflight 不覆盖 Astryx；Graphite Canvas body 基础样式高于 Astryx base。

## 6. Semantic Token Domains

Graphite Canvas 已建立的 token 域（`src/styles/tokens.css`）：

| Domain | Variables | 用途 |
|---|---|---|
| surface | `--gc-bg-base/elev-1/elev-2/app` | 背景层级 |
| text | `--gc-text-hi/mid/lo/faint` | 文字层级 |
| border | `--gc-line/line-strong` | 分隔线 |
| accent | `--gc-accent-blue/purple/green/amber/red` | 状态色 |
| typography | `--gc-font-sans/mono` | 字体族 |
| spacing | `--gc-taskbar-height` 等 | 布局尺寸 |

## 7. F0-F3 Migration Policy

```text
F3.5: Foundation + Smoke Test + Design Contracts（已完成）
F4:  所有新页面使用 Foundation
F5:  渐进 retrofit F0-F3 现有页面
```

F0-F3 现有页面（Competitor Analysis、Job Detail）保持 Tailwind + `--gc-*` 变量不变。
F4 新页面优先使用 Astryx 组件 + Typography Contract + Density Guidelines。

## 8. Agent UI Development Rules

```text
READ CommerceCanvas design contract（本文件 + docs/design/*）
↓
READ Astryx relevant docs（实际 component API，不凭记忆）
↓
READ actual component API（node_modules/@astryxdesign/core/dist/<Component>/*.d.ts）
↓
LOCATE existing CommerceCanvas primitive
↓
DECIDE Direct / Wrapper / Custom（参见 component-policy.md）
↓
IMPLEMENT
↓
Runtime Visual Validation
↓
Keyboard / Accessibility Validation
↓
Screenshot Regression
```

**禁止**：凭记忆猜 Astryx API、自由新增字号/颜色/间距、重新造 Button/Dialog/Tooltip、Card 滥用、Badge 滥用、只跑 TypeScript 就宣布 UI 完成。
