# Component Policy

> **Document type:** Normative Design Contract  
> **Project:** CommerceCanvas  
> **Phase:** G2-F3.5  
> **Status:** FROZEN  
> **Last Updated:** 2026-08-08

## 1. 分类规则

- **A. Astryx Direct**：直接使用 Astryx 组件，不加 wrapper
- **B. CommerceCanvas Wrapper**：Astryx 组件 + Graphite Canvas theme/token 定制
- **C. CommerceCanvas Custom**：自研组件，Astryx 不适用

## 2. Primitive 分类

| Component | Astryx Export | Policy | Graphite Notes | Status |
|---|---|---|---|---|
| Button | `@astryxdesign/core/Button` | A | variant 映射 Graphite accent 色 | verified |
| IconButton | `@astryxdesign/core/IconButton` | A | icon 来自 Lucide | verified |
| Text | `@astryxdesign/core/Text` | A | type 映射 Typography Contract | verified |
| Heading | `@astryxdesign/core/Heading` | A | level 映射 Typography Contract | verified |
| TextInput | `@astryxdesign/core/TextInput` | A | — | verified |
| TextArea | `@astryxdesign/core/TextArea` | A | — | verified |
| Selector | `@astryxdesign/core/Selector` | A | — | verified |
| CheckboxInput | `@astryxdesign/core/CheckboxInput` | A | — | verified |
| RadioList | `@astryxdesign/core/RadioList` | A | — | planned |
| Switch | `@astryxdesign/core/Switch` | A | — | verified |
| TabList | `@astryxdesign/core/TabList` | B | active 色 = `--gc-accent-blue` | verified |
| Tooltip | `@astryxdesign/core/Tooltip` | A | — | verified |
| Popover | `@astryxdesign/core/Popover` | A | — | planned |
| DropdownMenu | `@astryxdesign/core/DropdownMenu` | A | — | planned |
| Dialog | `@astryxdesign/core/Dialog` | A | — | verified |
| Badge | `@astryxdesign/core/Badge` | B | variant 映射 Graphite status 色 | verified |
| Table | `@astryxdesign/core/Table` | B | compact density 定制 | planned |
| List/ListItem | `@astryxdesign/core/List` | B | hasDividers + Graphite spacing | verified |
| ProgressBar | `@astryxdesign/core/ProgressBar` | A | — | verified |
| Skeleton | `@astryxdesign/core/Skeleton` | A | — | verified |
| EmptyState | `@astryxdesign/core/EmptyState` | A | 中文 title/description | verified |
| Code | `@astryxdesign/core/Code` | A | = `.gc-data` | verified |
| Divider | `@astryxdesign/core/Divider` | A | = `--gc-line` | verified |
| Stack | `@astryxdesign/core/Stack` | A | — | verified |

## 3. CommerceCanvas Custom 组件（保护列表）

以下组件为 CommerceCanvas 业务专有，**不得强行通用化或替换为 Astryx**：

| Component | 为什么 Custom |
|---|---|
| AppShell | 产品结构（DemoControls + AmbientStatus + GlobalRail + Routes + PersistentTaskBar） |
| Media Canvas | 图片编辑/预览画布（Evidence 层、缩放、标注） |
| Evidence Viewer | 证据展示（mask/crop/diff overlay） |
| Live Intelligence Trace | 实时事件轨迹（category tone、sequence、replayed 降权） |
| Persistent Task | 跨路由任务面板（progress/finding/risk/artifact metric） |
| Artifact Lineage | 产物谱系（producer/parent/linked 展示） |
| QC Result Surface | QC 业务展示（status/evidence/review flag/cross-page navigation） |
| Job Node Rail | 任务节点轨道（stageAudit/attempts/risk status） |

这些组件内部可以**复用** Astryx primitive（如 `<Badge>`、`<Text>`、`<Stack>`），但不得被泛化为通用 Astryx 组件。

## 4. Agent UI Development Contract

```text
READ CommerceCanvas design contract（docs/design/*）
↓
READ Astryx actual component API（node_modules/@astryxdesign/core/dist/<Component>/*.d.ts）
↓
LOCATE existing CommerceCanvas primitive（src/components/）
↓
DECIDE Direct / Wrapper / Custom（查本文件分类表）
↓
IMPLEMENT
↓
Runtime Visual Validation（真实浏览器截图）
↓
Keyboard / Accessibility Validation
↓
Screenshot Regression
```

## 5. 禁止

- 凭记忆猜 Astryx API（prop name / type / variant）
- 自己发明不存在的 Astryx prop
- 为了省事重新造 Button / Dialog / Tooltip / Badge
- 无理由使用 arbitrary hex color
- 无理由使用 arbitrary spacing
- 无理由添加新 Typography role（先更新 typography-contract.md）
- 把所有数据变 Card
- 把 metadata 全变 Badge
- 只跑 TypeScript 就宣称 UI 完成
- 用 mock screenshot 冒充真实页面
