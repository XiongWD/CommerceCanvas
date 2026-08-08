# F4 UI Foundation Readiness Map

> **Document type:** Component/Layout Usage Map for F4  
> **Project:** CommerceCanvas  
> **Phase:** G2-F3.5 → G2-F4  
> **Status:** PLANNED  
> **Last Updated:** 2026-08-08
> **Source of truth:** `frontend/src/design/component-policy.ts`（唯一权威数据源）

## 目的

为 F4 五个核心页面建立 component/layout usage map，确保每个页面在开始开发前就知道：
- 使用哪些 Astryx Direct 组件（Policy A）
- 需要哪些 CommerceCanvas Wrapper 组件（Policy B，import `@/components/ui/...`）
- 哪些是 CommerceCanvas Custom 组件（Policy C）
- 适用什么 Density/T/Typography role

> **Policy 同步约束**：本表所有 primitive 的 Source/Policy **必须**与
> `frontend/src/design/component-policy.ts` 一致。Policy B primitive 统一 import
> `@/components/ui/<Component>`；Policy A primitive 统一 import `@astryxdesign/core`。
> 不得在本表把 Policy B 写为 "Astryx Direct"。

---

## 1. Product Workspace（商品工作区）

> 商品管理、资产预览、批量选择、SKU/locale/platform metadata

| Component | Source | Policy | Import | Notes |
|---|---|---|---|---|
| Table | CC Wrapper | B | `@/components/ui/Table` | 密集商品列表，compact density |
| List/ListItem | CC Wrapper | B | `@/components/ui/List` | 资产/变体列表 |
| TabList | CC Wrapper | B | `@/components/ui/TabList` | 商品/资产/变体 tab |
| Selector | CC Wrapper | B | `@/components/ui/Selector` | locale/platform filter |
| Badge | CC Wrapper | B | `@/components/ui/Badge` | 商品状态（active/draft/archived） |
| Tooltip | CC Wrapper | B | `@/components/ui/Tooltip` | SKU/字段说明 |
| Dialog | CC Wrapper | B | `@/components/ui/Dialog` | 新建/编辑商品 |
| CheckboxInput | Astryx | A | `@astryxdesign/core` | 批量选择 |
| TextInput | CC Wrapper | B | `@/components/ui/TextInput` | 搜索/新建 |
| SideNav/Inspector | CC Custom | C | `frontend/src/components/layout/*` | 商品详情 inspector |
| Asset Preview | CC Custom | C | — | 缩略图预览 |

**Density**: compact  
**Typography**: Page Title (Heading level 1), Section Title (Heading 3), Metadata (Text supporting)

---

## 2. Generate Studio（生成工作室）

> 媒体优先画布、生成控制、路由/模型选择、进度、中间产物

| Component | Source | Policy | Import | Notes |
|---|---|---|---|---|
| Button | CC Wrapper | B | `@/components/ui/Button` | 生成/暂停/取消 |
| Selector | CC Wrapper | B | `@/components/ui/Selector` | 路由/模型/质量策略选择 |
| TabList | CC Wrapper | B | `@/components/ui/TabList` | 源图/参数/Recipe tab |
| Tooltip | CC Wrapper | B | `@/components/ui/Tooltip` | 参数说明 |
| Popover | CC Wrapper | B | `@/components/ui/Popover` | 高级设置 |
| ProgressBar | CC Wrapper | B | `@/components/ui/ProgressBar` | 生成进度（determinate/indeterminate） |
| Skeleton | Astryx | A | `@astryxdesign/core` | 加载占位 |
| Dialog | CC Wrapper | B | `@/components/ui/Dialog` | 确认/错误提示 |
| Switch | Astryx | A | `@astryxdesign/core` | 功能开关 |
| Media Canvas | CC Custom | C | `frontend/src/components/competitor/...` | **核心自定义**：图片编辑/预览画布 |
| Route/Model Selector | CC Wrapper | B | `@/components/ui/Selector` | 业务语义包装（preset 在 Selector wrapper 内） |
| Intermediate Artifacts | CC Custom | C | — | 中间产物缩略图带 |

**Density**: default  
**Typography**: Panel Title (Heading 4), Body (Text body), Status (Badge)

---

## 3. Localization Studio（本地化工作室）

> 源/目标对比、locale、OCR 文字区域、翻译编辑、校验

| Component | Source | Policy | Import | Notes |
|---|---|---|---|---|
| Table | CC Wrapper | B | `@/components/ui/Table` | 文字区域列表（source/target/status） |
| TextInput | CC Wrapper | B | `@/components/ui/TextInput` | 翻译编辑 |
| TextArea | CC Wrapper | B | `@/components/ui/TextArea` | 长文本翻译 |
| Selector | CC Wrapper | B | `@/components/ui/Selector` | locale 选择 |
| TabList | CC Wrapper | B | `@/components/ui/TabList` | 源/目标/对比 tab |
| Badge | CC Wrapper | B | `@/components/ui/Badge` | 校验状态（pass/warning/error） |
| Tooltip | CC Wrapper | B | `@/components/ui/Tooltip` | OCR confidence 说明 |
| Dialog | CC Wrapper | B | `@/components/ui/Dialog` | 批量操作确认 |
| Source/Target Compare | CC Custom | C | — | 双栏图片+文字对比视图 |
| OCR Region Overlay | CC Custom | C | — | 图片 OCR 区域高亮 |

**Density**: compact  
**Typography**: Label (Text label), Code (Code), Metadata (Text supporting)

---

## 4. Review Room（审核室）

> 审查画布、证据、QC、批准/拒绝、问题列表

| Component | Source | Policy | Import | Notes |
|---|---|---|---|---|
| Button | CC Wrapper | B | `@/components/ui/Button` | 批准/拒绝/修订 |
| DropdownMenu | CC Wrapper | B | `@/components/ui/DropdownMenu` | 审核操作菜单 |
| Popover | CC Wrapper | B | `@/components/ui/Popover` | 批注/评论 |
| Dialog | CC Wrapper | B | `@/components/ui/Dialog` | 审核确认 |
| List/ListItem | CC Wrapper | B | `@/components/ui/List` | 问题列表 |
| Badge | CC Wrapper | B | `@/components/ui/Badge` | QC 结果状态 |
| TabList | CC Wrapper | B | `@/components/ui/TabList` | 资产/QC/证据 tab |
| Tooltip | CC Wrapper | B | `@/components/ui/Tooltip` | QC 检查项说明 |
| Review Canvas | CC Custom | C | — | **核心自定义**：审查画布（approve/reject 区域标注） |
| Evidence Viewer | CC Custom | C | `frontend/src/components/competitor/EvidenceOverlay.tsx` | 证据/mask/crop 展示 |
| QC Result Surface | CC Custom | C | `frontend/src/features/job-detail/*` | QC 结果业务展示 |

**Density**: default  
**Typography**: Section Title (Heading 3), Status (Badge), Metric (Text body + Code)

---

## 5. Work Queue（工作队列）

> 高密度 job 列表、状态、成本、重试、优先级、路由、时间

| Component | Source | Policy | Import | Notes |
|---|---|---|---|---|
| Table | CC Wrapper | B | `@/components/ui/Table` | **核心**：高密度 job table |
| List/ListItem | CC Wrapper | B | `@/components/ui/List` | job 紧凑列表 |
| Badge | CC Wrapper | B | `@/components/ui/Badge` | job 状态（running/completed/awaiting_review/failed） |
| Selector | CC Wrapper | B | `@/components/ui/Selector` | 状态/路由/owner filter |
| TabList | CC Wrapper | B | `@/components/ui/TabList` | 全部/进行中/已完成/待审核 tab |
| Tooltip | CC Wrapper | B | `@/components/ui/Tooltip` | job 详情预览 |
| Popover | CC Wrapper | B | `@/components/ui/Popover` | 快捷操作 |
| DropdownMenu | CC Wrapper | B | `@/components/ui/DropdownMenu` | 批量操作 |
| ProgressBar | CC Wrapper | B | `@/components/ui/ProgressBar` | job 进度 |
| Skeleton | Astryx | A | `@astryxdesign/core` | 加载占位 |
| EmptyState | CC Wrapper | B | `@/components/ui/EmptyState` | 无任务状态 |
| Job Priority/Route | CC Wrapper | B | `@/components/ui/Badge` | 业务语义 Badge preset |

**Density**: compact（最密集的页面，检验 Density Contract 的关键）  
**Typography**: Metadata (Text supporting), Code (Code), Timestamp (Code), Status (Badge)

---

## Foundation Readiness 判定

| Page | Foundation Ready | Critical Custom Needed | Risk |
|---|---|---|---|
| Product Workspace | ✅ | Asset Preview, Inspector | low |
| Generate Studio | ✅ | Media Canvas | medium（核心自定义） |
| Localization Studio | ✅ | Source/Target Compare, OCR Overlay | medium |
| Review Room | ✅ | Review Canvas, Evidence Viewer | medium（核心自定义） |
| Work Queue | ✅ | none（纯 Astryx + Wrapper） | low |

**结论**：Foundation 已就绪。每个页面的 Policy A/B primitive 覆盖了 table/list/form/overlay/badge 需求；
Policy B wrapper 统一从 `@/components/ui/*` 引入并已应用 Graphite Canvas token。
CommerceCanvas Custom 组件集中在媒体画布和证据展示（这些本就不应用通用 UI 库做）。
