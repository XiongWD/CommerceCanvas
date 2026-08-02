# Open Decisions Register


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

These questions are intentionally unresolved. Default assumptions are temporary controls, not decisions. Owners must close them with evidence at the specified gate.

## 2. Open product and validation decisions

| ID | Question | Evidence required | Default until closed | Due gate |
|---|---|---|---|---|
| OD-001 | Which three representative product categories form the G1 set? | failure-mode coverage, available real SKUs, rights/provenance | choose categories covering rigid reflective, text-heavy, and soft/interactive products | Before G1 dataset freeze |
| OD-002 | Which editing operations are safe for Qwen-Image-Edit-2511? | holdout results by operation and category | experimental; no broad product-fidelity claim | End G1 |
| OD-003 | What is the production route for same-category suite reconstruction? | paired model benchmark, suite consistency, cost, pass rates | no default provider/model | End G1 |
| OD-004 | Which same-product migration difficulty tiers may be exposed as Beta? | Tier A/B/C holdout results and repair effort | no supported tier | End G1 |
| OD-005 | Is Qwen-MT-Image useful for preview translation? | protected-token and product-region error benchmark | disabled in release path | End G1 |
| OD-006 | Does Kling materially improve on Seedance for product-consistency video? | paired benchmark and cost multiplier | do not integrate Kling in P0 | End G1 or defer |
| OD-007 | Which L1 identity metrics and thresholds apply by category? | ROC/error analysis with false-accept emphasis | mandatory human review; no automatic identity pass | End G1/G2 |
| OD-008 | What review sampling policy is safe after MVP? | G5 pass rates and false-accept incidents | human review required for final assets in MVP | Post-G5 |
| OD-009 | What competitor-reference legal/policy controls are required? | legal review, terms, user attestation, leakage controls | internal test data only; no broad production claim | Before G4 rollout |
| OD-010 | What exact platform Recipe rules and rule sources are used? | current platform documentation and dated verification | provisional internal Recipes; manual export review | G2 before implementation |

## 3. Open architecture decisions

| ID | Question | Options to assess | Decision criteria | Due gate |
|---|---|---|---|---|
| OD-101 | Queue and job orchestration implementation | Redis-based queue, dedicated broker, workflow engine, custom minimal scheduler | G3 simplicity, leases, retries, observability, recovery | G2 |
| OD-102 | Job/task/attempt state machine | minimal explicit state model | no ambiguous terminal states; safe retry/reconcile/cancel | G2 |
| OD-103 | Exact SSE event, replay, and snapshot contract | envelope fields, sequence scope, persistence classes, replay retention, snapshot timing, heartbeat and coalescing | correctness, recoverability, performance, security, implementation simplicity | G2 |
| OD-104 | Object-key and local-directory convention | content-addressed, entity/version paths, hybrid | audit, lifecycle, portability, cleanup | G2 |
| OD-105 | Resumable upload implementation | tus/Uppy deployment shape | LAN reliability, large files, security | G2 |
| OD-106 | Local/LAN worker authentication | scoped API tokens, mTLS, short-lived credentials | revocation, least privilege, setup burden | G2 |
| OD-107 | Provider secret management | environment, secret store, deployment-specific adapters | no secrets in DB/logs/client; workable private deploy | G2 |
| OD-108 | Artifact lifecycle and retention | retain all attempts, tiered retention, configurable cleanup | audit needs versus storage cost | G2 |
| OD-109 | Disaster recovery targets | backup cadence, RPO/RTO by deployment mode | studio tolerance and operational cost | G2 |
| OD-110 | Cost ledger representation | provider bill events, estimated local compute, currency conversion | reconciliation and per-SKU reporting | G2 |
| OD-111 | Localization Scene schema | block, region, style, translation, protection, render versions | reversible edits and deterministic rerender | G2 |
| OD-112 | Recipe schema and versioning | JSON schema + DB entities, slot inheritance | validation, admin editing, historical reproducibility | G2 |
| OD-113 | Provider Binding and route-policy schema | static config, DB-managed versioned records | audit, safe rollout, health and fallback | G2 |
| OD-114 | QC result and policy schema | check catalog, policy versions, region evidence | explainability, re-run, override governance | G2 |
| OD-115 | Review comment/annotation model | point, region, frame/timecode, asset-set comments | media review usability and version linkage | G2 |

## 4. Open UX decisions

| ID | Question | Required artifact | Due gate |
|---|---|---|---|
| OD-201 | Exact information architecture and navigation | tested low-fidelity flows | G2 |
| OD-202 | 商品工作区 canvas/inspector interaction | high-fidelity core flow | G2 |
| OD-203 | 审核室 comparison modes and annotation tools | prototype with real outputs | G2 |
| OD-204 | 本地化工作室 block editing and overflow resolution | prototype with English/German target-content cases, Chinese operating UI | G2 |
| OD-205 | 工作队列 density and failure/retry controls | prototype with batch and offline-worker states | G2 |
| OD-206 | Pre-run cost and cloud-disclosure interaction | usability test | G2 |
| OD-207 | Exact Live Intelligence composition by page | high-fidelity prototypes for all core pages using recorded real event traces | G2 |
| OD-208 | Chinese analysis-trace terminology, tone, length, and reason-code mapping | approved Chinese copy inventory and terminology review | G2 |
| OD-209 | Motion, event density, coalescing, and performance budgets | prototype profiling and moderated usability testing | G2 |
| OD-210 | Evidence-overlay interaction and fallback when evidence is unavailable | prototype with OCR, mask, difference, key-region, and no-evidence cases | G2 |
| OD-211 | Persistent task surface compact/expanded/full behavior | cross-page prototype with concurrent jobs and required intervention | G2 |
| OD-212 | Administrative diagnostic-log access and redaction | security/operations review | G2 |


## 4.1 Decisions resolved by this revision

The transport choice formerly represented by OD-103 is no longer open: SSE is frozen as the default server-to-browser execution-event transport under FD-032. OD-103 now covers only the exact schema, replay, retention, heartbeat, snapshot, and coalescing design. The customer-language choice is also closed under FD-034: Simplified Chinese is mandatory for customer-visible UI and interaction logs.

## 5. Decision closure template

Every closed decision must include:

- decision ID and date;
- selected option;
- alternatives rejected;
- evidence links;
- scope and metric impact;
- migration or compatibility impact;
- owner/approver;
- updates required in frozen decisions, PRD, routing, QC, architecture, Chinese copy definitions, interaction-event mappings, and acceptance tests.

## 6. No-assumption rule

A developer Agent must not close an open decision by implementation. When work reaches an unresolved OD, it must either use the documented temporary default or stop that branch and surface the decision explicitly.
