# Typography Contract

> **Document type:** Normative Design Contract  
> **Project:** CommerceCanvas — 跨境电商商品视觉工作台  
> **Phase:** G2-F3.5  
> **Status:** FROZEN  
> **Last Updated:** 2026-08-08

## 1. 原则

- 中文优先：所有客户可见文本为简体中文
- 工业工作台密度：13px 正文基数，紧凑层级
- 禁止自由字号：不得使用 `text-[11px]`、`text-[13px]`、`leading-[17px]` 等任意值
- 新增 role 必须先更新本 contract

## 2. Typography Roles

| Role | 用途 | Font Size | Weight | Line Height | Color | Astryx Text type | 允许用法 |
|---|---|---|---|---|---|---|---|
| Page Title | 页面唯一一级标题 | 20px | semibold | 1.3 | `--gc-text-hi` | `display-1` | 每页仅 1 个 |
| Page Context | 标题旁的 job/run/product context | 13px | normal | 1.5 | `--gc-text-faint` | `supporting` | 紧邻 Page Title |
| Section Title | 大区域标题 | 15px | semibold | 1.4 | `--gc-text-hi` | `display-3` | 每区域 1 个 |
| Panel Title | Inspector/side panel/card header | 12px | medium | 1.4 | `--gc-text-lo` | `label` | 每个 panel |
| Body | 正文 | 13px | normal | 1.5 | `--gc-text-mid` | `body` | 主要文本 |
| Label | 字段名、表格标签 | 12px | medium | 1.4 | `--gc-text-faint` | `label` | 表单/表格 |
| Metadata | 次级数据 | 11px | normal | 1.4 | `--gc-text-faint` | `supporting` | ID/时间/模型 |
| Caption | 说明、辅助提示 | 11px | normal | 1.4 | `--gc-text-faint` | `supporting` | 帮助文本 |
| Metric | 关键数字 | 13px | semibold | 1.4 | `--gc-text-mid` | `body` | 发现数/风险数/产物数 |
| Status | 任务状态 | 11px | medium | 1.4 | 动态（accent 色） | `body` | Badge 或 inline |
| Code | ID/hash/model/provider/route | 12px mono | normal | 1.4 | `--gc-text-lo` | `code` | Astryx `<Code>` |
| Timestamp | 时间信息 | 11px mono | normal | 1.4 | `--gc-text-faint` | `code` | Astryx `<Code>` |

## 3. Font Family

```css
--gc-font-sans: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--gc-font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
```

- `--gc-font-sans`：正文、标题、标签
- `--gc-font-mono`：仅用于 ID/时间/数值/事件码（`.gc-data` / Astryx `<Code>`）

## 4. 禁止

```css
/* 禁止 */
text-[11px];
text-[13px];
text-[15px];
leading-[17px];
font-size: 14px; /* 任意硬编码 */

/* 必须使用 Typography Role 或 Astryx Text type */
<Text type="body">...</Text>
<Text type="label" color="secondary">...</Text>
```

## 5. 新增 Role 流程

1. 在本 contract 新增行（font-size/weight/line-height/color/usage）
2. 如使用 Astryx `<Text>`，确认 `type` 是否匹配（或使用自定义 `type` 增强）
3. 更新 `tokens.css` 如需新 CSS 变量
4. Reviewer 审核后才可使用

## 6. 中文排版验证要求

| 场景 | 验证点 |
|---|---|
| 中文标题 | 不换行截断、字重清晰 |
| 中文长句 | 自动换行、line-height 可读 |
| 中英混排 | baseline 对齐、无错位 |
| SKU（OW-A31-BLK） | 等宽、tabular-nums |
| Job ID（job-normal-001） | 等宽、可复制 |
| USD cost（$0.21） | 等宽、对齐 |
| Timestamp（2026-08-08 21:42:31） | 等宽、对齐 |
| Percentage（85%） | 数字宽度一致 |
| Model（Qwen-Image-Edit-2511） | 等宽 Code |
