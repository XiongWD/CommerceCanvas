# CommerceCanvas G2 前端体验原型开发计划

> 计划版本：0.1.0  
> 阶段：G2 — UX 与架构设计  
> 目标：先验证页面效果、交互高级感、实时智能演算体验和跨页面一致性，不接真实后端。  
> 客户界面：简体中文。

## 1. 计划结论

可以从前端开始，但当前应开发 **可验证的高保真前端原型**，而不是生产级前端应用。

首个展示重点应是“竞品套图分析”，因为它最能同时展示：

- 多图片画布；
- 视觉结构识别；
- 中文分析轨迹；
- Evidence Overlay；
- Creative Recipe 渐进生成；
- 风险排除；
- Persistent Task Surface；
- SSE 式实时事件体验。

第一阶段不应平均投入七个页面。先把一条体验做到能够演示、审查和推翻，再提炼共享组件。

## 2. 阶段边界

### 本阶段要做

1. Graphite Canvas 视觉基础。
2. 全局工作台 Shell。
3. 实时智能演算层前端模型。
4. 确定性 Event Simulator。
5. 竞品套图分析主展示页。
6. 任务详情页。
7. Product Workspace、Generate Studio、Localization Studio、Review Room 的关键静态/半交互视图。
8. 跨页面持续任务面板。
9. 中文交互文案和信息层级验证。
10. 视觉回归和状态覆盖验收。

### 本阶段不做

- 正式登录、权限、租户和支付；
- FastAPI 正式业务接口；
- 数据库和队列；
- 真实图片模型、OCR、翻译或视频调用；
- 完整响应式移动端；
- 完整管理后台；
- 真实文件持久化；
- 平台自动发布；
- 完整视频编辑器。

## 3. 技术基线

```text
React
TypeScript
Vite
Tailwind CSS
Radix UI / shadcn（只提供无障碍行为和基础结构）
TanStack Query（Mock 请求状态）
Zustand（工作区和演示任务状态）
React Konva（图片证据框、Mask、测量线和差异区域）
dnd-kit（素材排序和槽位拖放）
TanStack Virtual（长分析轨迹和任务列表）
Vitest + Testing Library
Playwright（关键演示流程）
```

首轮不建议使用 React Flow。只有任务详情中的 DAG 确认需要节点图后再引入，避免为了技术效果提前增加复杂度。

## 4. 建议前端目录

```text
frontend/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── shell/
│   ├── pages/
│   │   ├── work-queue/
│   │   ├── product-workspace/
│   │   ├── competitor-analysis/
│   │   ├── generate-studio/
│   │   ├── localization-studio/
│   │   ├── review-room/
│   │   └── job-detail/
│   ├── features/
│   │   ├── live-intelligence/
│   │   ├── evidence-overlay/
│   │   ├── task-surface/
│   │   ├── artifact-preview/
│   │   ├── qc-inspector/
│   │   └── recipe-editor/
│   ├── components/
│   │   ├── workspace/
│   │   ├── navigation/
│   │   └── primitives/
│   ├── contracts/
│   ├── mocks/
│   │   ├── scenarios/
│   │   ├── fixtures/
│   │   └── event-simulator/
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.css
│   └── tests/
└── public/
    └── demo-assets/
```

页面不得各自实现一套任务日志。实时智能演算能力必须集中在 `features/live-intelligence/`，由不同页面提供业务展示映射。

## 5. 核心前端契约

原型阶段先冻结 TypeScript 级别的最小合同，未来再映射后端 Schema：

```ts
type ExecutionEventKind =
  | '任务状态'
  | '节点状态'
  | '分析发现'
  | '判断依据'
  | '系统决策'
  | '风险警告'
  | '中间产物'
  | '质量检查'
  | '路由升级'
  | '成本变化'
  | '人工介入'
  | '里程碑';

interface ExecutionEvent {
  eventId: string;
  sequence: number;
  jobId: string;
  taskId?: string;
  occurredAt: string;
  kind: ExecutionEventKind;
  code: string;              // 内部稳定事件码
  titleZh: string;           // 客户可见中文标题
  summaryZh: string;         // 客户可见中文说明
  progress?: {
    mode: 'determinate' | 'indeterminate';
    current?: number;
    total?: number;
    unit?: string;
  };
  evidenceIds?: string[];
  artifactIds?: string[];
  severity: 'info' | 'success' | 'warning' | 'blocking';
  visibility: 'customer' | 'admin' | 'diagnostic';
}
```

另外至少定义：

- `JobSnapshot`
- `TaskSnapshot`
- `ArtifactPreview`
- `AnalysisFinding`
- `EvidenceRegion`
- `CreativeRecipeDraft`
- `QCResult`
- `CostEstimate`

客户页面只消费 `visibility: customer` 的中文语义事件。管理员诊断信息不得复用同一显示模板直接输出。

## 6. 原型里程碑

### F0 — 设计和演示基础

输出：

- 1440×900 主工作区基线；
- Graphite Canvas Tokens；
- 中文字体栈与等宽数据字体栈；
- 全局图标栏、项目上下文栏、中央画布、属性检查器、底部任务栏；
- 20 个 SKU 的演示数据结构中先选 1 个代表 SKU；
- 12 张竞品图片的演示素材；
- 事件场景脚本。

验收重点：

- 不像 ERP；
- 中央媒体区域最大；
- 深灰但不是纯黑；
- 不使用大面积紫色渐变、玻璃拟态和卡片堆叠；
- 中文信息密度足够但不拥挤。

### F1 — Live Intelligence Layer 最小闭环

实现：

- Event Simulator；
- 事件暂停、继续、加速和重置；
- 已知分母进度与未知分母进度；
- 分析轨迹；
- 里程碑 Reveal；
- Evidence Overlay；
- Persistent Task Surface；
- 断线、重连、重放和去重的前端演示；
- 事件与中间产物关联。

必须有三套场景：

1. 正常完成；
2. 中途发现竞品 Logo 和结构差异，产生警告；
3. 断线后恢复并继续显示，不重复事件。

验收重点：

- 不是原始日志；
- 不是伪终端；
- 每条轨迹都能回答“发现了什么、依据是什么、会产生什么影响”；
- 进度不可计算时不显示虚假百分比；
- 所有客户可见文本为中文。

### F2 — 竞品套图分析展示页

这是第一优先级页面。

布局建议：

```text
左侧：项目 / Product Master 摘要 / 素材分组
中央：12 张图片画布 + 当前证据叠加
右侧：分析结果 / Creative Recipe 草案 / 风险排除
底部：跨页面持续任务面板
可展开：分析轨迹和任务详情
```

执行过程中逐步显示：

- 素材接收与校验；
- 图片用途分类；
- 商品主体区域；
- OCR 和 Logo 区域；
- 构图聚类；
- 光线和色调；
- 卖点顺序；
- 可继承元素；
- 禁止继承元素；
- Creative Recipe 草案；
- 置信度和待人工确认项。

用户应能点击轨迹中的“检测到 7 处竞品标识”，画布立即定位并高亮证据区域。

### F3 — 任务详情与跨页面连续性

实现：

- Job 总览；
- 节点状态列表；
- 时间线；
- 关键事件筛选；
- Artifact 关系；
- QC 结果；
- 成本变化；
- 重试和路由升级原因；
- 诊断入口仅管理员可见；
- 从竞品分析切换到其他页面后任务继续显示。

任务详情不是给客户看的原始服务器日志，而是可审计的中文执行记录。

### F4 — 其余核心页面骨架

按以下顺序补充：

1. Product Workspace
2. Generate Studio
3. Localization Studio
4. Review Room
5. Work Queue

每个页面只完成一个最有代表性的交互：

- Product Workspace：Product Master 关键特征与缺失参考角度；
- Generate Studio：质量策略、预计成本、候选图和 QC 淘汰；
- Localization Studio：OCR 块、保护字段、翻译版本、排版溢出；
- Review Room：版本对比、风险定位、通过/返工；
- Work Queue：任务密度、人工介入、Worker 状态和失败恢复。

禁止此阶段追求完整 CRUD。

### F5 — 统一和验收

完成：

- 页面间信息层级统一；
- 事件文案字典；
- 状态、警告和错误语义统一；
- 键盘操作和基础无障碍；
- 1440×900、1366×768、1280×800 三种桌面尺寸检查；
- 关键流程录屏；
- 视觉回归截图；
- 用户演示脚本；
- 已知问题和开放决策清单。

## 7. 第一批路由

```text
/queue
/products/:productId
/products/:productId/competitor-analysis/:runId
/products/:productId/generate/:runId
/products/:productId/localization/:sceneId
/reviews/:reviewId
/jobs/:jobId
```

路由只是体验原型结构，不代表后端 API 已冻结。

## 8. 视觉和动效规则

### 高级感来自

- 实时且真实的结构化信息；
- 状态变化有因果关系；
- 证据能被定位；
- 中间结果逐步形成；
- 时间、数量、成本和风险透明；
- 适量等宽字体用于编号、时间和指标；
- 细边框、克制动效和稳定布局。

### 禁止

- Matrix 代码雨；
- 虚构 Shell 命令；
- 伪造模型思考过程；
- 大面积霓虹和发光描边；
- 每个节点都弹 Toast；
- 无意义扫描动画；
- 为了显得复杂而增加不存在的阶段；
- 把失败隐藏在“正在优化”中。

### 动效预算

- 常规状态变化：120–180ms；
- 面板展开：180–240ms；
- 里程碑 Reveal：300–500ms，且只用于关键产出；
- 高频 SSE 事件合并显示，避免界面持续抖动；
- 用户开启减少动态效果后，仍能完整理解状态。

## 9. 演示场景脚本

第一条完整演示应固定为：

```text
开放式耳机 Product Master
+ 12 张同类竞品套图
+ Amazon US Recipe
```

过程：

1. 图片校验完成；
2. 分类为主图、场景、卖点、细节和参数图；
3. 检出 Logo、型号和包装文字；
4. 聚类出 3 套构图语言；
5. 识别出 5 种可复用光线模式；
6. 发现竞品为入耳式结构，与自己的开放式耳机不同；
7. 系统保留构图和摄影语言，排除商品结构；
8. 形成 Creative Recipe 草案；
9. 标记 2 项需要人工确认；
10. 输出可进入 Generate Studio 的草案。

所有事件必须可以回溯到演示素材或场景脚本，不能使用无依据的随机结论。

## 10. 验收门槛

### 页面和视觉

- 主要页面在 1440×900 下无关键内容遮挡；
- 中央媒体画布面积明显大于侧栏；
- 不出现通用后台模板观感；
- 颜色语义符合 Graphite Canvas；
- 客户可见文案 100% 为简体中文。

### 实时交互

- 任务开始后立即出现可理解的中文状态；
- 已知总量使用真实 `current/total`；
- 未知总量显示阶段、活动状态和已用时间，不显示假百分比；
- 同一事件重放不会重复插入；
- 页面切换不丢失活动任务；
- 关键发现可以定位到证据；
- 中间产物可在任务未结束时预览；
- 失败、警告和人工介入清晰可见。

### 工程

- TypeScript 严格模式；
- 无页面级重复任务状态实现；
- Event Simulator 场景可复现；
- 核心流程有 Playwright 测试；
- 关键组件有状态测试；
- 无真实 Provider 密钥或外部模型调用；
- `npm run build`、测试和演示启动命令实际运行通过。

## 11. 开发 Agent 首个任务

首个任务只做 F0，不直接开发所有页面：

```text
建立 frontend/ 工程、Graphite Canvas Tokens、全局 Shell、中文导航、
中央媒体工作区、右侧检查器和底部持续任务栏的静态高保真框架。
使用固定演示数据展示竞品分析页面的静态完成态。
不实现 Event Simulator，不接 API，不开发其他页面业务。
```

首个任务提交后先审核页面截图和信息层级。只有视觉方向通过，才进入 F1 的实时演算层。
