# Typography Contract — CommerceCanvas

> **Document status:** Normative contract (G2 design layer)
> **Version:** 1.0.0
> **Baseline date:** 2026-08-08
> **Project:** CommerceCanvas — 跨境电商商品视觉工作台 (Cross-Border Commerce Visual Studio)
> **Authority:** FD-027 (Graphite Canvas: media-first, dark neutral, compact, no KPI-card dominance, no large headings/gradients/glassmorphism), FD-034 (zh-CN 全部客户可见 UI), FD-036 (真实指标、克制高信息动效，禁止假数据/假终端/code rain)
> **Authority files (单一事实来源):** `frontend/src/styles/tokens.css`, `frontend/src/styles/globals.css`, `frontend/tailwind.config.ts`
> **Change rule:** 这是合同，不是建议。任何 ZCode 实施代理在写或改 UI 文字样式前必须遵守本文。新增/修改字体角色必须先改本合同（见 §11）。

---

## 0. 适用范围与权威性 (Scope & Authority)

本合同定义 CommerceCanvas 前端全部客户可见 UI 与内部工作台界面的字体角色（Typography Roles）、字号、字重、行高、字间距、颜色与允许用途。

**强制层级：**

1. 角色（Role）是第一公民。先选角色，再选实现。一个 DOM 文本节点必须能映射到且仅映射到一个角色。
2. 字号、行高、字间距必须来自 §2 的受限刻度，禁止任意值（见 §9）。
3. 颜色必须来自 Graphite Canvas 文字层级变量或状态色变量（见 §4、§7）。
4. 实现路径优先级：Tailwind utility + 内联 `var(--gc-*)` 样式（与现有代码一致）> Astryx `<Text>` 组件（语义同义，见 §8）。两者都受本合同角色约束。

**本合同不约束：** 第三方依赖（Astryx 内部、浏览器原生控件、`<canvas>` 内绘制的位图文字）。导出物料（图片/视频内嵌文字）由物料规格约束，不由本合同约束。

---

## 1. 设计原则 (Principles)

1. **中文优先 (Chinese-first)。** 所有客户可见文字为简体中文（FD-034）。字体栈以 CJK 字体开头，等宽仅用于纯 ASCII 技术标识（见 §3、§10）。
2. **紧凑但有序 (Compact, ordered)。** 13px 基准，信息密度高，但严格走 4 档受限刻度，禁止散落魔法数字（FD-027）。
3. **无大标题 (No large headings)。** 即使是页面标题也保持克制，不做营销式大字（FD-027；`globals.css` 注释：「内容分隔标题：低对比、无大标题」）。
4. **依赖分割线组织内容，而非字号跳跃 (Organize with dividers, not size jumps)。** 层级靠颜色对比（hi→faint）和分割线表达，而非放大字号（FD-027）。
5. **等宽用于对齐与可读性 (Mono for alignment & legibility)。** 数值、ID、时间、代码用等宽 + `tabular-nums`，保证表格/chip 对齐。
6. **真实数据克制呈现 (Truthful, restrained metrics)。** 指标用真实数值 + 等宽数字，禁止放大假数据 KPI 卡（FD-027、FD-036）。

---

## 2. 字号与行高体系 (Type Scale)

受 4 档刻度，定义在 `tailwind.config.ts` 的 `theme.extend.fontSize`，是全部角色的唯一字号来源。

| Token | Tailwind class | Font size | Line height | 比值 (lh/size) | 用途边界 |
|---|---|---|---|---|---|
| `2xs` | `text-2xs` | 11px | 16px | 1.45 | 最小：状态、时间戳、SKU chip、caption |
| `xs`  | `text-xs`  | 12px | 16px | 1.33 | Label、metadata、辅助说明 |
| `sm`  | `text-sm`  | **13px (BASE)** | 20px | 1.54 | **Body 与多数标题的基准字号** |
| `base`| `text-base`| 14px | 20px | 1.43 | 仅强调正文 / 极少使用 |

**基准：** `body { font-size: 13px }`（`globals.css`）。13px 是项目正文基准，不是 14px。这与 Astryx 默认（`--text-body-size = --font-size-base = 14px`）存在 1px 差异，见 §8 的处理规则。

**禁止：** `text-lg`、`text-xl`、`text-2xl` 等 Tailwind 大字号 utility 在本工作台 UI 中**默认禁用**（违反 FD-027 无大标题）。如确需（例如 hero 指标，且 FD-036 已确认真实），必须经 §11 新增角色流程批准。

---

## 3. 字体栈 (Font Stacks)

定义在 `tokens.css`。禁止在组件内硬编码 `font-family`。

| 栈 | 变量 | 值 | 用途 |
|---|---|---|---|
| Sans (主) | `--gc-font-sans` | `'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | 全部中文标题/正文/中英混排；Tailwind `font-sans`，body 默认 |
| Mono (等宽) | `--gc-font-mono` | `'JetBrains Mono', 'SFMono-Regular', 'Cascadia Code', Consolas, 'Liberation Mono', Menlo, monospace` | 纯 ASCII 技术标识：SKU、Job ID、Trace ID、时间戳、代码、数值；Tailwind `font-mono`，类 `.font-mono` / `.gc-data` |

**关键规则：** 等宽字体不含 CJK 字形。中英混排的句子必须用 Sans；只有**纯 ASCII 片段**（ID、时间、代码）才用 Mono。中英混排时强行用 Mono 会导致 CJK 字符回退到系统默认，破坏对齐与可读性（见 §10）。

---

## 4. 文字颜色层级 (Color Roles)

定义在 `tokens.css`，经 `tailwind.config.ts` 暴露为 `ink.*`（文字）与 `signal.*`（状态）。

| 层级 | CSS 变量 | 值 | Tailwind | 语义 | 默认承载角色 |
|---|---|---|---|---|---|
| High | `--gc-text-hi` | `#e8eaed` | `text-ink-hi` | 接近白，最强 | Page Title、Panel Title、Metric、强调正文 |
| Mid | `--gc-text-mid` | `#b4b9c1` | `text-ink-mid` | 主文字（中性灰） | **Body 默认色**、Code |
| Low | `--gc-text-lo` | `#7a818d` | `text-ink-lo` | 次要文字 | Page Context、Label、Metadata、Timestamp |
| Faint | `--gc-text-faint` | `#565d68` | `text-ink-faint` | 极弱说明 | Section Title、Caption |
| Signal | `--gc-accent-*` | blue/purple/green/amber/red | `text-signal-*` | 状态语义 | Status（blue 选中/主操作；purple 仅 AI；green 通过；amber 待检/风险；red 失败/阻断） |

**body 默认色是 `--gc-text-mid`**（`globals.css`）。未显式着色的文本继承 Mid。

**状态色使用纪律（FD-027）：** signal 色克制点缀，不用于大面积背景或正文。purple 仅用于 AI/分析能力。

---

## 5. Typography Roles 总表 (Role Master Table)

> 这是本合同的核心。每一行是一个**固定角色**：实施代理按用途选行，按行的列值实现，不得自行组合出未列出的规格。

| Role | Purpose (用途) | Font Family | Font Size | Font Weight | Line Height | Letter Spacing | Color Role | Allowed Usage (允许用途) |
|---|---|---|---|---|---|---|---|---|
| **Page Title** | 页面主标题，标示当前核心页面 | Sans (`--gc-font-sans`) | 13px / `text-sm` | 600 (semibold) | 20px | 0.01em | `--gc-text-hi` (ink.hi) | 每个核心页面顶部仅一处：商品库 / 任务 / 画布 / 审校 / 导出。**禁止**用作卡片/区块标题。 |
| **Page Context** | 页面标题正下方的上下文副标题 | Sans | 12px / `text-xs` | 400 (normal) | 16px | 0 | `--gc-text-lo` (ink.lo) | 当前项目名、批次、阶段、SKU 范围等一行上下文。紧随 Page Title。 |
| **Section Title** | 面板内内容分隔标题 | Sans | 11px / `text-2xs` | 500 (medium) | 16px | **0.08em (uppercase, Latin)** | `--gc-text-faint` (ink.faint) | 面板内分组分隔（任务书 §7.2「内容分隔标题」）。等价类 `.gc-section-label`。**中文分组标题**用 §6.3 的中文变体，不得全大写。 |
| **Panel Title** | 面板 / 列 / 对话框标题 | Sans | 13px / `text-sm` | 500 (medium) | 20px | 0 | `--gc-text-hi` (ink.hi) | 检查器列头、上下文栏头、对话框头、侧抽屉头。 |
| **Body** | 正文主体 | Sans | **13px / `text-sm` (BASE)** | 400 (normal) | 20px | 0 | `--gc-text-mid` (ink.mid) | 段落、描述、列表、表单辅助文字、表格单元格、空状态说明正文。全站默认正文。 |
| **Label** | 表单/属性标签 | Sans | 12px / `text-xs` | 500 (medium) | 16px | 0.01em | `--gc-text-lo` (ink.lo) | 表单字段标签、属性检查器 key、checkbox/radio/switch 标签、按钮内辅助标签。 |
| **Metadata** | 结构化键值元数据 | Sans (值可切 Mono) | 12px / `text-xs` | 400 (normal) | 16px | 0 | `--gc-text-lo` (ink.lo) | 文件大小、张数、尺寸、分辨率、所有者、版本号、Provider/Model 显示名（FD-015）。值若为纯 ASCII 数字/ID，值部分用 Mono。 |
| **Caption** | 图注 / 极弱说明 | Sans | 11px / `text-2xs` | 400 (normal) | 16px | 0 | `--gc-text-faint` (ink.faint) | 缩略图覆盖标签、图注、脚注、次级提示。 |
| **Metric** | 真实指标数值 | Sans + `tabular-nums`（纯数字可 Mono） | 13px / `text-sm` | 600 (semibold) | 20px | 0 | `--gc-text-hi` (ink.hi) | 计数、成本（¥/$）、时长、百分比、吞吐。**行内指标**，禁止放大为 KPI 大卡（FD-027/036）。 |
| **Status** | 状态徽标文字 | Sans | 11px / `text-2xs` | 500 (medium) | 16px | 0.02em | `--gc-accent-*` (signal.*) | Job/Task/Event 状态、QC 通过/失败、同步状态。颜色必须来自 signal（blue/purple/green/amber/red），语义见 FD-027。 |
| **Code** | 行内代码 / 技术标识 | Mono (`--gc-font-mono`) + `tabular-nums` | 12px / `text-xs` | 400 (normal) | 16px | 0 | `--gc-text-mid` (ink.mid) | 行内代码片段、Recipe 参数、API 字段名、Provider/Model ID（管理员视图 FD-015）。**纯 ASCII。** |
| **Timestamp** | 时间 / 技术型 ID | Mono (`--gc-font-mono`) + `tabular-nums` | 11px / `text-2xs` | 400 (normal) | 16px | 0 | `--gc-text-lo` (ink.lo) | 绝对时间（`YYYY-MM-DD HH:mm:ss`，UTC+8）、相对时长、事件时间、**Job ID、Trace ID、SKU 代码**。chip 形态用 `.gc-mono-chip`。 |

> **角色穷尽性：** 上述 12 个角色覆盖工作台全部文本场景。若遇到无法映射的情况，**不得**临时编规格，按 §11 申请新角色。

---

## 6. 各角色详解 (Role Reference)

### 6.1 Page Title
- 实现：`<h1 class="text-sm font-semibold text-ink-hi" style="letter-spacing:0.01em">…</h1>`（或 Astryx `<Text type="large" as="h1" className="text-sm text-ink-hi">`，size 由 utility 钉为 13px，见 §8）。
- 约束：每页一处。不放大、不全大写。中英混排（如「商品库 / Product Library」）允许，但中文在前。

### 6.2 Page Context
- 紧随 Page Title，单行。例：「项目：夏季新品 · 批次 #042 · 阶段：L0 自动质检」。
- 实现：`<div class="text-xs text-ink-lo">…</div>`。

### 6.3 Section Title
- Latin/英文分组：等价类 `.gc-section-label`（`text-2xs font-medium uppercase tracking-wider`，`letter-spacing:0.08em`，`--gc-text-faint`）。
- **中文分组标题变体：** 中文无大小写概念，**禁止**对中文用 `uppercase`。中文分组标题使用：`text-xs font-medium text-ink-lo`，`letter-spacing:0.05em`（比 Latin 略紧）。例：「商品主体识别」「文字风险」。
- 这是一个**单一角色的两个实现变体**，不是新角色。

### 6.4 Panel Title
- 与 Page Title 同字号但中字重（500）以区分。例：属性检查器「属性」、上下文栏「项目」、对话框「导出设置」。

### 6.5 Body（基准）
- 全站默认。`body` 已设 `font-size:13px; color:var(--gc-text-mid); font-family:var(--gc-font-sans)`。
- 中文长句行高 20px（1.54）兼顾 CJK 可读性与工作台密度，**不得**压到 1.4 以下（见 §10）。

### 6.6 Label
- 表单字段、属性 key。key 用 Label（ink.lo），value 视类型用 Body/Metadata/Code。

### 6.7 Metadata
- 结构化键值。key：Label（ink.lo）；value：Metadata 正文，若值为纯 ASCII 数字/ID 则切 Mono。例：`尺寸: 2000×2000`、`张数: 42`、`所有者: 张三`。
- 成本/计费类元数据（FD-016 记录 cost）的数值部分用 Metric 角色，不用 Metadata。

### 6.8 Caption
- 极弱、可被忽略的辅助信息。缩略图角标、图注、脚注。颜色最弱（faint），保证主体媒体优先（FD-027 media-first）。

### 6.9 Metric
- 真实数值，`tabular-nums` 保证对齐。例：「42 张」「¥1.28」「3.2s」「98.4%」「12 次/分钟」。
- 货币符号与数字同行；多列数值用表格 + 等宽对齐。
- **禁止**放大于 KPI 卡（FD-027 禁止 KPI-card dominance；FD-036 禁止假/虚夸数据）。

### 6.10 Status
- 颜色必须是 `--gc-accent-*`（signal），语义见 tokens.css 头注与 FD-027：
  - blue = 选中/主操作；purple = AI/分析（克制）；green = 通过/完成；amber = 待检查/风险；red = 失败/阻断。
- 通常与 `.gc-dot`（6px 圆点）配合：`<span class="gc-dot" style="background:var(--gc-accent-green)"></span><span class="text-2xs font-medium text-signal-green">通过</span>`。
- 状态文字本身用中文（FD-034/035：结构化中文产品叙事）：「通过」「待检查」「失败」「运行中」「已阻断」。

### 6.11 Code
- 仅纯 ASCII。中英混排的技术句不要整体套 Mono（CJK 会回退）。
- 管理员 Provider/Model ID 视图（FD-015）用 Code；普通用户看到的是中文意图标签（FD-014：快速/均衡/高质量…），用 Label/Body。

### 6.12 Timestamp
- 等宽 + `tabular-nums`。绝对时间格式 `YYYY-MM-DD HH:mm:ss`，时区 UTC+8（客户为中文用户，FD-034）。相对时长如 `3.2s`、`12m 04s`。
- **Job ID、Trace ID、SKU 代码**统一用 Timestamp 角色（Mono、`text-2xs`、ink.lo）。需要 chip 外观时加 `.gc-mono-chip`（`bg elev-2` + `1px solid --gc-line` + `padding 1px 5px`）。

---

## 7. Graphite Canvas CSS 变量映射 (Variable Mapping)

每个角色的颜色列**只能**取自下表变量。禁止硬编码十六进制色值。

| Role | 文字颜色变量 | 备注 |
|---|---|---|
| Page Title | `--gc-text-hi` | `text-ink-hi` |
| Page Context | `--gc-text-lo` | `text-ink-lo` |
| Section Title | `--gc-text-faint` | `text-ink-faint` |
| Panel Title | `--gc-text-hi` | `text-ink-hi` |
| Body | `--gc-text-mid` | `text-ink-mid`（body 默认） |
| Label | `--gc-text-lo` | `text-ink-lo` |
| Metadata | `--gc-text-lo` | 值切 Mono 时仍 ink.lo |
| Caption | `--gc-text-faint` | `text-ink-faint` |
| Metric | `--gc-text-hi` | `text-ink-hi` + tabular-nums |
| Status | `--gc-accent-{blue\|purple\|green\|amber\|red}` | `text-signal-*`，按语义选 |
| Code | `--gc-text-mid` | `text-ink-mid` |
| Timestamp | `--gc-text-lo` | `text-ink-lo` |

> 四档层级（hi/mid/lo/faint）是 Graphite Canvas 的文字对比骨架（FD-027 低对比）。Status 用第五类 signal 色承载状态语义。

---

## 8. Astryx Text 组件映射 (Astryx Mapping)

Astryx 0.3.0 `<Text>` 组件提供语义 `type`，由主题注入 size/weight/line-height（`astryx.css`）。映射关系用于「使用 `<Text>` 组件时选哪个 `type`」。

| 角色 | Astryx `type` | Astryx 默认 size (16px root) | Graphite Canvas 实际 size | 处理 |
|---|---|---|---|---|
| Page Title | `large` | 17px / semibold | **13px** | `type="large"` 取语义(字重)，**必须**用 `className="text-sm"` 钉到 13px |
| Page Context | `supporting` | 12px / normal | 12px | 直接匹配 |
| Section Title (Latin) | `label` | 14px / medium | **11px** | `type="label"` + `className="text-2xs uppercase tracking-wider"`（或直接用 `.gc-section-label`） |
| Panel Title | `label` | 14px / medium | **13px** | `type="label"` + `className="text-sm text-ink-hi"` |
| Body | `body` | 14px / normal | **13px** | `type="body"` + `className="text-sm"`（**关键：Astryx body=14px，GC body=13px，必须钉**） |
| Label | `label` | 14px / medium | **12px** | `type="label"` + `className="text-xs"` |
| Metadata | `supporting` | 12px / normal | 12px | 匹配；值切 Mono 时另加 `font-mono` |
| Caption | `supporting` | 12px / normal | **11px** | `type="supporting"` + `className="text-2xs text-ink-faint"` |
| Metric | `body` + `weight="600"` + `hasTabularNumbers` | 14px | **13px** | `type="body" weight={600} hasTabularNumbers className="text-sm text-ink-hi"` |
| Status | `label` + 自定义 color | 14px / medium | **11px** | `type="label" className="text-2xs text-signal-*"` |
| Code | `code` | 14px / normal | **12px** | `type="code" className="text-xs"`（Astryx code 已是 Mono） |
| Timestamp | `code` 或 `supporting` | 14px / 12px | **11px** | `type="code" className="text-2xs font-mono text-ink-lo"` |

### 8.1 关键张力：13px vs 14px

- Astryx 的 `--text-body-size = --font-size-base = 0.875rem = 14px`（16px root）。
- Graphite Canvas 的 `body { font-size: 13px }`，Tailwind `sm = 13px`。
- **CSS 级联决定优先级**（`globals.css`）：`astryx-base < graphite-base < tw-components < tw-utilities`。因此 Tailwind utility（`text-sm` 等）**总是覆盖** Astryx 注入的 size。
- **结论：** 使用 `<Text>` 时，`type` 提供语义（字重/字族/默认色基线），**size 一律由 Graphite Canvas Tailwind utility 钉死**到本合同 §2 的刻度。绝不接受 Astryx 默认 14px 作为正文 size。

### 8.2 `display-*` 与 `heading-*` 的使用限制

- Astryx 还提供 `display-1`(42px)/`display-2`(35px)/`display-3`(29px) 与 `heading-1..6`。
- **默认禁用**于工作台 UI：大字号违反 FD-027（无大标题、无 KPI 卡主导）。
- **唯一例外：** 经 §11 流程批准的 hero 指标，且数据真实（FD-036），可用 `display-2` 并通过 `className` 钉到受限 size。未经批准不得使用。

### 8.3 触屏自适应提示

Astryx 在 `@media (pointer: coarse)` 下将 `body`/`label` 的 size 提升到 `max(1rem, ...)`（≥16px）。Graphite Canvas 是桌面生产工作台（`overflow:hidden` 满屏），触屏不是主目标；若未来支持触屏，需在 §11 评估该媒体查询对密度的影响，不得静默接受 16px。

---

## 9. 禁止模式 (Forbidden Patterns)

下列写法在本工作台**禁止**。Code review / 代理自检必须拦截。

| 禁止写法 | 原因 | 正确做法 |
|---|---|---|
| `text-[11px]` / `text-[13px]` / `text-[15px]` 等任意方括号字号 | 绕过受限刻度，制造散落魔法数字 | 用 `text-2xs` / `text-xs` / `text-sm` / `text-base` |
| `leading-[17px]` / `leading-[22px]` 等任意行高 | 行高必须随角色固定 | 由角色决定（§5），不单独设行高 |
| `tracking-[0.05em]` 等任意字间距 | 字间距是角色属性 | 仅 Section Title 用 `tracking-wider`(0.08em)，其余用角色默认 |
| `text-lg` / `text-xl` / `text-2xl` 等大字号 utility | 违反 FD-027 无大标题 | 经 §11 批准前不得使用 |
| 硬编码 `color:"#e8eaed"` / `color:"#b4b9c1"` | 绕过层级变量，主题不可调 | 用 `var(--gc-text-*)` 或 `text-ink-*` |
| 硬编码 `font-family:"Inter"` 等 | 绕过 CJK 字体栈，中文回退 | 用 `font-sans` / `font-mono` 或 `var(--gc-font-*)` |
| 对中文文本用 `uppercase` | 中文无大小写，无效且误导 | 中文 Section Title 用 §6.3 中文变体 |
| 对中英混排句子整体套 `font-mono` | CJK 字符回退，破坏可读性与对齐 | 整句用 Sans；仅纯 ASCII 片段用 Mono |
| 自行新增未在 §5 列出的「角色」（如临时 `text-xs text-ink-hi font-bold` 当标题） | 绕过合同，层级混乱 | 按 §11 申请新角色 |
| 用 Status 颜色（signal）做正文色 | 状态色仅承载状态语义 | 正文用 ink.* 四档 |
| 放大数值为 KPI 大卡 | 违反 FD-027/036 | Metric 角色行内呈现 |

---

## 10. 中英混排与中文优先规则 (Chinese-First Rules)

1. **字体栈顺序：** Sans 栈以 `PingFang SC → Microsoft YaHei → Source Han Sans SC → Noto Sans CJK SC` 开头，保证中文优先命中 CJK 字体。Latin 字符（system-ui/Segoe UI/Roboto）作为回退。**禁止**反转顺序或删除 CJK 字体。
2. **中文标题：** 不全大写、不加宽字间距（中文 Section Title ≤ 0.05em）。字重用 500/600 区分层级，不靠字号跳跃。
3. **中文长句：** 行高不低于 1.4（13px → 20px = 1.54）。CJK 字符密度高，行高过紧会糊成一团。表格内多行 CJK 同样遵循。
4. **中英混排：** 整句用 Sans。当句中含 SKU/Job ID/时间戳等纯 ASCII 片段时，**仅该片段**用 `<span class="font-mono">` 切 Mono，其余保持 Sans。例：「任务 `job_2026_042_a1b2` 已完成，耗时 `3.2s`」。
5. **SKU：** 用 Code 或 Timestamp 角色（Mono、`text-xs`/`text-2xs`、ink.mid/lo）。chip 形态用 `.gc-mono-chip`。SKU 是产品主数据强标识（FD-007），等宽保证对齐与可扫描性。
6. **Job ID / Trace ID：** 用 Timestamp 角色 + `.gc-mono-chip`。这些是审计与可追溯关键标识（FD-016/033），等宽 + 可复制。
7. **cost / 成本：** 用 Metric 角色（`text-sm` 600 + tabular-nums + ink.hi）。货币符号（¥/$）与数字同行，多列用表格对齐。FD-016 要求每次尝试记录真实 cost，呈现必须真实（FD-036）。
8. **timestamp / 时间：** 用 Timestamp 角色。绝对时间 `YYYY-MM-DD HH:mm:ss`（UTC+8），相对时长紧凑形式（`3.2s` / `12m 04s`）。事件时间用于可重放事件流（FD-033），必须等宽对齐。
9. **客户可见叙事：** 状态/进度/分析/告警/动作一律中文结构化产品叙事（FD-034/035）。技术型 ID/时间/代码保持 ASCII Mono，不做中文化。

---

## 11. 新增角色流程 (Adding a New Role)

**合同优先（Contract-first）。** 任何新角色必须先改本文件，再写代码。流程：

1. **确认必要性。** 先检查 §5 现有 12 角色是否真的无法覆盖（考虑变体，如 §6.3 的中文 Section Title 变体不算新角色）。能用现有角色 + 受限变体解决的，**不得**新增。
2. **更新本合同 §5 总表。** 新增一行，补全全部 9 列（Role / Purpose / Font Family / Font Size / Weight / Line Height / Letter Spacing / Color Role / Allowed Usage）。
3. **更新 §2 刻度。** 若新角色需要新字号，必须先在 `tailwind.config.ts` 的 `theme.extend.fontSize` 增加受限 token（如 `text-md`），并在 §2 总表登记。**禁止**用任意方括号值绕过。
4. **更新 §7 / §8 映射。** 给出新角色的 Graphite Canvas 变量与 Astryx `type` 映射（含 size 钉法）。
5. **关联 FD。** 在角色行的 Purpose 或本节注明依据的 FD（如 FD-027/031/034/036）。
6. **提交评审。** 按 `AGENTS.md` 的工作流：实现 → GPT Reviewer 复核 → ACCEPT 前不得声称「完成」。Reviewer 可要求补样例截图（E3/E4 证据）。
7. **降级处理。** 若评审未通过，不得在代码中保留未授权角色。已写入的临时规格必须回滚到现有角色。

**禁止：** 在 PR/代码中直接出现本合同 §5 之外的角色规格，再「事后补合同」。先合同后代码。

---

## 12. 中文排版验证要求 (Chinese Typographic Acceptance)

呼应 `AGENTS.md` 的真实验证底线。涉及文字渲染的改动，Reviewer 指定入口时必须按下表验证（E3/E4 证据，非仅静态）：

| 场景 | 验证入口 | 验证点 |
|---|---|---|
| 中文标题（Page/Panel/Section） | 各核心页面顶部、检查器列头 | 不截断、字重清晰、不全大写、无回退字体抖动 |
| 中文长句 | 空状态说明、表格描述单元格 | 自动换行、行高 ≥1.4 可读、无溢出 |
| 中英混排 | 任务进度叙事「任务 `job_xxx` 已完成，耗时 `3.2s`」 | baseline 对齐、CJK 用 Sans、ASCII 片段 Mono、无错位 |
| SKU（如 `OW-A31-BLK`） | 商品库列表、检查器 | 等宽、`tabular-nums`、chip 内对齐、可复制 |
| Job ID（如 `job-normal-001`） | 任务详情、事件流 | 等宽、可复制、`.gc-mono-chip` 一致 |
| Trace ID | 事件流、审计视图 | 等宽、不换行截断（可 tooltip 完整值） |
| cost（如 `¥1.28` / `$0.21`） | 计费/指标行 | 等宽数字对齐、货币符号一致、多列数值列对齐 |
| Timestamp（`2026-08-08 21:42:31`） | 事件流、列表时间列 | 等宽、UTC+8、列对齐 |
| Percentage（如 `98.4%`） | 指标、进度 | 数字宽度一致（tabular-nums）、小数位对齐 |
| Model ID（管理员视图 FD-015） | Provider Bindings 管理 | 等宽 Code、纯 ASCII、与中文意图标签（FD-014）视觉区分 |

---

## 13. 实施自检清单 (Agent Self-Check)

写或改 UI 文字样式前，ZCode 实施代理逐条自检（呼应 `AGENTS.md` 提交前最小检查）：

- [ ] 该文本节点是否映射到 §5 的**恰好一个**角色？角色名是否在 commit/PR 说明中注明？
- [ ] 字号是否来自 §2 受限刻度（`text-2xs/xs/sm/base`），无任何 `text-[Npx]`？
- [ ] 行高是否随角色（未单独设任意 `leading-[Npx]`）？
- [ ] 字间距是否为角色默认或 §6 指定值（无任意 `tracking-[Nem]`）？
- [ ] 颜色是否来自 `--gc-text-*` / `--gc-accent-*`（`text-ink-*` / `text-signal-*`），无硬编码十六进制？
- [ ] 字族是否用 `font-sans` / `font-mono`，无硬编码 `font-family`？
- [ ] 中文是否未被 `uppercase`？中英混排是否整句 Sans、仅 ASCII 片段 Mono？
- [ ] 等宽片段（SKU/Job ID/Trace ID/时间/代码）是否 `font-mono` + `tabular-nums`？
- [ ] 指标是否真实（FD-036）、行内呈现（非 KPI 大卡，FD-027）？
- [ ] 若使用 `<Text>` 组件，size 是否被 Graphite Canvas utility 钉到 §2 刻度（不被 Astryx 默认 14px 带走）？
- [ ] 是否新增了角色？若是，是否已完成 §11 全流程（先改本合同）？

任一未达标，不得报告 `READY_FOR_REVIEW`。

---

## 附录 A：源文件与事实依据

| 文件 | 角色 |
|---|---|
| `frontend/src/styles/tokens.css` | Graphite Canvas token 单一来源：字体栈、背景层级、`--gc-text-*`、`--gc-accent-*`、柱宽 |
| `frontend/src/styles/globals.css` | CSS 级联层定义、`body` 基准（13px/ink.mid/sans）、`.gc-section-label`、`.font-mono/.gc-data`、`.gc-mono-chip` |
| `frontend/tailwind.config.ts` | Tailwind 受限刻度（`2xs/xs/sm/base`）、`ink.*` / `signal.*` 颜色映射 |
| `frontend/node_modules/@astryxdesign/core/dist/Text/Text.d.ts` | Astryx `<Text>` 组件 API：`type`/`size`/`color`/`weight`/`hasTabularNumbers`/`maxLines` |
| `frontend/node_modules/@astryxdesign/core/dist/astryx.css` | Astryx 文字 type 的 size/weight/line-height 注入值（§8 数值依据） |
| `docs/governance/frozen-decisions.md` | FD-027 / FD-034 / FD-036 等冻结决策 |

## 附录 B：版本历史

| 版本 | 日期 | 变更 |
|---|---|---|
| 1.0.0 | 2026-08-08 | 首版：定义 12 个 Typography Roles、受限字号刻度、Graphite Canvas 变量映射、Astryx Text 映射、禁止模式、中文优先规则、新增角色流程。对齐 `tokens.css` / `globals.css` / `tailwind.config.ts` 真实值。 |
