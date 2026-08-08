# Visual Salience Contract

> **Document type:** Normative Design Contract  
> **Project:** CommerceCanvas  
> **Phase:** G2-F3.5 R4  
> **Status:** FROZEN  
> **Last Updated:** 2026-08-09

## 1. 核心原则

```text
Astryx = behavior (keyboard, focus, a11y, interaction anatomy)
Graphite Canvas = visual (typography, salience, colors, density, borders, surfaces)
```

最终产品：**Astryx behavior + Graphite appearance**，而非 Graphite background + Astryx visual skin。

## 2. 视觉层级（Visual Salience Levels）

| Level | 用途 | 表现 | 示例 |
|---|---|---|---|
| S0 | 背景/分隔/禁用 | 最弱：transparent/divider/disabled gray | divider, disabled text |
| S1 | 次级 metadata | 弱：faint gray text, mono code | timestamp, hash, ID, secondary metadata |
| S2 | 正文/标签/常规指标 | 正常：body text, label, normal metric | 阶段 1/7, 发现 24, 风险 0 |
| S3 | 选中/可操作/当前上下文 | 较强：selected state, actionable item, current context | active tab, selected row, focused element |
| S4 | 主操作 CTA/可操作警告 | 强：solid primary button, actionable warning | 开始分析, 需要人工确认 |
| S5 | 阻断/破坏性/严重错误 | 最强：strong badge, destructive button | QC 阻断, 删除任务, 执行失败 |

## 3. 颜色预算

普通工作台 surface 默认：**neutral / graphite first**。

- 彩色元素必须有语义理由
- 禁止同一区域同时大量出现 blue + green + yellow + red + purple
- 颜色不是数据分类的默认手段
- 每屏最多 1 个 S4 solid CTA（除非明确业务理由）

### 状态颜色优先级

| 状态 | 表现 | 语义 |
|---|---|---|
| normal/running | dot + text（neutral/blue subtle） | 不抢眼 |
| completed/pass | subtle green text/dot | 轻度确认 |
| warning/review | amber soft treatment（tinted, not filled） | 需注意 |
| block/error/fail | 允许 Badge / stronger surface | 需行动 |
| destructive action | red，仅限破坏性操作 | 不可逆 |
| AI/intelligence | purple，仅作 subtle identifier | 不得成为主 CTA |

## 4. Badge Policy（Status Treatment）

### Tier A — inline status（running, completed, connected, normal）

**表现**：small dot + Text  
**禁止**：filled Badge

### Tier B — attention status（awaiting_review, warning, retrying）

**允许**：subtle/tinted Badge 或 amber text + icon

### Tier C — blocking（failed, blocked, QC block）

**允许**：strong Badge

## 5. Button Salience

| 角色 | 视觉 | 条件 |
|---|---|---|
| primary CTA | solid（--gc-action-primary） | 每区域最多 1 个 |
| secondary | neutral/ghost/subtle outline | 不与 primary 竞争 |
| destructive | red solid/outline | 仅限破坏性操作 |

禁止：Tab selected、focus ring、icon accent、link text 全部使用相同高饱和蓝。

## 6. Semantic Token 拆分

```css
--gc-action-primary: /* primary CTA button background — deep blue */
--gc-selection-accent: /* selected tab/row indicator — subtle blue */
--gc-focus-ring: /* keyboard focus ring — blue outline */
--gc-action-text: /* inline action/link text — blue text */
```

不得让 Button primary、Tab selected、focus ring、icon accent、link text 全部使用完全相同的视觉权重。

## 7. Typography Hierarchy（优先于颜色）

重要 label/data 的辨识度优先通过 **font weight / text role / spacing / grouping** 解决，而非彩色 pill。

Job Detail 至少 3-4 层 hierarchy：
1. Page title / job name（最强）
2. Primary metric value（次强）
3. Metric label（正常）
4. Secondary metadata / ID / time（最弱）
