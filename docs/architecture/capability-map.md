# CommerceCanvas Capability Map


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

This map defines product capabilities and ownership boundaries without prematurely freezing implementation details. It is not a microservice decomposition.

## 2. Capability layers

```text
Experience Layer
  工作队列 (Work Queue) | 商品工作区 (Product Workspace) | 竞品套图分析 (Competitor Analysis) | 生成工作室 (Generate Studio)
  本地化工作室 (Localization Studio) | 审核室 (Review Room) | 任务详情 (Job Detail) | 管理设置 (Admin Routing)
  Live Intelligence Layer | Persistent Task Surface | Evidence Visualization

Application Capability Layer
  Product Master | Recipe Management | Production Planning | Localization
  Generation & Editing | Programmatic Video | QC | Review & Versioning
  Export | Cost & Usage | Job Orchestration | Event Presentation & Replay

Execution Layer
  Image Workers | Video Workers | OCR/Translation Workers | QC Workers
  External Provider Adapters | Local GPU Adapters

Data & Storage Layer
  PostgreSQL system of record | Redis/queue coordination
  Local working storage | R2/S3 object storage | Audit/event records
```

## 3. Capability inventory

| ID | Capability | Responsibility | Owns authoritative data? | MVP class |
|---|---|---|---:|---|
| CAP-001 | Workspace Context | Organize products, jobs, assets, members, and settings | Yes | `FROZEN` |
| CAP-010 | Product Master | SKU facts, references, identity features, constraints, versions | Yes | `FROZEN` |
| CAP-020 | Recipe Management | Platform slots, layout rules, generation/QC/export policies, versions | Yes | `FROZEN` |
| CAP-030 | Competitor Set Analysis | Classify image purpose and extract reusable visual structure | Yes, for analysis/recipe outputs | `FROZEN` product / `VALIDATION_REQUIRED` implementation |
| CAP-040 | Production Planning | Expand product + Recipe + quality policy into tasks and cost estimate | Yes | `FROZEN` |
| CAP-050 | Provider Routing | Resolve logical capability to binding, fallback, limits, and cost | Yes, binding configs | `FROZEN` abstraction / `VALIDATION_REQUIRED` routes |
| CAP-060 | Image Generation & Editing | Execute image generation, edit, background, erase, and composition tasks | No business authority; produces artifacts | Mixed |
| CAP-070 | Localization | OCR, block model, glossary, translation, erasure, deterministic rendering, readback | Yes, Localization Scene and versions | `FROZEN` |
| CAP-080 | Programmatic Video | Assemble approved assets into template-driven clips | Owns video project/template records | `FROZEN` |
| CAP-090 | Generative Video | Execute experimental image/video generation routes | No; produces artifacts | `NON_BLOCKING_EXPERIMENT` |
| CAP-100 | QC Policy | Define checks, severities, thresholds, required evidence, and gates | Yes | `FROZEN` |
| CAP-110 | QC Execution | Run L0/L1/L2 checks and attach results to artifacts | No; produces QC evidence | `FROZEN` framework / `VALIDATION_REQUIRED` thresholds |
| CAP-120 | Review & Versioning | Human decisions, comments, comparisons, revisions, approval state | Yes | `FROZEN` |
| CAP-130 | Job Orchestration | Job/task/attempt states, dependencies, retries, leases, progress | Yes | `FROZEN` |
| CAP-135 | Live Intelligence & Event Presentation | Ordered SSE events, replay/snapshot, Chinese presentation mapping, analysis traces, evidence linkage, milestones, and cross-page task presence | Yes for persisted event history/presentation definitions | `FROZEN` framework / `VALIDATION_REQUIRED` detailed UX |
| CAP-140 | Artifact Management | Provenance, versions, hashes, storage locations, lifecycle | Yes | `FROZEN` |
| CAP-150 | Platform Export | Validate and package approved assets with target naming/directories | Yes, export manifests | `FROZEN` |
| CAP-160 | Cost & Usage | Estimates, actual cost, provider reconciliation, per-SKU rollups | Yes | `FROZEN` |
| CAP-170 | Administration | Provider bindings, secrets references, quotas, worker status, policy | Yes | `FROZEN` |
| CAP-180 | Windows Agent | Optional local watch/sync/cache/GPU/export bridge | No business state | Post-MVP candidate |

## 4. Core relationships

```text
Product Master Version ─┐
                        ├─ Production Plan ─ Job ─ Task ─ Attempt ─ Artifact Version
Recipe Version ─────────┘                                      │
Quality Policy ─────────────────────────────────────────────────┤
Provider Binding Snapshot ──────────────────────────────────────┤
                                                               ├─ Interaction Events / Chinese Presentation
                                                               ├─ QC Evidence
Localization Scene Version ─────────────────────────────────────┤
                                                               ├─ Review Decision
                                                               └─ Export Manifest
```

## 5. System-of-record rules

- PostgreSQL owns business state, version relationships, decisions, policies, and audit metadata.
- Object storage owns media bytes and large structured payloads; object existence alone does not establish business state.
- Redis/queue owns transient coordination, not authoritative job history.
- Workers own temporary execution files only.
- Provider responses are evidence attached to Attempts, not direct state authorities.

## 6. Boundary rules

1. Product Master does not directly call providers.
2. UI does not embed provider-specific orchestration logic.
3. Workers do not approve assets or mutate Product Master.
4. QC execution emits evidence; QC policy determines severity and gate behavior.
5. Review decisions are human/application actions, not worker actions.
6. Export reads only approved asset versions and produces an immutable manifest.
7. Experimental capabilities remain distinguishable through route status and review policy.
8. Job Orchestration emits authoritative state/event facts; CAP-135 maps them to customer-safe Chinese presentation. Workers do not own final customer copy.
9. Business-significant events are persisted and replayable; transient heartbeats and decorative animation state are not business truth.
10. The Live Intelligence Layer may increase perceived sophistication only by exposing real progress, evidence, and decisions; it must not fabricate analysis or chain-of-thought.

## 7. G3 minimum capability slice

Only these capabilities are required in the first vertical slice:

- CAP-010 Product Master;
- CAP-020 one Amazon scene Recipe;
- CAP-040 minimal production planning;
- CAP-050 one validated image route;
- CAP-060 one image execution path;
- CAP-100/110 L0 QC only;
- CAP-120 human approve/reject;
- CAP-130 minimal observable job/task/attempt state;
- CAP-135 SSE event stream, Chinese stage/trace mapping, reconnect replay, and persistent task surface;
- CAP-140 artifact provenance;
- CAP-150 Amazon export.

Everything else must justify itself as a dependency of this slice.

## 8. Cross-page presentation ownership

| Page | Capability facts consumed | Required customer presentation |
|---|---|---|
| 工作队列 | CAP-130, CAP-160, CAP-170 | queue/worker/attempt state, retry, cost, intervention |
| 商品工作区 | CAP-010, CAP-140 | ingest, reference checks, identity-feature evidence |
| 竞品套图分析 | CAP-030, CAP-070, CAP-100/110 | role classification, OCR/logo evidence, visual patterns, exclusions, recipe draft |
| 生成工作室 | CAP-040/050/060/100/110 | planning, route rationale, candidate/artifact creation, QC, fallback, cost |
| 本地化工作室 | CAP-070/100/110 | OCR, protection, translation, erase/render, overflow, readback, product diff |
| 审核室 | CAP-110/120/140 | evidence availability, risk regions, versions, decisions, revision status |
| 任务详情 | CAP-130/135/140/160 | full ordered history, attempts, evidence, costs, errors, recovery |

CAP-135 owns consistency of event semantics and Chinese copy contracts; individual pages own layout emphasis only.
