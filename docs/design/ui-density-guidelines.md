# UI Density Guidelines


> **Document type:** Normative Design Contract
> **Project:** CommerceCanvas — Cross-Border Commerce Visual Studio
> **Phase:** G2-F3.5
> **Status:** Framework `FROZEN` · Pixel thresholds `VALIDATION_REQUIRED`（待 OD-205 / OD-209 / OD-211 收口）
> **Baseline date:** 2026-08-08
> **Customer-facing language:** Simplified Chinese (`zh-CN`) for all customer-visible UI, progress, interaction logs, warnings, and actions
> **Change rule:** Any change to a frozen decision requires an explicit decision record and impact review.

### Status legend

| Label | Meaning |
|---|---|
| `FROZEN` | Approved decision. Implementation and later documents must conform unless formally changed. |
| `VALIDATION_REQUIRED` | Technical hypothesis or provisional threshold that must be tested before it can become a release commitment. |
| `NON_BLOCKING_EXPERIMENT` | Useful experimental capability that may ship behind a Beta/Experimental flag but cannot block MVP release. |
| `OUT_OF_SCOPE` | Explicitly excluded. Work must not be started without scope change approval. |


## 1. 目的与适用范围

本文档是 CommerceCanvas 前端界面密度的**规范性契约（normative contract）**，不是风格建议。它规定信息布局优先级、密度等级与具体测量值、Badge / Card / Row / List / Table 的使用边界，以及元数据的视觉权重。

CommerceCanvas 是跨境电商商品视觉**生产工作台**（dark theme production tool），不是消费级 SaaS 仪表盘。生产页面承载的是高密度可扫描数据：Job / Task / Attempt / Artifact / QC evidence / Route history。界面必须服务"快速扫描、批量操作、可审计"，而不是"卡片化的高级感"。

**规范性用语**：`MUST` / `MUST NOT` 为强制；`SHOULD` / `SHOULD NOT` 为强烈建议，违反需记录理由；`MAY` 为可选。本契约内的规则使用命名空间 `DG-`（Density Guideline）。冲突时 **FD-027 优先**；与 OD 的临时默认冲突时，以已关闭的 OD 决策记录为准，不得用实现反向关闭 OD。

**适用范围**：所有生产页面（工作队列、商品工作区、竞品套图分析、生成工作室、本地化工作室、审核室、任务详情、管理设置）及跨页持续任务面板。中央媒体画布（Canvas）的叠加层证据框不在本契约密度等级范围内，由证据可视化契约单独约束。

**上游依据**：FD-027（Graphite Canvas — media-first、dark neutral、compact、no ERP/KPI-card dominance、no large gradients / glassmorphism）；FD-031 / FD-036 / FD-037（Live Intelligence、克制的高信息密度动效、持续任务面板）；CAP-135（事件与中文展示的跨页一致性）；OD-205（工作队列 density）、OD-209（动效 / event density / 性能预算）、OD-211（持续任务面板 compact / expanded / full）。

---

## 2. 密度优先原则（Density Priority Principle）

> **DG-100**：高密度可扫描生产数据的默认布局优先级为 **Row / List / Table > Panel > Card**。生产数据 `MUST NOT` 默认使用 Card 布局。

```text
Row / List / Table   >   Panel   >   Card
```

CommerceCanvas 的核心信息是结构化、可比较、可批量操作的生产记录。把每条记录包成 Card 会：

- 降低单屏可扫描条目数（Card 的 padding + 阴影 + 圆角 + 间距显著占用垂直空间）；
- 破坏跨条目的列对齐（Card 各自独立，无法形成"表格列"的视觉扫描轴）；
- 引入与 FD-027「no ERP/KPI-card dominance」冲突的卡片化倾向。

CommerceCanvas 是生产工作台，不是 consumer SaaS Dashboard。

布局选择决策树（按数据特征自顶向下）：

```text
数据特征
├─ 多条目 × 多可比较字段（如 Attempt 列表：序号 / 模型 / 时长 / 成本 / QC / 状态）
│   └─ Table（默认）
├─ 多条目 × 变高条目（主标签 + 辅助元数据，如分析轨迹事件、资产列表）
│   └─ List（默认）
├─ 单条单行结构化记录（Job 队列条目、键值元数据）
│   └─ Row（默认）
├─ 一组功能相关的控件 / 只读字段，需要视觉容器但不适合表格
│   └─ Panel（次选）
└─ 内容异构、需要强调"这是一个独立可审视对象"且有明确分组理由
    └─ Card（最后手段，需论证，见 §6）
```

**DG-101**：任何把 Row / List / Table 默认改成 Card 的实现，`MUST` 在设计评审中给出明确的分组理由（grouping reason），并记录在该页面的呈现契约说明中。「为了好看 / 高级感 / premium feel」不是有效理由。

**DG-102**：Panel 用于承载控件组或只读字段组；Panel 内部的列表 / 表格 `MUST NOT` 再用 Card 包裹（见 §6 的 Card 嵌套禁令）。

---

## 3. 密度等级（Density Levels）

定义三档密度：`compact` / `default` / `comfortable`。所有页面必须支持在产品级 density token 上切换；页面不可各自定义私有像素值。

### 3.1 测量值总表

| 测量项 | `compact` | `default` | `comfortable` | 状态 |
|---|---:|---:|---:|---|
| Row height（行高） | **28px** | **32px** | **40px** | `VALIDATION_REQUIRED` |
| Control height（Button / TextInput / Selector / Badge 行） | **28px** | **32px** | 36px | `VALIDATION_REQUIRED` |
| Panel padding（面板内边距） | **8px** | **12px** | 16px | `VALIDATION_REQUIRED` |
| Horizontal gap（同行元素水平间距） | **4px** | **8px** | 12px | `VALIDATION_REQUIRED` |
| Vertical gap（同组堆叠元素垂直间距） | 4px | 8px | 12px | `VALIDATION_REQUIRED` |
| Section gap（区段间距，section ↔ section） | 8px | 16px | 24px | `VALIDATION_REQUIRED` |
| Icon size（行内图标） | **12px** | **14px** | **16px** | `VALIDATION_REQUIRED` |
| Table row height（表格行高，含表头） | 28px | 32px | 40px | `VALIDATION_REQUIRED` |
| Table cell horizontal padding | 8px | 12px | 16px | `VALIDATION_REQUIRED` |
| Table cell vertical padding | 4px | 6px | 8px | `VALIDATION_REQUIRED` |
| 字号 — body（主文字） | 13px | 13px | 14px | 沿用 Foundation |
| 字号 — label / supporting（次要文字） | 12px | 12px | 12px | 沿用 Foundation |
| 字号 — Code（机器标识符） | 12px | 12px | 13px | 沿用 Foundation |

**约束关系（强约束，避免等级内部自相矛盾）**：

- **DG-110**：`Control height ≤ Row height`（同一密度内）。`compact`：28/28；`default`：32/32；`comfortable`：36/40。控件不得撑破所在行。
- **DG-111**：`Icon size ≤ Control height − 8px`，保证图标周围有最小呼吸空间。`comfortable` 下 16px 图标配 36px 控件满足该约束。
- **DG-112**：`Table row height` 必须等于该密度的 `Row height`，保持表格与列表视觉节奏一致。
- **DG-113**：`Section gap` 是垂直节奏（vertical rhythm）的主刻度；`Vertical gap` 是组内节奏；`Horizontal gap` 是行内节奏。三档间距各自独立，不得混用（例如不得用 Section gap 当组内 Vertical gap）。
- **DG-114**：跨密度切换时，字号差最多 ±1px，主体节奏由行高与间距驱动，**不得**靠字号撑密度。

### 3.2 垂直节奏（Vertical Rhythm）

**DG-115**：垂直节奏建立在 4px 基线上。

- `compact`：4 / 8 / 8（组内 gap / 区段 gap / 区段大间距）。
- `default`：8 / 16 / 16。
- `comfortable`：12 / 24 / 24。

所有垂直间距 `MUST` 取 4 的整数倍；非 4 整数倍的临时像素值（如 5px、7px、13px）`MUST NOT` 进入生产样式。

### 3.3 表格密度（Table Density）

**DG-116**：Table 在 `compact` / `default` 下：

- 表头行高 = 数据行高；
- 单元格水平 padding 见上表，禁止为「呼吸感」再加额外外边距；
- 数字 / 货币 / 时间 / 标识符列 `SHOULD` 右对齐或使用等宽 `Code` 对齐（见 §8）；
- 状态列 `MUST` 用 Badge（见 §5），不得用整行背景色表达状态。

**DG-117**：`comfortable` Table 仅用于管理设置（Admin）或审核室（Review Room）的独立可读视图，**不**用于工作队列、任务详情等高频扫描页。

---

## 4. CommerceCanvas 默认密度

> **DG-200**：生产页面默认密度为 **`compact` 或 `default`**，**不是** `comfortable`。不使用 consumer-style `comfortable`。

`comfortable` 是面向「低频、长阅读、独立可读视图」（如 Admin 配置详情、onboarding、EmptyState）的例外密度，**不是**全站默认。

各核心页面默认密度（与 CAP-135 跨页呈现所有权对齐）：

| 页面 | 默认密度 | 理由 |
|---|---|---|
| 工作队列（工作队列） | `compact` | 批量任务、并发、离线 Worker、需一屏看尽状态与成本 |
| 任务详情（任务详情）— 轨迹与 Attempt 表 | `compact` | 全量有序历史、Attempt 多列可比较 |
| 商品工作区（商品工作区）— 元数据 / 引用清单 | `default` | 结构化记录，平衡可读与密度 |
| 竞品套图分析（竞品套图分析）— 图片清单 / 证据 | `default` | 缩略图 + 标签混合，需适度呼吸 |
| 生成工作室（生成工作室）— 计划 / 候选 / QC | `default` | 中等密度，含证据缩略图 |
| 本地化工作室（本地化工作室）— Text Block 列表 | `compact` | 多 block、可比较字段、溢出状态 |
| 审核室（审核室）— 版本 / 决策列表 | `default` | 可读性与可比较性并重 |
| 管理设置（Admin）— Provider Binding / 配额 | `comfortable` | 低频、长阅读、独立可读 |
| EmptyState / onboarding | `comfortable` | 引导性、低信息密度 |

**DG-201**：持续任务面板（Persistent Task Surface，FD-037 / OD-211）的 `compact` 态使用本表的 `compact` 行高（28px）；`expanded` 与 `full-detail` 态可升至 `default`，但 `MUST NOT` 升至 `comfortable`。

**DG-202**：禁止为了「降低压迫感」在生产页面把默认密度设为 `comfortable`。「降低压迫感」应通过分组、分隔线（`var(--gc-line)`）、留白节奏实现，而不是放大每一条记录。

---

## 5. Badge 策略（Badge Policy）

> **DG-300**：Badge 是**语义状态**的视觉载体，不是通用标签。Badge `MUST` 仅承载**有限、可枚举、带状态色语义**的状态。

### 5.1 Badge 适用：状态类（有限枚举 + 状态色）

| 语义域 | 示例值（中文） | Badge variant | 状态色映射（`--gc-accent-*`） |
|---|---|---|---|
| Status（任务 / Attempt / Job 状态） | 执行中 / 等待执行 / 已完成 / 已取消 | `info` / `neutral` / `success` / `neutral` | blue / neutral / green / neutral |
| Risk（QC 风险等级） | 阻断 / 待检查 / 通过 | `error` / `warning` / `success` | red / amber / green |
| Review（审核状态） | 待审核 / 已通过 / 已拒绝 / 需修改 | `neutral` / `success` / `error` / `warning` | neutral / green / red / amber |
| Route（路由状态） | 主路径 / 降级 / 回退 / 升级 | `info` / `neutral` / `warning` / `purple` | blue / neutral / amber / purple |

### 5.2 Badge 不适用：数值 / 标识符类（Text / Metadata / Code）

以下内容 `MUST NOT` 使用 Badge，`MUST` 使用 `Text` / `Code` / metadata 行：

| 数据类型 | 展示方式 | 理由 | 示例 |
|---|---|---|---|
| 任务状态（执行中 / 已完成 / 失败 / 等待人工确认） | **Badge** | 需要快速扫描的离散状态 | `通过` / `阻断` |
| 风险等级（阻断 / 警告 / 通过） | **Badge** | 需要颜色区分 | `待检查` |
| 审核状态（待检查 / 需人工确认） | **Badge** | 需要操作提示 | `待审核` |
| 路由策略（均衡 / 商品保真优先） | **Badge** | 需要快速识别 | `主路径` |
| ID（`job-normal-001` / `job-2026-08-08-0142`） | **Code** | 不是状态，是标识 | `job-normal-001` |
| Count（发现 24、风险 3） | **Text + Code** | 数值，不是状态 | `发现 24 · 风险 3` |
| Cost（`$0.21` / `¥0.42`） | **Code** | 数值 | `¥0.42` |
| Time（`00:42` / `8.2s`） | **Code** | 数值 | `8.2s` |
| Model（`Qwen-Image-Edit-2511`） | **Code** | 标识 | `Qwen-Image-Edit-2511` |
| Provider | **Text** | 标识 | `ComfyUI` |

### 5.3 Badge 反泛滥（No Badge Flooding）

**DG-301**：同一可见区域内，Badge `SHOULD NOT` 超过该区域语义状态槽位的种类数（Status / Risk / Review / Route 四类）。把 ID / Count / Cost / Time / Model / Sequence 全部渲染成 Badge 是**反模式**。

**DG-302**：Foundation / smoke-test 页面（如 `DesignFoundationPage`）中「seq 8 / seq 15 / seq 22」用 `Badge variant="neutral"` 的写法是**密度契约下的反例**，生产页 `MUST NOT` 沿用——序号属于标识符 / 计数类，应使用 `Code` 或 `Text type="label"`。

**DG-303**：Badge 颜色 `MUST` 沿用 Foundation 语义（`--gc-accent-*`）。`purple` 仅用于 AI / 演算能力相关状态（FD-027 状态色语义），不得滥用为「装饰性品牌色」。

### 5.4 Badge 文案

**DG-304**：Badge 文案 `MUST` 为简短中文状态词（≤ 4 字优先），不得承载完整句子或长标识符。需要解释时通过 `Tooltip` 补充，而不是把长文本塞进 Badge。

---

## 6. Card 策略（Card Policy）

> **DG-400**：Card 是**有限手段**，不是默认容器。Card `MUST` 有明确的分组理由（grouping reason）。

### 6.1 Card 嵌套禁令

**DG-401**：禁止 Card-in-Card-in-Card。Card 嵌套深度 `MUST` ≤ 1（即最多 Card 内含一层 Card，强烈建议为 0）。Panel / List / Table 内部 `MUST NOT` 再嵌套 Card。

理由：每层 Card 都叠加 padding + 背景层级（`--gc-bg-elev-1` → `--gc-bg-elev-2`）+ 圆角 + 间距，三重嵌套会：

- 把信息推到首屏之外；
- 制造与 FD-027「compact」冲突的视觉噪音；
- 让密度等级失效（无法判断哪一层的 padding 才是「行内 padding」）。

### 6.2 Card 的有效分组理由

**DG-402**：使用 Card `MUST` 满足以下至少一条：

1. 内容是**一个需要被作为独立对象审视的整体**（如一张可比较的候选图 + 其 QC 摘要 + 操作）；
2. 内容**异构**（混合媒体 + 文本 + 控件，无法用表格列对齐）；
3. 需要**与周围内容在背景层级上区隔**（如浮层、对比视图中的单项）。

### 6.3 Card 反模式

**DG-403**：以下 `MUST NOT` 仅为了「premium feel / 高级感」而转成 Card：

- 列表 / 表格 / 元数据行；
- 键值对元数据（ID / 成本 / 时间 / 模型）；
- 已有 Panel 承载的控件组。

### 6.4 BAD vs GOOD 示例

以下使用 `@astryxdesign/core` primitive 与真实 CommerceCanvas 中文语义内容。

**BAD — Card 套 Card 套 Badge（嵌套 + Badge 泛滥 + 元数据卡片化）**：

```tsx
// ❌ DG-401（Card-in-Card）、DG-403（元数据卡片化）、DG-301（Badge 泛滥）、DG-110（控件撑破行）
<Card>
  <Card>
    <div style={{ display: 'flex', gap: 8 }}>
      <Badge variant="neutral" label="job-2026-08-08-0142" />   {/* ID 不该是 Badge */}
      <Badge variant="info" label="¥0.42" />                     {/* Cost 不该是 Badge */}
      <Badge variant="neutral" label="8.2s" />                   {/* Time 不该是 Badge */}
      <Badge variant="purple" label="Qwen-Image-Edit-2511" />    {/* Model 不该是 Badge */}
      <Badge variant="success" label="通过" />                   {/* 只有这个 Badge 合法 */}
    </div>
  </Card>
</Card>
```

**BAD — 把列表数据做成 Card 墙（丧失列对齐）**：

```tsx
// ❌ DG-100、DG-403：Job / Attempt 列表本应是 Table，被包成 Card 网格后无法跨条目对比"成本"列
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
  {jobs.map((job) => (
    <Card>
      <Card>{job.name}</Card>
      <Card>{job.status}</Card>
      <p>{`¥${job.cost}`}</p>
    </Card>
  ))}
</div>
```

**GOOD — 高密度数据用 List / Table，Card 仅作有理由的分组容器**：

```tsx
// ✅ DG-100、DG-401：列表用 List；元数据走 Code/Text，状态用单一 Badge
<List hasDividers>
  <ListItem
    startContent={<CheckCircle size={14} style={{ color: 'var(--gc-accent-green)' }} />}
    label="图片用途分类结果"
    description={<>12 张 · 4 种用途 · <Code>job-2026-08-08-0142</Code></>}
    endContent={<Badge variant="success" label="通过" />}
  />
  <ListItem
    startContent={<Code>Qwen-Image-Edit-2511</Code>}
    label="用时 8.2s · 估算 ¥0.42 / $0.12"
    endContent={<Badge variant="info" label="主路径" />}
  />
</List>
```

```tsx
// ✅ DG-402：Card 仅用于有明确 grouping 理由的逻辑区域，内部仍用 List/Table/Row
<Card>
  <Heading level={4}>QC 结果</Heading>
  <List hasDividers>{qcItems}</List>
</Card>
```

Card 必须有明确 grouping 理由：一个逻辑区域的容器，内部仍用 List / Table / Row。

---

## 7. Row / List / Table 策略

三者是高密度可扫描数据的**默认**布局。选择依据是数据结构，不是审美。

| 场景 | 推荐组件 | 理由 |
|---|---|---|
| Job 列表（多列、排序、筛选） | **Table** | 结构化数据，需要列对齐 |
| Attempt 列表（序号 / 模型 / 时长 / 成本 / QC / 状态） | **Table** | 多条目 × 多可比较字段 |
| Provider Binding / 成本台账 | **Table** | 多列可比较 |
| Artifact 谱系（单列、有层级） | **List** | 线性、有 description |
| QC 结果列表 | **List** | 每项有 status / evidence |
| Timeline / 分析轨迹事件 | **List** | 按时间排序、变高条目 |
| Text Block 列表（本地化） | **List** | 多 block、可比较字段、溢出状态 |
| Metadata 行（key-value） | **List / Stack** | 紧凑 |
| Job 队列条目、持续任务面板 compact 态 | **Row** | 一条记录一行 |
| 图片网格（候选图、证据缩略图） | Grid（CSS） | 媒体内容，非结构化数据 |

**DG-500**：当数据满足「多条目 × 多可比较字段」时 `MUST` 用 Table，不得用 Card 网格或 List（DG-100）。

**DG-501**：List 条目结构 `SHOULD` 统一为 `startContent`（图标 / 状态指示）+ `label`（主标签）+ `description`（辅助元数据）+ `endContent`（状态 Badge / 操作），与 Foundation 的 `List` / `ListItem` 契约一致。

**DG-502**：Row / List / Table 之间 `MUST` 用分隔线（`var(--gc-line)`）或区段间距区隔，不靠 Card 的背景层级区隔。

**DG-503**：可比较的数值列（成本 / 时长 / 张数 / 序号）`SHOULD` 右对齐或等宽对齐（`Code`），避免左对齐导致无法快速比较量级。

---

## 8. 元数据层级（Metadata Hierarchy）

> **DG-600**：ID / Count / Cost / Time / Model / Provider 等元数据 `MUST` 保持**一致的视觉权重**，按「机器生成 vs 人类可读」区分，不按「重要 vs 不重要」主观放大。

### 8.1 视觉权重分层

| 层级 | 渲染 | 颜色 token | 用途 | 示例 |
|---|---|---|---|---|
| 机器标识符（identifier） | `Code`（等宽） | `var(--gc-text-lo)` | ID / 序号 / 模型名 / Provider 名 / 状态码 | `job-2026-08-08-0142` · `Qwen-Image-Edit-2511` |
| 数值（numeric） | `Code`（等宽，数字对齐） | `var(--gc-text-mid)` | 成本 / 时长 / 张数 / 计数 | `¥0.42` · `8.2s` · `12 张` |
| 人类主标签（primary label） | `Text type="body"` | `var(--gc-text-mid)` | 业务对象名、检查项名 | `图片用途分类结果` |
| 人类次要说明（supporting） | `Text type="supporting"` | `var(--gc-text-lo)` | 辅助说明、阶段描述 | `5/7 阶段 · 图片用途识别完成` |
| 可操作 / 强调（action / emphasis） | `Text type="body"` + 强调 | `var(--gc-text-hi)` | 需要用户注意或操作的值 | 当前阻断项计数 |
| 语义状态 | `Badge` | `--gc-accent-*` | Status / Risk / Review / Route（见 §5） | `通过` / `阻断` |

视觉权重顺序：**label（body）> description（supporting）> Badge（状态）> Code（标识）**。不得让 Badge 或 Code 比 label 更大 / 更亮。

### 8.2 GOOD 示例

```tsx
// ✅ Metadata 用 Text supporting + Code，状态用 Badge，序号用 Code（不是 Badge）
<ListItem
  label={<Text type="body">图片用途分类结果</Text>}
  description={<Text type="supporting">12 张 · 4 种用途</Text>}
  endContent={
    <>
      <Badge variant="neutral" label="已完成" />
      <Code>seq 8</Code>
    </>
  }
/>
```

### 8.3 一致性规则

**DG-601**：同一类元数据在跨页面 `MUST` 使用相同的渲染方式。例如 Attempt ID 在工作队列、任务详情、审核室都 `MUST` 用 `Code`，不得在一处用 `Code`、另一处用 `Text`、第三处用 `Badge`。

**DG-602**：成本 / 时长 `MUST` 始终带单位与币种（`¥` / `$` / `s` / `ms`），数字部分用 `Code` 等宽对齐。估算值 `MUST` 标注「估算」（Cost Estimate 必须标注为 estimate）。

**DG-603**：时间戳 / 时长 `MUST` 区分：

- 时间戳（绝对）：`2026-08-08 21:42:31`，`Text type="supporting"` 或 `Code`；
- 时长（相对）：`8.2s`，`Code`，右对齐；
- 不得把时长伪装成时间戳或反之。

**DG-604**：当 Model / Provider 名称对**普通用户**展示时（非 Admin 视图），`SHOULD` 配中文角色说明（普通用户不接收未解释的 provider/model 行话）；对**审核员 / Admin** 可直接展示 `Code` 形式的字面 ID。字面 ID 不得翻译或改写。

**DG-605**：元数据 `MUST NOT` 通过加粗、放大字号、染色等方式被「主观强调」。需要强调时通过分组位置、Badge、或 `var(--gc-text-hi)` 的高对比层统一处理，而不是为单项元数据发明私有样式。

---

## 9. 验证与例外

### 9.1 验证要求

本契约的**框架与策略**（密度优先、Badge 策略、Card 策略、Row / List / Table 选择、元数据层级）为待冻结的设计契约候选。

本契约的**具体像素阈值**（§3.1 表中所有测量值）状态为 `VALIDATION_REQUIRED`，必须在 G1 / G2 通过以下证据收口：

- **OD-205**：工作队列密度与失败 / 重试控件的高保真原型可用性测试；
- **OD-209**：动效、事件密度、性能预算的原型 profiling 与可用性测试；
- **OD-211**：持续任务面板 compact / expanded / full 的跨页原型。

在证据收口前，实现 `MUST` 使用本契约的数值作为临时默认，不得自创私有数值。

### 9.2 例外申请

任何页面需要偏离本契约（如使用 `comfortable` 作为生产默认、或对某类元数据使用 Badge）`MUST`：

1. 在该页面的呈现契约说明中记录偏离点与理由；
2. 引用被偏离的 `DG-` 规则 ID；
3. 评估对 FD-027 的影响；
4. 经设计评审批准。

未走例外流程的偏离视为违规，应在评审中被拒。

---

## 10. 一致性与引用

### 10.1 上游依据

| 上游 | 关系 |
|---|---|
| FD-027 | Graphite Canvas 视觉基线：media-first、dark neutral、compact、no ERP/KPI-card dominance。本契约是其密度层面的细化。冲突时 FD-027 优先。 |
| FD-031 / FD-036 / FD-037 | Live Intelligence 克制动效、持续任务面板。本契约约束其呈现密度（DG-201）。 |
| CAP-135 | 跨页事件与中文展示一致性。本契约的页面默认密度表（§4）与 CAP-135 跨页呈现所有权对齐。 |
| OD-205 / OD-209 / OD-211 | 密度阈值的验证义务来源。 |

### 10.2 下游影响

后续 G2 前端架构、组件库（`@astryxdesign/core` 使用规范）、各页面呈现契约、UI 验收测试 `MUST` 引用本文档的 `DG-` 规则 ID。一个违反本契约的前端实现或设计稿必须在评审前被指出，或在例外流程中被正式批准。

### 10.3 Token 与 primitive 锚点

本契约引用的真实实现锚点：

- 设计 token：`frontend/src/styles/tokens.css`（`--gc-bg-*`、`--gc-line`、`--gc-text-hi/mid/lo/faint`、`--gc-accent-*`）。
- primitive：`@astryxdesign/core` 的 `Badge`、`Code`、`List` / `ListItem`、`Text`（type: body / label / supporting）、`Table`。
- Foundation 参考页：`frontend/src/pages/DesignFoundationPage.tsx`（其中「seq」用 Badge 的写法是本契约 DG-302 点名的反例，生产页不得沿用）。
