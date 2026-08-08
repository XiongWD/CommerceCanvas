# F4 UI Foundation Readiness Map

> **Document type:** Component/Layout Usage Map for F4  
> **Project:** CommerceCanvas  
> **Phase:** G2-F3.5 → G2-F4  
> **Status:** PLANNED  
> **Last Updated:** 2026-08-08

## 目的

为 F4 五个核心页面建立 component/layout usage map，确保每个页面在开始开发前就知道：
- 使用哪些 Astryx Direct 组件
- 需要哪些 CommerceCanvas Wrapper/Custom 组件
- 适用什么 Density/T/Typography role

---

## 1. Product Workspace（商品工作区）

> 商品管理、资产预览、批量选择、SKU/locale/platform metadata

| Component | Source | Policy | Notes |
|---|---|---|---|
| Table | Astryx | Direct | 密集商品列表，compact density |
| List/ListItem | Astryx | Direct | 资产/变体列表 |
| TabList | Astryx | Direct | 商品/资产/变体 tab |
| Selector | Astryx | Direct | locale/platform filter |
| Badge | Astryx | Direct | 商品状态（active/draft/archived） |
| Tooltip | Astryx | Direct | SKU/字段说明 |
| Dialog | Astryx | Direct | 新建/编辑商品 |
| CheckboxInput | Astryx | Direct | 批量选择 |
| TextInput | Astryx | Direct | 搜索/新建 |
| SideNav/Inspector | CC Custom | Custom | 商品详情 inspector |
| Asset Preview | CC Custom | Custom | 缩略图预览 |

**Density**: compact  
**Typography**: Page Title (Heading level 1), Section Title (Heading 3), Metadata (Text supporting)

---

## 2. Generate Studio（生成工作室）

> 媒体优先画布、生成控制、路由/模型选择、进度、中间产物

| Component | Source | Policy | Notes |
|---|---|---|---|
| Button | Astryx | Direct | 生成/暂停/取消 |
| Selector | Astryx | Direct | 路由/模型/质量策略选择 |
| TabList | Astryx | Direct | 源图/参数/Recipe tab |
| Tooltip | Astryx | Direct | 参数说明 |
| Popover | Astryx | Direct | 高级设置 |
| ProgressBar | Astryx | Direct | 生成进度（determinate/indeterminate） |
| Skeleton | Astryx | Direct | 加载占位 |
| Dialog | Astryx | Direct | 确认/错误提示 |
| Switch | Astryx | Direct | 功能开关 |
| Media Canvas | CC Custom | Custom | **核心自定义**：图片编辑/预览画布 |
| Route/Model Selector | CC Wrapper | Wrapper | 业务语义包装 Astryx Selector |
| Intermediate Artifacts | CC Custom | Custom | 中间产物缩略图带 |

**Density**: default  
**Typography**: Panel Title (Heading 4), Body (Text body), Status (Badge)

---

## 3. Localization Studio（本地化工作室）

> 源/目标对比、locale、OCR 文字区域、翻译编辑、校验

| Component | Source | Policy | Notes |
|---|---|---|---|
| Table | Astryx | Direct | 文字区域列表（source/target/status） |
| TextInput | Astryx | Direct | 翻译编辑 |
| TextArea | Astryx | Direct | 长文本翻译 |
| Selector | Astryx | Direct | locale 选择 |
| TabList | Astryx | Direct | 源/目标/对比 tab |
| Badge | Astryx | Direct | 校验状态（pass/warning/error） |
| Tooltip | Astryx | Direct | OCR confidence 说明 |
| Dialog | Astryx | Direct | 批量操作确认 |
| Source/Target Compare | CC Custom | Custom | 双栏图片+文字对比视图 |
| OCR Region Overlay | CC Custom | Custom | 图片 OCR 区域高亮 |

**Density**: compact  
**Typography**: Label (Text label), Code (Code), Metadata (Text supporting)

---

## 4. Review Room（审核室）

> 审查画布、证据、QC、批准/拒绝、问题列表

| Component | Source | Policy | Notes |
|---|---|---|---|
| Button | Astryx | Direct | 批准/拒绝/修订 |
| DropdownMenu | Astryx | Direct | 审核操作菜单 |
| Popover | Astryx | Direct | 批注/评论 |
| Dialog | Astryx | Direct | 审核确认 |
| List/ListItem | Astryx | Direct | 问题列表 |
| Badge | Astryx | Direct | QC 结果状态 |
| TabList | Astryx | Direct | 资产/QC/证据 tab |
| Tooltip | Astryx | Direct | QC 检查项说明 |
| Review Canvas | CC Custom | Custom | **核心自定义**：审查画布（approve/reject 区域标注） |
| Evidence Viewer | CC Custom | Custom | 证据/mask/crop 展示 |
| QC Result Surface | CC Custom | Custom | QC 结果业务展示 |

**Density**: default  
**Typography**: Section Title (Heading 3), Status (Badge), Metric (Text body + Code)

---

## 5. Work Queue（工作队列）

> 高密度 job 列表、状态、成本、重试、优先级、路由、时间

| Component | Source | Policy | Notes |
|---|---|---|---|
| Table | Astryx | Direct | **核心**：高密度 job table |
| List/ListItem | Astryx | Direct | job 紧凑列表 |
| Badge | Astryx | Direct | job 状态（running/completed/awaiting_review/failed） |
| Selector | Astryx | Direct | 状态/路由/owner filter |
| TabList | Astryx | Direct | 全部/进行中/已完成/待审核 tab |
| Tooltip | Astryx | Direct | job 详情预览 |
| Popover | Astryx | Direct | 快捷操作 |
| DropdownMenu | Astryx | Direct | 批量操作 |
| ProgressBar | Astryx | Direct | job 进度 |
| Skeleton | Astryx | Direct | 加载占位 |
| EmptyState | Astryx | Direct | 无任务状态 |
| Job Priority/Route | CC Wrapper | Wrapper | 业务语义 Badge |

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

**结论**：Foundation 已就绪。每个页面的 Astryx Direct 组件覆盖了 table/list/form/overlay/badge 需求。CommerceCanvas Custom 组件集中在媒体画布和证据展示（这些本就不应用通用 UI 库做）。
