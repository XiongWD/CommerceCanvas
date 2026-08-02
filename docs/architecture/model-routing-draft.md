# Model and Provider Routing Draft


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


## 1. Scope

This document freezes the routing abstraction and user-facing policies. Specific model performance and final provider order remain hypotheses until G1 evidence.

## 2. User-facing quality policies

| Policy | User intent | Routing bias | Status |
|---|---|---|---|
| 快速 (`fast`) | Lowest practical latency and cost for previews/candidates | local/low-cost, limited retries | `FROZEN` Chinese label and semantics |
| 均衡 (`balanced`) | Default compromise among cost, latency, and pass rate | best validated general route | `FROZEN` Chinese label and semantics |
| 高质量 (`high_quality`) | Higher-cost route and more QC/escalation | quality over latency | `FROZEN` Chinese label and semantics |
| 商品保真优先 (`product_fidelity_first`) | Minimize structure, color, logo, and detail drift | multi-reference, conservative QC, escalation | `FROZEN` Chinese label / `VALIDATION_REQUIRED` mapping |
| 文字准确优先 (`text_accuracy_first`) | Protect and deterministically render text | OCR/translation/layout pipeline, not full-image generation | `FROZEN` Chinese label and semantics |

Before execution, show estimated cost, estimated call count, quality tier, and whether cloud providers receive assets. After execution, store the exact binding and attempt history.

## 3. Provider Binding contract

A binding must contain at least:

- binding ID and revision;
- logical capability;
- provider and model/version identifier;
- enabled/disabled/experimental status;
- supported input/output modes;
- parameter schema and defaults;
- size, file, rate, and concurrency limits;
- data-location/privacy classification;
- cost formula and currency;
- timeout, retry eligibility, and idempotency support;
- health status;
- fallback eligibility;
- required QC policy;
- effective dates.

Jobs store a binding snapshot so later changes do not rewrite historical truth.

## 4. Routing decision inputs

```text
Task type
+ Product Master constraints
+ Recipe slot
+ quality policy
+ category and difficulty
+ cloud/local permission
+ budget/cost cap
+ provider health/quota
+ prior attempt and QC result
→ binding + parameters + fallback policy
```

## 5. Image routing draft

| Task | Initial candidate | Escalation / backup | Intended role | Classification |
|---|---|---|---|---|
| Bounded local product edit | Qwen-Image-Edit-2511 | no automatic expensive fallback unless policy allows | low-cost local editing | `VALIDATION_REQUIRED` |
| Same-product migration | Qwen-Image-Edit-2511 | Wan2.7-Image-Pro; GPT Image 2 for selected hard/high-value cases | product fidelity and multi-reference | `NON_BLOCKING_EXPERIMENT` route |
| Same-category set reconstruction | Wan2.7-Image / Wan2.7-Image-Pro | Qwen-Image 2.0 Pro | suite consistency and visual-language reuse | `VALIDATION_REQUIRED` |
| Batch backgrounds/candidates | FLUX.2 Klein / FLUX.2 Pro | Wan2.7-Image | fast, cost-sensitive candidate production | `VALIDATION_REQUIRED` |
| Text-dense base image | Qwen-Image 3.0 Pro / GPT Image 2 | deterministic text pipeline remains mandatory | complex layout/background generation | `VALIDATION_REQUIRED` |
| Fast image translation | Qwen-MT-Image | release path on failure or finalization | preview-only candidate | `NON_BLOCKING_EXPERIMENT` |
| Release image localization | PaddleOCR + Qwen-MT-Plus + deterministic renderer | manual correction/re-render | text-only change | `FROZEN` architecture / `VALIDATION_REQUIRED` thresholds |
| Poster/banner/vector/icon | Recraft V4.1 | Qwen-Image 3.0 Pro | later marketing design | `OUT_OF_SCOPE` as MVP blocker |
| Simple text/object removal | OpenCV/programmatic reconstruction | BrushNet; FLUX Erase | least generative method first | `VALIDATION_REQUIRED` |

Model names above are project candidates, not verified capability claims.

## 6. Video routing draft

| Task | Initial candidate | Backup | Classification |
|---|---|---|---|
| Programmatic product video | Remotion + ffmpeg | none required | `FROZEN` MVP capability |
| TikTok generative product clip | Seedance 2.0 | Kling 3.0 Omni if paired evidence justifies | `NON_BLOCKING_EXPERIMENT` |
| Product-consistency/high-interaction video | Kling 3.0 Omni | Seedance 2.0 | `NON_BLOCKING_EXPERIMENT` |
| Low-cost first-frame/light motion | Wan2.7 I2V | none | `NON_BLOCKING_EXPERIMENT` |
| Premium brand ad | Veo 3.1 | Kling 3.0 | `OUT_OF_SCOPE` for MVP core |
| Style/action reference editing | Seedance 2.0 / Wan2.7 VideoEdit | Runway | `NON_BLOCKING_EXPERIMENT` |

## 7. Fallback rules

A fallback may occur only when:

- the task failure is classified as retry/fallback eligible;
- budget and cloud permission allow it;
- the fallback is declared in the route version;
- the user-visible estimate included the possible escalation or the system requests approval for material cost increase;
- a new Attempt record is created;
- the original failure and QC evidence are retained;
- the customer receives a Chinese live event explaining the retry/fallback, reason category, expected cost/latency impact, and whether approval is required.

Hard product-identity failure does not automatically justify repeated costly generation. The route may stop and request human intervention.

## 8. Model selection visibility

- Ordinary users see Chinese quality-policy labels, cost, cloud notice, route rationale at a business level, live stage/progress, fallback/cost changes, QC outcome, and required action.
- Ordinary users do not receive unexplained provider/model jargon; when a model ID is shown, a Chinese explanation of its role is required.
- Administrators use a Chinese UI but can inspect and override provider/model binding where authorized; literal IDs remain unchanged.
- Reviewers can inspect the actual model/version and route history for an artifact through Chinese labels and structured evidence.
- Exports do not need to expose model names unless policy requires it, but internal audit always retains them.

## 9. Routing status transitions

```text
candidate
→ G1 tested
→ restricted (specific task/category/difficulty)
→ production default or production optional
→ degraded/disabled/deprecated
```

No route may move directly from candidate to production default without holdout evidence and an approved decision record.

## 10. G1 decisions required

- Which edit operations are safe for Qwen-Image-Edit-2511?
- Does Wan2.7 Image materially outperform alternatives for same-category suites?
- Which difficulty tiers, if any, justify same-product migration Beta?
- Are low-cost FLUX candidates useful after product insertion/QC costs are included?
- Is Qwen-MT-Image preview-only or unsuitable?
- Does Kling provide enough improvement over Seedance to justify integration cost?
- What category-specific thresholds trigger escalation or human review?

## 11. Routing-event presentation contract

Routing emits business-significant events for:

- production plan compiled;
- quality policy resolved;
- initial route selected with Chinese business rationale;
- cloud processing/data-location disclosure;
- provider request accepted or queued;
- retry with reason and attempt number;
- fallback/escalation with cost and latency delta;
- route stopped for product-identity risk or human intervention;
- actual model/version recorded after completion.

The Live Intelligence Layer must not reveal hidden chain-of-thought. It presents structured decision factors and evidence already stored in the routing/attempt record.
