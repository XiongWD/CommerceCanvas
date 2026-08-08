# UI Density Guidelines

> **Document type:** Normative Design Contract  
> **Project:** CommerceCanvas  
> **Phase:** G2-F3.5  
> **Status:** FROZEN  
> **Last Updated:** 2026-08-08

## 1. 核心原则

```text
Row / List / Table  >  Panel  >  Card
```

高密度、可扫描的生产数据**不得**默认 Card 化。
CommerceCanvas 是生产工作台，不是 consumer SaaS Dashboard。

## 2. Density Levels

| Level | Row Height | Control Height | Panel Padding | Gap (H) | Icon Size | 适用 |
|---|---|---|---|---|---|---|
| compact | 28px | 28px | 8px | 4px | 12px | Work Queue、Job Detail 列表、Table |
| default | 32px | 32px | 12px | 8px | 14px | Competitor Analysis、Inspector、表单 |
| comfortable | 40px | 36px | 16px | 12px | 16px | 仅 EmptyState / onboarding |

**CommerceCanvas 核心工作页面默认**：`compact` / `default`。不使用 consumer-style `comfortable`。

## 3. Badge Policy

| 数据类型 | 展示方式 | 理由 |
|---|---|---|
| 任务状态（执行中/已完成/等待人工确认/失败） | **Badge** | 需要快速扫描的离散状态 |
| 风险等级（阻断/警告/通过） | **Badge** | 需要颜色区分 |
| 审核状态（待检查/需人工确认） | **Badge** | 需要操作提示 |
| 路由策略（均衡/商品保真优先） | **Badge** | 需要快速识别 |
| ID（job-normal-001） | **Code / Text** | 不是状态，是标识 |
| Count（发现 24、风险 3） | **Text + Code** | 数值，不是状态 |
| Cost（$0.21） | **Code** | 数值 |
| Time（00:42） | **Code** | 数值 |
| Model（Qwen-Image-Edit-2511） | **Code** | 标识 |
| Provider | **Text** | 标识 |

**禁止 Badge 泛滥**：不得把所有 metadata 都 Badge 化。

## 4. Card Policy

### 禁止

```tsx
// ❌ Card 套 Card 套 Badge
<Card>
  <Card>
    <Badge>状态</Badge>
    <Badge>ID</Badge>
  </Card>
</Card>

// ❌ 把列表数据做成 Card 墙
{jobs.map(job => (
  <Card>
    <Card>{job.name}</Card>
    <Card>{job.status}</Card>
  </Card>
))}
```

### 正确

```tsx
// ✅ 高密度数据用 List/Table
<List hasDividers>
  <ListItem label={job.name} description={job.id} endContent={<Badge>{job.status}</Badge>} />
</List>

// ✅ Card 仅用于有明确 grouping 理由的区域
<Card>
  <Heading level={4}>QC 结果</Heading>
  <List hasDividers>{qcItems}</List>
</Card>
```

Card 必须有明确 grouping 理由：一个逻辑区域的容器，内部仍用 List/Table/Row。

## 5. Row / List / Table Policy

| 场景 | 推荐组件 | 理由 |
|---|---|---|
| Job 列表（多列、排序、筛选） | **Table** | 结构化数据，需要列对齐 |
| Artifact 谱系（单列、有层级） | **List** | 线性、有 description |
| QC 结果列表 | **List** | 每项有 status/evidence |
| Timeline 事件 | **List** | 按时间排序 |
| Metadata 行（key-value） | **List/Stack** | 紧凑 |
| 图片网格 | Grid（CSS） | 媒体内容，非数据 |

## 6. Metadata Hierarchy

```tsx
// ✅ 正确：Metadata 用 Text supporting + Code
<ListItem
  label={<Text type="body">图片用途分类结果</Text>}
  description={<Text type="supporting">12 张 · 4 种用途</Text>}
  endContent={<>
    <Badge variant="neutral" label="classify_purpose" />
    <Code>seq 8</Code>
  </>}
/>
```

视觉权重：label（body）> description（supporting）> Badge（状态）> Code（标识）。
不得让 Badge 或 Code 比 label 更大/更亮。
