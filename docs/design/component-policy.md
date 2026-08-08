# Component Policy

> **Document type:** Design System Normative Contract
> **Project:** CommerceCanvas — 跨境电商商品视觉工作台 / Cross-Border Commerce Visual Studio
> **Foundation:** Graphite Canvas × Astryx 0.3.0
> **Status:** FROZEN for F4 development
> **Owner:** Graphite Canvas Design Authority
> **Last Updated:** 2026-08-08
> **Upstream:** `docs/design/graphite-astryx-foundation.md` §8 references this file.

---

## 0. How to read this document

This is a **normative contract**, not a recommendation. Any agent or developer building
CommerceCanvas UI MUST classify every UI primitive against this policy before implementation.
The workflow in `graphite-astryx-foundation.md` §8 explicitly requires "DECIDE Direct /
Wrapper / Custom（参见 component-policy.md）".

CommerceCanvas 的视觉主权属于 Graphite Canvas；Astryx 提供 UI grammar（组件骨架、交互状态、
排版层级、无障碍、motion）。本文件定义每个 primitive 的归属策略，确保：

- 不重复造 Astryx 已经提供的能力（避免 Button / Dialog / Tooltip 滥造）；
- Graphite Canvas 的深色媒体工作台气质不被 Astryx neutral theme 稀释；
- 业务语义组件（Evidence、Trace、Artifact、QC、Job Node Rail）保持自定义主权。

### Policy categories

| Policy | Name | Meaning |
|---|---|---|
| **A** | Astryx Direct | 直接使用 Astryx 组件原样，不做样式覆盖。仅消费 Astryx token + theme-neutral 即可。 |
| **B** | CommerceCanvas Themed Wrapper | 对 Astryx 组件做 Graphite Canvas theme / token override 后包装为 CommerceCanvas primitive（位于 `frontend/src/components/ui`）。仅当 Astryx 默认外观与 Graphite Canvas 气质有可见冲突时使用。 |
| **C** | CommerceCanvas Custom | 自研组件，Astryx 无对应能力或不适合。承载业务语义、布局主权或 Graphite Canvas 独有交互。 |

### Status legend

| Status | Meaning |
|---|---|
| `LOCKED` | 决策已冻结，F4 实现必须遵守，不得自行降级或改类。 |
| `PROVISIONAL` | 基于当前 Astryx 0.3.0 API 推断，首次落地时需用真实 `.d.ts` 复核；若与 API 冲突需提 decision record。 |

---

## 1. Primitive classification

> Export paths verified against `node_modules/@astryxdesign/core/dist/index.d.ts`
> and subpath `*/index.d.ts` for Astryx `0.3.0` (2026-08-08). Importers MUST re-verify
> the real `.d.ts` at implementation time per the Agent UI Development Contract (§3).

### Legend for the "Astryx Export" column

- `core` → reachable from package root: `import { X } from '@astryxdesign/core'`
- `core/Heading` → **subpath-only**: NOT in root index, must import as
  `import { Heading } from '@astryxdesign/core/Heading'` (or via the subpath barrel).
- `core/List` → component is reachable from root, but a sibling export
  (e.g. `ListItem`) is only available through the `core/List` subpath.

### 1.1 Action & input

| Component | Astryx Export | Policy | Graphite Canvas Notes | Status |
|---|---|---|---|---|
| **Button** | `core` | **B** | Astryx `primary/secondary/ghost/destructive` variants map to Graphite Canvas status semantics (blue 主操作 / neutral 次操作 / ghost 工具操作 / red 销毁). Wrapper remaps Astryx token → `--gc-accent-*` so selected/primary uses `--gc-accent-blue`. 紫色变体不用于通用 Button（FD-027）。 | LOCKED |
| **IconButton** | `core` | **B** | 用于 Media Canvas 工具栏、Rail、Inspector。Wrapper 强制 `--gc-line` 边框、hover 用 `--gc-bg-elev-2`、focus-visible 用 `--gc-accent-blue-line`。 | LOCKED |
| **Text** | `core` | **B** | 排版骨架走 Astryx type system，但文字色必须落到 Graphite Canvas 层级：`--gc-text-hi/mid/lo/faint`。禁止用 Astryx neutral text token 直出，避免与 Graphite Canvas 文字层级脱节。 | LOCKED |
| **Heading** | `core/Heading` | **B** | **Subpath-only export**（不在 root `index.d.ts`，必须 `from '@astryxdesign/core/Heading'`）。Wrapper 锁定 Graphite Canvas 标题字号与 `--gc-text-hi`，并约束 heading level 语义。 | LOCKED |
| **TextInput** | `core` | **B** | 表单输入框。Wrapper 注入 Graphite Canvas 暗色 surface（`--gc-bg-elev-1`）、`--gc-line` 边框、focus 态用 `--gc-accent-blue-line`，保持与工作台 chrome 一致。 | LOCKED |
| **TextArea** | `core` | **B** | 同 TextInput。用于 Recipe / 评注 / 风险说明等中文长文本输入（FD-034 客户可见中文）。 | LOCKED |
| **Selector** | `core` | **B** | Astryx `Selector` 含 combobox / status 语义。Wrapper 用于平台选择、模型意图选择（FD-014 快速/均衡/高质量/商品保真优先/文字准确优先）。Token 映射同 TextInput + 状态色。 | LOCKED |
| **CheckboxInput** | `core` | **A** | Astryx 原生交互状态足够，token 层由 theme-neutral 承载。仅当出现在 Evidence/QC 等业务面时，外层容器走 Graphite Canvas 布局，组件本身不覆盖。 | LOCKED |
| **RadioList** | `core` | **A** | 用于单选枚举（导出格式、部署模式 FD-004、QC 决议）。Astryx 原生 radio + keyboard 即满足。 | LOCKED |
| **Switch** | `core` | **A** | 开关项。Astryx 原生 toggle 满足，token 由 theme-neutral 承载。 | LOCKED |

### 1.2 Navigation & disclosure

| Component | Astryx Export | Policy | Graphite Canvas Notes | Status |
|---|---|---|---|---|
| **TabList** | `core` | **B** | Astryx `TabList/Tab/TabMenu` 用于 Inspector / Job Detail 多视图切换。Wrapper 强制选中态用 `--gc-accent-blue`、未选用 `--gc-text-lo`，下划线/指示条用 Graphite Canvas 尺度，避免 Astryx neutral 默认过亮。 | LOCKED |
| **Tooltip** | `core` | **B** | 工具提示。Wrapper 注入 `--gc-bg-elev-2` surface + `--gc-text-hi` 文字 + `--gc-font-sans`。**注意**：`frontend/src/components/ui/Tooltip.tsx` 已存在，F4 起该 wrapper 必须以 Astryx Tooltip 为底层，不得继续自研。 | LOCKED |
| **Popover** | `core` | **B** | 富信息浮层（Evidence 预览、Artifact 详情、Risk 说明）。Wrapper 强制 surface = `--gc-bg-elev-2`、边框 = `--gc-line-strong`、阴影克制（FD-027 禁玻璃拟态）。 | LOCKED |
| **DropdownMenu** | `core` | **B** | 命令菜单 / 更多操作。Token 映射同 Popover。Keyboard navigation 与 focus trap 由 Astryx 提供，不得自研。 | LOCKED |
| **Dialog** | `core` | **B** | Astryx `Dialog` 提供 `standard` / `fullscreen` variant 及 header 组合。Wrapper 注入 Graphite Canvas surface、圆角克制、遮罩用 `--gc-bg-base` 半透明。Fullscreen variant 用于 Expanded Task Panel（FD-037）。 | LOCKED |

### 1.3 Display

| Component | Astryx Export | Policy | Graphite Canvas Notes | Status |
|---|---|---|---|---|
| **Badge** | `core` | **B** | 状态标签。Astryx Badge 默认外观可用，但语义色必须落到 Graphite Canvas：QC 通过=green、风险=amber、失败=red、AI 智能能力=purple（克制，FD-027）、选中=blue。Wrapper 提供语义 preset，禁止业务代码内联 hex。 | LOCKED |
| **Table** | `core` | **B** | 数据密集表（Artifact list、Cost audit、Node list）。Wrapper 锁定行高密度（Graphite Canvas 偏 compact，FD-027）、表头 `--gc-text-lo`、分隔线 `--gc-line`、hover 行 `--gc-bg-elev-1`。 | LOCKED |
| **List / ListItem** | `core` / `core/List` | **B** | Astryx `List` 提供密度 variant。Wrapper 锁定 Graphite Canvas 密度 + token。**注意**：`ListItem` 不在 root index，必须 `import { ListItem } from '@astryxdesign/core/List'`。 | LOCKED |
| **ProgressBar** | `core` | **B** | 任务/批处理进度。Wrapper 强制 fill = `--gc-accent-blue`、track = `--gc-line`、 determinate/indeterminate 行为沿用 Astryx。**Live Intelligence 真实进度必须对应真实阶段（FD-036）**，不得用进度条造假。 | LOCKED |
| **Skeleton** | `core` | **A** | 加载占位。Astryx 原生 skeleton + theme-neutral shimmer 满足。 | LOCKED |
| **EmptyState** | `core` | **B** | 空状态（无 Artifact、无 Job、无 Evidence）。Wrapper 注入 Graphite Canvas 排版与 `--gc-text-lo` 文案，中文短句（FD-034）。 | LOCKED |
| **Code** | `core/Code` | **A** | 内联等宽片段。**Subpath-only export**（`from '@astryxdesign/core/Code'`）。Graphite Canvas `--gc-font-mono` 由 theme 层映射，组件本身不覆盖。 | LOCKED |
| **Divider** | `core` | **A** | 分隔线。Astryx 原生 divider 满足；颜色由 theme 层映射到 `--gc-line`。 | LOCKED |
| **Stack** | `core` | **A** | 布局 primitive（`Stack` / `VStack` / `HStack`）。Astryx 原生 spacing/align 满足。**优先 Stack 而非手写 flex**，统一布局 grammar。 | LOCKED |

> Implementation note: any component marked **PROVISIONAL** in future revisions must be
> resolved to **LOCKED** before it can be referenced from a feature spec. No feature task
> may depend on a PROVISIONAL primitive.

---

## 2. CommerceCanvas Custom — protected surface

以下组件为 **Graphite Canvas 产品主权**，Astryx 不适合或无对应能力。这些组件必须自研，
**禁止用 Astryx primitive 拼装冒充**，也禁止在没有 design record 的情况下改写为 Astryx 包装。

| Component | Location (current / target) | Why Custom (Astryx 不适合) | Protection rule |
|---|---|---|---|
| **AppShell** | `frontend/src/components/layout/*` (GlobalRail, ContextSidebar, InspectorPanel, PersistentTaskBar) | Astryx ships an `AppShell`, but CommerceCanvas 的三柱工作台（64 / 220–260 / 320–360）+ 底部 Persistent Task Bar 是 FD-027/FD-037 产品主权，与 Astryx 通用 shell 语义不同。 | Astryx `AppShell` **不得作为顶层布局**。柱宽严格走 `--gc-rail-width / --gc-ctx-width / --gc-inspector-width / --gc-taskbar-height`。改动需 design record。 |
| **Media Canvas** | `frontend/src/components/competitor/CompetitorAnalysisCanvas.tsx`, `EvidenceOverlay.tsx` | 中央媒体画布：最暗背景 (`--gc-bg-canvas`)、图像优先、Evidence 叠加层（`--gc-evidence-*` 语义色）。Astryx 无媒体画布能力。 | 不得用 Astryx `AspectRatio`/`Layer` 替代主画布。Evidence 色严格走 `--gc-evidence-subject/logo/safe/guide`。 |
| **Evidence Viewer** | `frontend/src/components/competitor/EvidenceOverlay.tsx` | 证据查看器：承载 FD-016 可审计证据、FD-036 可检视中间结果。需要像素级标注、region 锁定、跨页回跳（g2-f3 验证过 cross-page evidence return）。 | 禁止用 Badge/Popover 拼装冒充。证据语义色不可改。 |
| **Live Intelligence Trace** | `frontend/src/features/live-intelligence/components/AnalysisTrace.tsx`, `StageRail.tsx`, `ExpandedTaskPanel.tsx` | FD-031 横向能力：可见的、真实的智能过程。需要阶段化叙事（FD-035 中文产品叙事）、reconnectable SSE（FD-032）、ordered/replayable（FD-033）。Astryx 无此业务语义。 | **禁止 fake thinking / 假百分比 / code rain（FD-036）**。trace 必须对应真实 worker 事件。 |
| **Persistent Task** | `frontend/src/components/layout/PersistentTaskBar.tsx` | FD-037：跨核心页面跟随活动任务，可展开为完整 Task Detail。需要跨页持久、状态恢复、非阻塞性。 | 不得降级为普通 footer 或 toast。展开态复用 Dialog `fullscreen` variant 是允许的（§1.2）。 |
| **Artifact Lineage** | `frontend/src/features/job-detail/*` (g2-f3 validated) | Artifact 版本血缘：FD-030 版本不可覆盖、每次 attempt 记录（FD-016）。需要 DAG / 时间线表达，Astryx `TreeList` 无法承载血缘语义。 | 不得用 `TreeList` 冒充血缘。版本语义不可弱化。 |
| **QC Result Surface** | `frontend/src/features/job-detail/*` (qc-risk surfaces) | FD-017 四层 QC（L0 确定性 / L1 专门 / L2 VLM / L3 人工）、FD-018 VLM 不可覆盖硬失败。需要分级结果呈现、阻断/通过/待审状态。 | 状态色严格走 Graphite Canvas 状态语义（green/amber/red）。VLM 不可凌驾规则不可在 UI 上绕过。 |
| **Job Node Rail** | `frontend/src/components/layout/GlobalRail.tsx` + job surfaces | Job 节点导航：跨路由持久（g2-f3 cross-route persistence 验证）、reconnect、admin/customer 角色差异化诊断（g2-f3 admin-diagnostics vs customer-no-diagnostics）。 | 持久化与角色可见性是产品契约，不可简化为普通 nav。 |

> 这些组件属于 **Graphite Canvas Custom（C 类）**。它们不消费 Astryx 组件作为主体，
> 但其内部仍应使用 §1 的 A/B 类 primitive（如 Badge、Tooltip、IconButton）来构建原子，
> 避免在 Custom 组件内部重新造原子级 UI。

---

## 3. Agent UI Development Contract

所有 agent / developer 在实现任何 CommerceCanvas UI 前，**必须**按以下固定顺序执行，
不得跳步（与 `graphite-astryx-foundation.md` §8 一致）。跳步产出的 UI 视为不合规，Reviewer 可直接 REJECT。

```text
1. READ design contract
   - docs/design/component-policy.md（本文件）
   - docs/design/graphite-astryx-foundation.md
   - 相关 FD（docs/governance/frozen-decisions.md，至少 FD-027/031/034/036/037）

2. READ Astryx docs
   - node_modules/@astryxdesign/core/dist/<Component>/*.doc.mjs（若存在）
   - 不凭记忆判断 Astryx 行为

3. READ actual component API
   - node_modules/@astryxdesign/core/dist/<Component>/index.d.ts
   - 确认 props / variant / subpath export（注意 Heading / Code / ListItem 等 subpath-only）
   - 不得基于记忆或训练数据推断 API

4. LOCATE existing primitive
   - frontend/src/components/ui/* 是否已有 wrapper
   - frontend/src/components/layout/* / features/* 是否已有 Custom 实现
   - 优先复用，禁止重复造

5. DECIDE direct / wrapper / custom
   - 查 §1 表格的 Policy（A/B/C）与 Status
   - LOCKED 项不得自行改类；PROVISIONAL 项需先升 LOCKED

6. IMPLEMENT
   - A 类：直接 import Astryx
   - B 类：在 frontend/src/components/ui 下创建/复用 wrapper，token 映射到 --gc-*
   - C 类：在对应 layout / feature 目录，遵守 §2 保护规则
   - 任何 mock / placeholder 必须显式标记

7. Visual Runtime Validation
   - 真实启动 dev server，目标页面在真实浏览器渲染
   - 证据等级 ≥ E3 RUNTIME（截图 / 录屏），不得用 E1 STATIC（diff 存在）冒充
   - 深色工作台气质、状态色、密度必须肉眼确认

8. Keyboard / Accessibility Validation
   - Tab / Shift+Tab / Enter / Space / Esc / Arrow 键盘路径
   - focus-visible 可见（Graphite Canvas 用 --gc-accent-blue-line）
   - aria 语义沿用 Astryx，不自造

9. Screenshot Regression
   - 关键状态（idle / loading / running / completed / error）各留证
   - 存入 artifacts/frontend/<phase>/，附 screenshot-manifest.json
   - 与上一基线对比，回归需记录原因
```

> 与 `execution-discipline` 一致：步骤 1–4 属于 READ，5 属于 DECIDE，6 属于
> MAKE SMALLEST CORRECT CHANGE，7–9 属于 VERIFY。任何环节证据缺失只能报告 PARTIAL，
> 不得宣布 READY_FOR_REVIEW。

---

## 4. Prohibited

以下行为在本 contract 下**明确禁止**。Reviewer 发现任一项即可 REJECT，无需进一步证据。

### 4.1 API 与实现诚信

- **禁止凭记忆猜 Astryx API**。props 名、variant 名、subpath 路径必须来自当前 revision 的
  `node_modules/@astryxdesign/core/dist/**/*.d.ts`。
- **禁止发明 props**。若 Astryx 组件无某 prop，不得在调用处假装存在；缺失能力走 wrapper 或 custom。
- **禁止用 mock / placeholder 冒充真实 UI 链路**（execution-discipline §C）。任何 placeholder 必须显式标记。
- **禁止用 TypeScript 通过 / 测试全绿冒充 UI 验收**（execution-discipline §D）。UI 完成必须满足步骤 7–9 的 RUNTIME 证据。

### 4.2 设计 token 与视觉主权

- **禁止发明任意 hex 颜色**。所有颜色必须来自 `frontend/src/styles/tokens.css`（`--gc-*`）或 Astryx theme-neutral。业务代码内联 `#xxxxxx` 视为违规。
- **禁止自由新增字号 / 字重 / 间距**。排版走 Astryx type system，间距走 Graphite Canvas token 或 Astryx spacing scale。
- **禁止大面积紫色渐变、玻璃拟态、霓虹发光**（FD-027）。紫色仅克制用于 AI / 智能能力（`--gc-accent-purple`）。
- **禁止用 Badge 滥用 / Card 滥用**（foundation doc §8）。Badge 仅用于状态语义，Card 不作为主信息容器（Graphite Canvas 偏 Row/List/Table，FD-027）。

### 4.3 组件归属

- **禁止重新造 Astryx 已有的 primitive**（Button / Dialog / Tooltip / Tabs / Selector / Table 等）。已有能力走 §1 的 A/B 类。
- **禁止把 §2 的 Custom 组件改写为 Astryx 包装**而无 design record。AppShell / Media Canvas / Evidence Viewer / Live Intelligence Trace / Persistent Task / Artifact Lineage / QC Result Surface / Job Node Rail 是产品主权。
- **禁止用 Astryx `AppShell` 作为 CommerceCanvas 顶层布局**（见 §2）。Astryx AppShell 语义与 Graphite Canvas 三柱工作台不兼容。
- **禁止在 Custom 组件内部重新造原子 UI**。Custom 组件内部应消费 §1 的 A/B 类 primitive。

### 4.4 业务语义与产品契约

- **禁止 fake thinking / 假百分比 / code rain / invented metrics**（FD-036）。Live Intelligence Trace 必须对应真实 worker 事件。
- **禁止把 VLM QC 结果渲染为可覆盖硬失败**（FD-018）。QC Result Surface 的状态语义不可在 UI 上弱化。
- **禁止在客户可见 UI 混入英文技术术语**（FD-034）。客户可见文字必须为简体中文；技术英文仅限内部诊断面（如 admin-diagnostics）。
- **禁止把 Persistent Task 简化为普通 footer / toast**（FD-037）。跨页持久与展开为 Task Detail 是产品契约。

---

## 5. Conformance & change control

- 本文件为 **FROZEN** contract。任何 Policy（A/B/C）、Status、Custom 保护清单的变更必须提
  design record，说明：rationale、证据、影响文档、迁移路径、验收影响（与 frozen-decisions 治理一致）。
- 新增 primitive 时，必须先在本文件 §1 补行并定 Status，再进入 feature 实现。
- Astryx 版本升级（当前 0.3.0）触发本文件全表复核：subpath export、props、variant 可能变化，
  PROVISIONAL 项需重新验证。
- 本文件与 `graphite-astryx-foundation.md` §8、`docs/governance/frozen-decisions.md`（FD-027/031/034/036/037）共同构成 UI 实现的强制上游约束。
