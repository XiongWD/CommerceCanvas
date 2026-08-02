# CommerceCanvas Product Glossary


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


## 1. Naming rules

- Use the canonical term in APIs, database design, documents, and UI copy unless a user-facing translation is explicitly defined.
- Do not use “generation result,” “file,” “task,” and “asset” interchangeably.
- Do not call an experimental provider route a product capability.
- Avoid the ambiguous term “template” when the object is specifically a Recipe, Prompt Template, Video Template, or Export Template.
- Customer-facing navigation, status, analysis traces, warnings, error guidance, milestones, and actions use Simplified Chinese. Internal English codes are implementation identifiers, not customer copy.
- Use “分析轨迹” for customer-visible structured execution narratives; reserve “诊断日志” for administrator/developer logs.

## 2. Canonical terms

| Term | Definition | Notes / prohibited ambiguity |
|---|---|---|
| CommerceCanvas | Product name for the cross-border commerce visual workbench | Not a generic image generator |
| Workspace | Project-level area containing products, jobs, assets, reviews, and settings | May map to a studio project in MVP |
| Product Master | Versioned authority for one SKU’s facts, references, identity features, and change constraints | Never replace with “one reference image” |
| Product Master Version | Immutable snapshot used by a job or artifact | Existing assets remain bound to the original version |
| SKU | Studio’s product stock-keeping identifier | May be protected from translation |
| Product Identity | Visual and factual properties that distinguish the intended product from another product/model | Includes geometry, parts, color, logo, text, and key details |
| Allowed Change | Product attribute that a workflow may alter, such as background or approved color variant | Must be explicit |
| Prohibited Change | Product attribute that must remain unchanged, such as structure, port count, logo geometry, or model number | Violations can be hard QC failures |
| Recipe | Versioned platform asset specification with slots, layout, text, generation, QC, naming, and export rules | Not merely a prompt |
| Recipe Slot | One required or optional output position, such as Amazon main image or Shopify banner | Has its own constraints |
| Creative Recipe | Structured visual plan extracted from references, excluding competitor identity and unsupported claims | Used for same-category borrowing |
| Platform Recipe | Recipe tied to Amazon, Shopify, or TikTok Shop output requirements | Rules are versioned |
| Quality Policy | Customer-selected intent: 快速、均衡、高质量、商品保真优先、文字准确优先 | Internal codes may remain English; customer does not choose model ID |
| Provider | External or local service that exposes model or media-processing capabilities | Example: local ComfyUI or cloud API |
| Model | Specific model name/version used by a Provider | Administrator-visible |
| Provider Binding | Versioned mapping from a logical capability to provider, model, parameters, limits, cost, and availability | Central routing abstraction |
| Route | Ordered decision path for executing a capability, including fallback and escalation | Must be auditable |
| Fallback | Alternate binding invoked after an eligible failure | Must not be hidden |
| Escalation | Move to a higher-cost or higher-quality route based on QC or policy | Requires cost visibility |
| Job | User-visible production request covering one or more products and outputs | Contains Tasks |
| Task | Executable unit of work with inputs, binding, attempts, and state | Assigned to worker or provider |
| Attempt | One execution of a Task against a specific binding and parameter snapshot | Retries create new attempts |
| Artifact | Media or structured output created by a Task | Has provenance and lifecycle state |
| Asset | Artifact accepted into the workspace’s managed product-media collection | Not every temporary artifact is an asset |
| Source Artifact | User-uploaded or imported input | Immutable after ingestion; replacements create versions |
| Derived Artifact | Output created from one or more source/derived artifacts | Stores lineage |
| Final Asset | Approved artifact eligible for export | Must satisfy required QC and review |
| Artifact Version | Immutable revision of a logical asset | Supports comparison and rollback |
| Review | Human decision process for an artifact or asset set | Approve, reject, request revision |
| Review Room | Internal/documentation alias for the customer-facing 审核室 used for comparison, comments, decisions, and version history | Customer UI label is Chinese |
| QC | Quality control evidence and decisions attached to an artifact | Includes L0–L3 |
| L0 QC | Deterministic programmatic checks such as dimensions, corruption, blur, and color space | Can create hard failures |
| L1 QC | Specialized vision/OCR/detection/segmentation/embedding checks | Thresholds require calibration |
| L2 QC | VLM semantic review for plausibility and cross-modal conflicts | Cannot override L0/L1 hard failures |
| L3 QC | Human review | Mandatory for selected risk classes |
| Hard Failure | QC condition that blocks release until corrected | No VLM override |
| Warning | Non-blocking issue requiring attention or review | May be accepted by authorized human |
| Localization Scene | Structured representation of image, protected regions, text blocks, translations, fonts, and layout outputs | Release localization works on this structure |
| Text Block | One OCR/layout unit with source, translations, region, style, protection, and overflow state | Versioned |
| Protected Token | Brand, SKU, model, number, unit, or legal token that must not be altered | Mismatch can be hard failure |
| OCR Readback | OCR performed on rendered output to verify actual displayed text | Compared to expected text |
| Product Region Difference Check | Comparison restricted to product mask/regions to detect unintended visual change during localization | Thresholds are category/workflow specific |
| Same-Category Borrowing | Reuse of visual language from a different product in the same category while rebuilding with own Product Master | Formal MVP capability |
| Same-Product Migration | Transfer of scene/layout from a substantially identical OEM product while replacing brand/text and preserving own product truth | Beta only |
| Programmatic Video | Deterministic video assembled from approved assets, motion templates, text, and audio using Remotion/ffmpeg | Formal MVP video capability |
| Generative Video | Model-generated motion or footage from images/prompts/references | Experimental in MVP |
| Export Package | Approved files organized and named for a target platform | Export does not publish |
| Cost Estimate | Pre-run estimate based on binding and planned calls | Must be labeled as estimate |
| Actual Cost | Recorded provider charge or locally calculated resource cost for completed attempts | Immutable audit data |
| Live Intelligence Layer / 实时智能演算层 | Cross-page experience that turns real execution events into Chinese progress, findings, evidence, risk, actions, and progressive results | Formal MVP capability, not decorative animation |
| Interaction Event / 交互事件 | Ordered structured event emitted from authoritative execution state for customer presentation | Has stable internal code and Chinese presentation fields |
| Analysis Trace / 分析轨迹 | Customer-visible sequence of observations, evidence, decisions, warnings, actions, artifacts, retries, and outcomes | Not raw chain-of-thought or developer logs |
| Evidence Visualization / 证据可视化 | Inspectable overlays or linked media such as masks, OCR boxes, difference maps, key-region matches, and QC crops | Supports trust through evidence |
| Milestone Reveal / 里程碑揭示 | Restrained visual acknowledgement when a meaningful stage produces a useful result | Not used for every minor event |
| Persistent Task Surface / 持续任务面板 | Bottom cross-page task surface with compact, expanded, and full-detail modes | Preserves task presence during navigation |
| SSE | Server-Sent Events transport used for ordered server-to-browser execution events | Commands remain HTTP actions; polling may be a degraded fallback |
| Event Replay / 事件重放 | Recovery of ordered persisted events after disconnect using last event ID/sequence and a current snapshot | Prevents lost or duplicated narrative |
| Determinate Progress / 确定进度 | Percentage based on a known completed/total denominator | May display percentage |
| Indeterminate Progress / 非确定进度 | Active work without a valid denominator | Displays stage, elapsed time, completed facts, and activity—not invented percentage |
| Customer-visible Interaction Log / 客户交互日志 | Productized Chinese execution narrative shown to customers | Must be safe, concise, and evidence-linked |
| Raw Diagnostic Log / 原始诊断日志 | Worker/provider/developer output for troubleshooting | Redacted, access-controlled, not ordinary UI |
| Presentation Mapper / 展示映射器 | Converts stable internal event codes and payloads into Chinese titles, summaries, severity, evidence links, and actions | Prevents workers from owning UI copy |
| 工作队列 | Chinese customer-facing name for Work Queue | English alias remains documentation-only |
| 商品工作区 | Chinese customer-facing name for Product Workspace | English alias remains documentation-only |
| 竞品套图分析 | Chinese customer-facing name for Competitor Set Analysis | English alias remains documentation-only |
| 生成工作室 | Chinese customer-facing name for Generate Studio | English alias remains documentation-only |
| 本地化工作室 | Chinese customer-facing name for Localization Studio | English alias remains documentation-only |
| 审核室 | Chinese customer-facing name for Review Room | English alias remains documentation-only |
| 任务详情 | Chinese customer-facing name for Job Detail | English alias remains documentation-only |
| 快速 / 均衡 / 高质量 / 商品保真优先 / 文字准确优先 | Customer-facing Chinese quality-policy labels | Internal codes may be `fast`, `balanced`, `high_quality`, `product_fidelity_first`, `text_accuracy_first` |
| G0–G5 | Project gates from scope freeze through studio trial | Gate completion requires evidence |

## 3. Decision labels

| Label | Use |
|---|---|
| `FROZEN` | Product or architecture decision approved for implementation |
| `VALIDATION_REQUIRED` | Candidate method, model, or threshold awaiting G1 evidence |
| `NON_BLOCKING_EXPERIMENT` | Beta experiment that cannot block MVP |
| `OUT_OF_SCOPE` | Explicitly excluded from MVP |
