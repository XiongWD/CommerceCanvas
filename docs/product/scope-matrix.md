# MVP Scope Matrix


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


## 1. Purpose

This matrix separates product commitments from technical hypotheses, non-blocking experiments, and excluded work. It is the controlling scope reference for G0–G5 planning.

## 2. Scope classification rules

| Class | May be scheduled in MVP? | Blocks MVP release? | User-facing promise allowed? |
|---|---:|---:|---:|
| `FROZEN` | Yes | Yes, when marked Must | Yes, within documented constraints |
| `VALIDATION_REQUIRED` | G1 experiments first | Only after promoted to frozen gate | No performance promise before evidence |
| `NON_BLOCKING_EXPERIMENT` | Yes, behind flags | No | Beta/Experimental wording only |
| `OUT_OF_SCOPE` | No | No | No |

## 3. Capability matrix

| Capability | G1 validation | G3 vertical slice | G4 MVP build | G5 trial | Classification | Release note |
|---|---:|---:|---:|---:|---|---|
| Product Master create/version | Design review | Required | Required | Required | `FROZEN` | Core identity source |
| Multi-reference product upload | Basic ingest check | Required | Required | Required | `FROZEN` | Front/side/back/detail/logo/packaging |
| Amazon scene image | Model benchmark | Required | Required | Required | `FROZEN` | G3 single vertical chain |
| Amazon baseline Recipe | Rule verification | Required | Required | Required | `FROZEN` | Versioned rules |
| Shopify baseline Recipe | Rule verification | No | Required | Required | `FROZEN` | G4 |
| TikTok Shop image Recipe | Rule verification | No | Required | Required | `FROZEN` | G4 |
| 快速/均衡/高质量 routing | Cost/quality benchmark | One route only | Required | Required | `VALIDATION_REQUIRED` | Chinese labels frozen; provider mapping provisional |
| 商品保真优先 routing | Identity benchmark | Optional | Required | Required | `VALIDATION_REQUIRED` | Thresholds must be category-aware |
| 文字准确优先 routing | Localization benchmark | No | Required | Required | `VALIDATION_REQUIRED` | Deterministic release output required |
| Batch Job/Task/Artifact | Failure simulation design | Minimal | Required | Required | `FROZEN` | Observable state and retries |
| Live Intelligence Layer + SSE | Event/replay prototype | Required | Required | Required | `FROZEN` | Cross-page Chinese progress, evidence, warnings, actions, and persistent task surface |
| Simplified-Chinese customer UI/logs | Copy inventory prototype | Required | Required | Required | `FROZEN` | Includes navigation, status, analysis trace, errors, milestones, and actions |
| L0 programmatic QC | Threshold calibration | Required | Required | Required | `FROZEN` | Hard release gate |
| L1 specialized visual QC | Benchmark | No | Required | Required | `VALIDATION_REQUIRED` | Models/thresholds not frozen |
| L2 VLM semantic QC | Benchmark | No | Required | Required | `VALIDATION_REQUIRED` | Cannot override hard failure |
| Human review/version comparison | Workflow prototype | Required | Required | Required | `FROZEN` | Approval audit trail |
| Same-category visual borrowing | Benchmark | No | Required | Required | `FROZEN` product scope / `VALIDATION_REQUIRED` implementation | Formal MVP capability, quality limits evidence-based |
| Same-product competitor migration | Difficulty benchmark | No | Optional Beta | Optional | `NON_BLOCKING_EXPERIMENT` | Mandatory human review |
| zh-CN/en-US/de-DE localization | OCR/layout benchmark | No | Required | Required | `FROZEN` | Release path is deterministic |
| Fast image translation | Benchmark | No | Optional | Optional | `NON_BLOCKING_EXPERIMENT` | Cannot be used as default release path |
| Platform directory export | Contract tests | Required for Amazon | Required | Required | `FROZEN` | Approved assets only |
| Programmatic product video | Media tests | No | Required | Required | `FROZEN` | Remotion/ffmpeg |
| Seedance product video | Identity benchmark | No | Optional | Optional | `NON_BLOCKING_EXPERIMENT` | Experimental |
| Kling product-consistency video | Only if Seedance insufficient | No | Optional | Optional | `NON_BLOCKING_EXPERIMENT` | Not default P0 integration |
| Wan I2V lightweight motion | Benchmark | No | Optional | Optional | `NON_BLOCKING_EXPERIMENT` | Cost-sensitive path |
| Recraft poster/vector/icon | Optional benchmark | No | No | No | `OUT_OF_SCOPE` for MVP blocking scope | Revisit after MVP |
| Public registration/payment | No | No | No | No | `OUT_OF_SCOPE` | No public SaaS |
| Platform auto-publishing | No | No | No | No | `OUT_OF_SCOPE` | Export only |
| LoRA training | No | No | No | No | `OUT_OF_SCOPE` | No model training |
| Full nonlinear video editor | No | No | No | No | `OUT_OF_SCOPE` | Programmatic templates only |
| Full Windows desktop application | No | No | No | No | `OUT_OF_SCOPE` | Optional lightweight agent later |

## 4. Stage deliverables

### G0 — Scope freeze

- MVP PRD
- scope matrix
- non-goals
- glossary
- model-routing draft
- QC policy draft
- sample plan
- experiment matrix
- acceptance metrics
- risk register
- frozen decisions
- open decisions
- Live Intelligence/SSE scope, Chinese customer-language policy, and cross-document coverage

### G1 — Evidence, not product code

Allowed:

- experiment scripts;
- provider adapters used only for tests;
- dataset manifests;
- metrics extraction;
- comparison reports;
- raw result storage;
- non-production event-stream/replay harnesses;
- Chinese analysis-trace copy prototypes and recorded usability sessions.

Not allowed:

- production React flows;
- production FastAPI endpoints unrelated to test harnesses;
- generalized workflow orchestration;
- multi-platform UI implementation.

### G2 — UX and architecture design

Required outputs:

- information architecture;
- low- and high-fidelity core flows;
- design tokens;
- system context and container diagrams;
- data model;
- Job state machine;
- Provider Binding contract;
- QC contracts;
- Localization Scene contract;
- storage layout;
- API contract draft;
- SSE event envelope, replay, snapshot, sequence, and reconnect contract;
- page-specific event-to-UI mapping for all core workflows;
- persistent task surface and evidence-visualization prototype;
- Simplified-Chinese terminology, tone, error-copy, and interaction-log specification;
- motion/performance/accessibility rules for the Live Intelligence Layer.

### G3 — Minimal vertical slice

```text
Upload product
→ create Product Master
→ generate one Amazon scene image
→ live Chinese SSE stages and evidence throughout execution
→ L0 QC
→ human review
→ export
```

Any feature not required by this chain must be deferred unless it is infrastructure strictly necessary for the chain.

### G4 — MVP completion order

1. Product Master
2. Job/Task/Artifact
3. Live Intelligence event stream, replay, persistent task surface, and Chinese presentation mapping
4. batch background and scene production
5. same-category Creative Recipe
6. L0 QC
7. L1 specialized QC
8. review and versioning
9. release-grade localization
10. platform export
11. programmatic video
12. Seedance experiment
13. same-product migration Beta

### G5 — Studio trial

Minimum trial volume:

- 20 SKUs;
- 2 platforms;
- 2 target languages;
- 100 approved final images;
- 5 batch Jobs;
- API timeout test;
- worker offline test;
- retry and recovery test;
- cost reconciliation;
- review/rework test;
- SSE disconnect/reconnect/replay and stale-view recovery test;
- cross-page persistent task continuity test;
- Simplified-Chinese UI/log coverage audit;
- live-execution trust/professional-perception usability test with Chinese studio users.

## 5. Scope conflict rule

When a task appears in more than one class, the stricter interpretation controls. Example: same-category visual borrowing is a frozen product capability, but its model/provider implementation and performance thresholds remain validation-required. The product requirement may proceed, but no model-specific claim may be made before G1 evidence.

## 6. Live Intelligence scope boundary

The Live Intelligence Layer is a formal MVP capability and release dependency. Exact animation timing, event coalescing thresholds, and page composition remain G2 design decisions. Fake reasoning, fake progress, raw terminal output, and an English-first customer interface are not acceptable substitutes and are outside scope.
