# CommerceCanvas MVP Product Requirements Document


> **Document status:** G0 Draft for Review  
> **Package version:** 0.2.0  
> **Baseline date:** 2026-08-02  
> **Project:** CommerceCanvas — Cross-Border Commerce Visual Studio  
> **Customer-facing language:** Simplified Chinese (`zh-CN`) for all customer-visible UI, progress, interaction logs, warnings, and actions  
> **Change rule:** Any change to a frozen decision requires an explicit decision record and impact review.

### Status legend

| Label | Meaning |
|---|---|
| `FROZEN` | Approved product decision. Implementation and later documents must conform unless formally changed. |
| `VALIDATION_REQUIRED` | Technical hypothesis or provisional threshold that must be tested in G1 before it can become a release commitment. |
| `NON_BLOCKING_EXPERIMENT` | Useful experimental capability that may ship behind a Beta/Experimental flag but cannot block MVP release. |
| `OUT_OF_SCOPE` | Explicitly excluded from MVP. Work must not be started without scope change approval. |


## 1. Executive summary

CommerceCanvas is an internal visual production workbench for cross-border commerce teams. It consolidates product image generation, image editing, localization, programmatic video, quality control, review, versioning, cost tracking, and platform export into one auditable workflow.

The MVP is not a generic consumer image generator and is not a public multi-tenant SaaS. Its primary job is to help a studio produce reliable, reviewable, platform-ready visual assets for batches of SKUs while preserving product identity and text accuracy.

## 2. Problem statement

Cross-border commerce teams currently move product assets between unrelated generation, translation, background removal, retouching, video, and review tools. This creates five structural problems:

1. Product references and brand facts are repeatedly re-uploaded and inconsistently interpreted.
2. Generation results are not linked to a stable SKU identity source.
3. Translation workflows often redraw the full image and accidentally modify the product.
4. Cost, model version, retries, QC, and approval history are fragmented or missing.
5. Batch production and recovery from failures require manual coordination.

## 3. Target users

| User type | Primary need | MVP support |
|---|---|---|
| Cross-border commerce studio operator | Produce and review visual assets for many SKUs | `FROZEN` |
| Product visual designer | Create, compare, revise, and approve images | `FROZEN` |
| Localization specialist | Translate image text without modifying the product | `FROZEN` |
| Reviewer or team lead | Approve, reject, comment, and trace versions | `FROZEN` |
| System administrator | Configure providers, models, cost rules, and workers | `FROZEN` |
| Public self-service customer | Register, pay, and use a public SaaS | `OUT_OF_SCOPE` |

## 4. Product principles

| ID | Principle | Status |
|---|---|---|
| PRD-P-001 | Product identity is anchored by Product Master, not by a single uploaded image. | `FROZEN` |
| PRD-P-002 | Ordinary users choose quality intent; they do not need to select model IDs. | `FROZEN` |
| PRD-P-003 | Release localization changes text only and must not regenerate the product body. | `FROZEN` |
| PRD-P-004 | Every generated or transformed asset must be traceable to inputs, provider binding, cost, QC, and review history. | `FROZEN` |
| PRD-P-005 | Hard programmatic failures cannot be overridden by a general-purpose VLM. | `FROZEN` |
| PRD-P-006 | Experimental capabilities are clearly marked and cannot become hidden MVP dependencies. | `FROZEN` |
| PRD-P-007 | The central media workspace receives visual priority over dashboards and KPI cards. | `FROZEN` |
| PRD-P-008 | Long-running work must expose a Live Intelligence Layer that makes real execution, intermediate findings, evidence, risk, and user intervention visible across pages. | `FROZEN` |
| PRD-P-009 | All customer-visible UI copy, progress, analysis traces, warnings, errors, milestones, and actions use Simplified Chinese. Internal codes and model IDs may remain English but require Chinese presentation context. | `FROZEN` |
| PRD-P-010 | Perceived sophistication must come from truthful structured evidence and responsive interaction, not fabricated thinking, fake terminal output, or unsupported progress percentages. | `FROZEN` |

## 5. MVP objectives

### 5.1 Business objectives

- Reduce repeated upload and manual transfer of product assets across third-party tools.
- Support auditable production for multiple SKUs and platform-specific image sets.
- Establish a measurable baseline for cost, pass rate, identity failure, text error, and review effort.
- Provide a controlled path from product source material to approved export packages.

### 5.2 Product objectives

| ID | Objective | Release class |
|---|---|---|
| PRD-O-001 | Create and version Product Masters. | `FROZEN` |
| PRD-O-002 | Generate standard product and scene images. | `FROZEN` |
| PRD-O-003 | Rebuild visual structure from same-category, different-product competitor references. | `FROZEN` |
| PRD-O-004 | Localize image text for zh-CN, en-US, and de-DE with protected terms and deterministic layout. | `FROZEN` |
| PRD-O-005 | Run batch jobs with observable task and artifact states. | `FROZEN` |
| PRD-O-006 | Apply layered QC and human review before release. | `FROZEN` |
| PRD-O-007 | Export Amazon, Shopify, and TikTok Shop directory packages. | `FROZEN` |
| PRD-O-008 | Produce programmatic product videos from approved assets. | `FROZEN` |
| PRD-O-009 | Test same-product competitor set migration. | `NON_BLOCKING_EXPERIMENT` |
| PRD-O-010 | Test generative TikTok product video. | `NON_BLOCKING_EXPERIMENT` |
| PRD-O-011 | Provide cross-page real-time execution visibility through SSE, including stage nodes, meaningful Chinese interaction logs, intermediate artifacts, evidence, warnings, retries, fallback, cost changes, and required actions. | `FROZEN` |
| PRD-O-012 | Establish a differentiated professional and high-tech product perception through Graphite Canvas, evidence visualization, progressive result reveal, and persistent task presence. | `FROZEN` product goal / `VALIDATION_REQUIRED` UX effectiveness |

## 6. Core concepts

### 6.1 Product Master

A versioned SKU identity record containing product facts, multi-view references, logo and packaging text regions, key identity features, allowed changes, and prohibited changes. It is the authority for generation and product-identity QC.

### 6.2 Recipe

A versioned platform asset specification defining slots, output dimensions, composition constraints, text policy, generation strategy, QC policy, naming, and export directory.

### 6.3 Job, Task, and Artifact

- **Job:** user-visible production request for one or more SKUs.
- **Task:** executable unit assigned to a worker or external provider.
- **Artifact:** immutable or versioned media/data output created by a task.


### 6.4 Live Intelligence Layer

A product-wide interaction layer that converts authoritative execution events into customer-understandable Chinese status, analysis traces, evidence overlays, intermediate results, warnings, and actions. SSE is the default server-to-browser transport for execution events; normal commands remain authenticated HTTP API actions.

The layer contains five coordinated presentation patterns:

1. **环境态势（Ambient Intelligence）** — connection, active stage, worker/task activity, elapsed time, and queue state without dominating the canvas;
2. **分析轨迹（Analysis Trace）** — structured observations, evidence, decisions, warnings, actions, and artifact events rather than raw developer logs;
3. **证据可视化（Evidence Visualization）** — masks, OCR boxes, logo regions, difference maps, key-region matches, and linked QC evidence;
4. **里程碑揭示（Milestone Reveal）** — restrained, high-value completion moments for meaningful stages;
5. **持续任务面板（Persistent Task Surface）** — a compact bottom status surface that follows the user across pages and expands to 完整任务详情（Job Detail）.

Customer-visible event text is Simplified Chinese. Stable internal event codes, provider/model identifiers, trace IDs, and API fields may remain English, but the presentation layer must provide Chinese labels and explanations.

## 7. Core business workflows

### 7.1 Original product set production

```text
Product Master
→ choose platform Recipe and quality policy
→ compile slot tasks
→ generate or deterministically transform assets
→ QC
→ human review
→ revise or approve
→ export platform package
```

### 7.2 Same-category visual borrowing

```text
Competitor image set
→ classify image purpose
→ extract visual structure and page rhythm
→ create Creative Recipe
→ rebuild with own Product Master
→ product identity QC
→ human review
```

The system may inherit composition, lighting, scene, tone, image purpose, selling-point structure, and page rhythm. It must not inherit competitor product structure, logo, model number, packaging text, or unsupported product claims.

### 7.3 Same-product competitor migration

```text
Competitor image set
→ classify reusable scene/layout elements
→ replace or rebuild product body
→ replace brand and text
→ product authenticity QC
→ mandatory human review
```

This is a Beta workflow. Hand-held, worn, occluded, reflective, large-angle, logo-sensitive, and packaging-text-sensitive inputs are treated as high-risk.

### 7.4 Image localization

```text
OCR and layout parse
→ classify text blocks
→ protect brand/SKU/numbers/units
→ translate
→ erase source text
→ deterministic SVG/Pango/HarfBuzz layout
→ OCR readback
→ product-region difference check
→ human review when required
```


### 7.5 Cross-workflow live execution experience

Every workflow expected to run longer than two seconds or to continue after navigation must publish an observable execution stream. The stream begins immediately after acceptance and continues through queueing, stage execution, intermediate findings, evidence production, QC, retry/fallback, review readiness, and terminal outcome.

A task must never appear idle merely because the current operation lacks a mathematically valid percentage. In that case, the UI shows the current stage, elapsed time, completed facts, and an indeterminate activity state. Percentages are shown only when a real denominator exists.

## 8. Functional requirements

### 8.1 Product Master

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PRD-F-001 | Create SKU records with name, category, brand, model, color, material, dimensions, and selling points. | Must | `FROZEN` |
| PRD-F-002 | Attach front, side, back, detail, logo, and packaging references. | Must | `FROZEN` |
| PRD-F-003 | Record key identity features, allowed changes, and prohibited changes. | Must | `FROZEN` |
| PRD-F-004 | Version Product Master changes and preserve prior bindings to generated assets. | Must | `FROZEN` |

### 8.2 Recipes and asset generation

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PRD-F-010 | Provide baseline Recipes for Amazon, Shopify, and TikTok Shop. | Must | `FROZEN` |
| PRD-F-011 | Define slot-level canvas, size, product ratio, placement, background, text, safety zone, generation, QC, naming, and export rules. | Must | `FROZEN` |
| PRD-F-012 | Support customer-facing quality intents: 快速、均衡、高质量、商品保真优先、文字准确优先. Internal route codes may remain English. | Must | `FROZEN` |
| PRD-F-013 | Show estimated cost, call count, quality tier, and cloud-processing notice before generation. | Must | `FROZEN` |
| PRD-F-014 | Record actual provider/model version, input version, cost, duration, retries, QC, and review outcome. | Must | `FROZEN` |
| PRD-F-015 | Support same-category Creative Recipe extraction and reconstruction. | Must | `VALIDATION_REQUIRED` |
| PRD-F-016 | Support same-product migration behind a Beta flag and mandatory review. | Could | `NON_BLOCKING_EXPERIMENT` |

### 8.3 Localization

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PRD-F-020 | Support zh-CN, en-US, and de-DE in MVP. | Must | `FROZEN` |
| PRD-F-021 | Store source, standard, marketing, and short translations per text block. | Must | `FROZEN` |
| PRD-F-022 | Store text region, font, size, translate permission, OCR confidence, and overflow state. | Must | `FROZEN` |
| PRD-F-023 | Hard-protect brand, SKU, model, numeric values, and units. | Must | `FROZEN` |
| PRD-F-024 | Use deterministic layout for release output. | Must | `FROZEN` |
| PRD-F-025 | Perform OCR readback and product-region difference checking. | Must | `VALIDATION_REQUIRED` |

### 8.4 Jobs, QC, review, and export

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PRD-F-030 | Support batch jobs with Job → Task → Artifact traceability. | Must | `FROZEN` |
| PRD-F-031 | Expose task progress, retries, provider calls, worker state, and failure reason. | Must | `FROZEN` |
| PRD-F-032 | Apply L0 hard rules, L1 specialized vision checks, L2 VLM review, and L3 human review. | Must | `FROZEN` |
| PRD-F-033 | Allow approve, reject, request revision, compare versions, and record comments. | Must | `FROZEN` |
| PRD-F-034 | Export approved assets using platform-specific names and directories. | Must | `FROZEN` |
| PRD-F-035 | Generate programmatic product videos using Remotion/ffmpeg. | Must | `FROZEN` |


### 8.5 Live Intelligence and customer-language requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| PRD-F-040 | Use SSE as the default server-to-browser transport for Job, Task, Attempt, Artifact, QC, review-readiness, cost, and intervention events. | Must | `FROZEN` |
| PRD-F-041 | Persist business-significant events and support ordered replay using event ID/sequence after reconnect; heartbeat-only events may remain transient. | Must | `FROZEN` architecture / `VALIDATION_REQUIRED` retention |
| PRD-F-042 | Provide a cross-page persistent task surface with compact, expanded, and full-detail modes. | Must | `FROZEN` |
| PRD-F-043 | Render page-specific stage nodes and analysis traces for Product Master, competitor analysis, generation, localization, QC/review, export, and programmatic video. | Must | `FROZEN` |
| PRD-F-044 | Surface intermediate artifacts and evidence as soon as they are valid instead of withholding all output until terminal completion. | Must | `FROZEN` |
| PRD-F-045 | Distinguish observation, evidence, decision, warning, action, artifact, retry/fallback, cost update, and terminal outcome events. | Must | `FROZEN` taxonomy / `VALIDATION_REQUIRED` final schema |
| PRD-F-046 | Show truthful progress only: determinate percentage requires a real denominator; otherwise show stage, completed facts, elapsed time, and indeterminate activity. | Must | `FROZEN` |
| PRD-F-047 | Expose provider fallback, retry, cost increase, worker loss, degraded mode, and human-intervention requirements; never hide them behind a generic loading state. | Must | `FROZEN` |
| PRD-F-048 | Use Simplified Chinese for all customer-visible navigation, controls, status, interaction logs, warnings, error guidance, milestone text, and review actions. | Must | `FROZEN` |
| PRD-F-049 | Keep raw diagnostic logs, stack traces, provider payloads, secrets, and unredacted prompts out of ordinary customer views. | Must | `FROZEN` |
| PRD-F-050 | Use restrained high-information visual effects—active edges, overlays, node transitions, state pulses, and progressive result reveal—without fake code rain, fake reasoning, or excessive neon/glow. | Must | `FROZEN` direction / `VALIDATION_REQUIRED` detailed motion system |
| PRD-F-051 | Map every customer-visible event to a Chinese title, concise summary, severity, evidence/action linkage, and fallback copy when details are unavailable. | Must | `FROZEN` |

## 9. UX requirements

- Use the Graphite Canvas design language.
- Use a 64 px global icon rail, 220–260 px context rail, central media canvas, 320–360 px inspector, and bottom task-status area as the baseline desktop shell.
- Prioritize the customer-facing Chinese pages: 工作队列, 商品工作区, 竞品套图分析, 生成工作室, 本地化工作室, 审核室, and 任务详情. English page names may remain internal documentation aliases only.
- Every core page must consume the same event contract but present page-specific intelligence: Product Master identity extraction; competitor visual-structure analysis; route/QC/fallback in generation; OCR/protection/layout/readback in localization; evidence/version decisions in review; queue/worker/retry status in 工作队列.
- The bottom persistent task surface remains visible during navigation and shows Chinese stage, elapsed time, findings/warnings counts, cost delta, and required action.
- Use monospaced typography selectively for IDs, timestamps, measurements, and state codes; business interpretation remains readable Chinese.
- Avoid ERP-style dense tables as the dominant interaction, oversized KPI cards, large white surfaces, purple gradients, universal cards, glassmorphism, fake terminal code, code rain, and exposing ComfyUI graphs to ordinary users.

## 10. Deployment requirements

- Primary application is Web.
- Support single-machine private deployment, studio LAN deployment, and managed cloud deployment.
- Server-side PostgreSQL is the sole business-state authority.
- A future Windows Agent may watch folders, sync files, cache, run local GPU tools, and export to fixed directories, but must not own business state.

## 11. Release gates

MVP release requires:

1. G0 documents approved and frozen.
2. G1 experiments completed with raw evidence and explicit pass/fail conclusions.
3. G2 information architecture, data model, state machine, provider binding, QC, localization scene, storage, and API contracts approved.
4. G3 vertical slice passes end-to-end with no manual database intervention and includes real SSE stage/progress/evidence visibility from task acceptance through export.
5. All customer-visible UI and interaction logs in the release candidate pass Simplified-Chinese coverage checks with no unexplained raw English system message.
6. G5 studio trial meets the approved acceptance metrics in `../validation/acceptance-metrics.md`.

Same-product migration and generative product video are not release blockers.

## 12. Success metrics

The MVP must report, not merely estimate:

- human time per SKU;
- average cost per approved image;
- first-pass approval rate;
- approval rate within two attempts;
- product identity failure rate;
- text error rate;
- manual repair rate;
- job failure rate;
- average review time;
- pass rate by provider/model/version and task type;
- time to first visible acknowledgement and first meaningful execution event;
- live-event stage coverage and reconnect/replay correctness;
- percentage of intermediate findings linked to inspectable evidence;
- Simplified-Chinese customer-copy coverage;
- user-rated clarity, trust, professional capability, and willingness to continue the workflow after observing live execution.

Thresholds remain provisional until G1 and are defined in `../validation/acceptance-metrics.md`.

## 13. Dependencies and assumptions

- Provider/model names and capabilities are candidate bindings until verified in G1.
- Platform-specific image rules can change and must be versioned in Recipes.
- Product identity thresholds will likely be category-specific rather than globally fixed.
- German copy expansion and font fallback require dedicated layout tests.
- Competitor-reference usage requires legal and policy review before production rollout.

## 14. Page-specific Live Intelligence coverage

| Customer page | Required live presentation |
|---|---|
| 工作队列 | queue position, active stage, worker/attempt state, retry/fallback, elapsed time, cost, partial completion, required intervention |
| 商品工作区 | ingest, reference validation, view classification, logo/text region discovery, identity-feature draft, missing-reference warning |
| 竞品套图分析 | image-role classification, OCR/logo detection, reusable composition/lighting/page rhythm, excluded competitor identity, Creative Recipe construction |
| 生成工作室 | plan compilation, quality policy, route selection explanation, candidate progress, product-identity anchors, QC elimination, escalation and cost delta |
| 本地化工作室 | OCR blocks, protected tokens, translation variants, erase/render, overflow repair, OCR readback, product-region difference |
| 审核室 | QC evidence availability, failed/risky regions, version lineage, reviewer action impact, revision progress |
| 任务详情 | complete ordered event history, stage graph, attempts, bindings, costs, artifacts, evidence, retries, errors, and recovery |
| 程序化视频流程 | asset precheck, template binding, scene assembly, render/encode, subtitle checks, video QC, final artifact readiness |

The table is a minimum coverage contract, not a fixed screen layout.

## 15. Chinese interaction-log and milestone examples

The examples below define tone and information shape, not fixed final wording. Customer copy should be concise, factual, and visually scannable.

| Event class | Chinese customer example | Required linkage |
|---|---|---|
| Acknowledgement | 已创建竞品分析任务，正在校验 12 张图片 | Job and input count |
| Observation | 已识别图片用途：主图 1 张、场景图 4 张、卖点图 5 张、参数图 2 张 | Classified image set |
| Evidence | 检测到 7 处竞品 Logo 或型号区域，已加入排除清单 | OCR boxes / image regions |
| Decision | 已保留构图与光线语言，不继承竞品商品结构和包装文字 | Creative Recipe decision record |
| Artifact | 创意方案草案已生成，可提前查看已完成部分 | Draft artifact version |
| Warning | 第 6 张图片存在佩戴遮挡，商品结构判断置信度较低 | Risk region and review action |
| Retry | 第 1 次生成未通过商品结构校验，正在重新生成 | Failed Attempt and QC evidence |
| Fallback | 本地编辑结果未达到商品保真要求，准备切换高保真线路；预计增加费用 ¥3.20 | Route change and cost delta |
| Localization | 已识别 18 个文字块，其中 4 个品牌/型号字段已锁定保护 | Localization Scene blocks |
| Hard failure | 型号文字与 Product Master 不一致，当前结果已阻止导出 | Blocking QC result and safe next action |
| Milestone | 竞品视觉结构提取完成：3 组构图模式、5 组光线特征、7 个禁止继承元素 | Stage summary and evidence set |
| Completion | 任务已完成：生成 6 个候选结果，4 个通过自动检查，等待人工审核 | Final snapshot |

Copy rules:

- lead with the business meaning, then show technical identifiers as secondary information;
- use numbers, counts, elapsed time, and evidence to create capability perception;
- do not use empty praise such as “AI 正在施展魔法”;
- do not translate literal model IDs, hashes, SKUs, or provider request IDs, but explain their role in Chinese;
- warnings and failures must state impact and next action, not merely an error code;
- completed milestones may use restrained transition emphasis, while ordinary heartbeat events remain visually quiet.
