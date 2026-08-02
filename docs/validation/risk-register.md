# G0 Risk Register


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


## 1. Scoring

- Likelihood: 1 rare, 2 unlikely, 3 possible, 4 likely, 5 very likely.
- Impact: 1 minor, 2 limited, 3 material, 4 severe, 5 existential/release-blocking.
- Score = likelihood × impact. Scores 15–25 require active mitigation before the affected gate.

## 2. Risks

| ID | Risk | L | I | Score | Trigger / evidence | Mitigation | Gate / owner | Status |
|---|---|---:|---:|---:|---|---|---|---|
| R-001 | Product structure drifts during generation/editing | 4 | 5 | 20 | wrong geometry, parts, ports, proportions | multi-reference Product Master; category QC; escalation; mandatory review | G1/G4 / Visual Lead | Open |
| R-002 | Same-product migration appears plausible but depicts another variant | 4 | 5 | 20 | identity hard fails hidden by aesthetics | Beta-only; difficulty tiers; key-region matching; no universal claim | G1 / Product+QC | Open |
| R-003 | Localization redraws or damages the product | 3 | 5 | 15 | material product-region differences | deterministic release path; masks; product-region diff; hard gate | G1/G4 / Localization | Open |
| R-004 | Brand/model/number/unit translation errors | 3 | 5 | 15 | protected token mismatch | glossary and hard protection; OCR readback; final zero-tolerance gate | G1/G4 / Localization | Open |
| R-005 | German text expansion causes overflow or illegible layout | 4 | 4 | 16 | clipping, tiny font, poor hierarchy | short/marketing variants; layout solver; review thresholds | G1 / Design+Localization | Open |
| R-006 | OCR misses stylized, curved, low-contrast, or perspective text | 4 | 4 | 16 | low protected-token recall | confidence routing; alternate preprocessing/OCR; human correction | G1 / Localization | Open |
| R-007 | L1 identity QC has high false-accept rate | 3 | 5 | 15 | wrong product passes automatically | category thresholds; conservative hard gates; human review | G1 / QC | Open |
| R-008 | L1 identity QC has high false-reject rate | 4 | 3 | 12 | excessive manual review/retries | warning bands; category calibration; reason codes | G1/G5 / QC | Open |
| R-009 | VLM gives confident but incorrect QC conclusions | 4 | 4 | 16 | inconsistent or unsupported pass/fail | VLM non-authority; structured questions; evidence display; human resolution | G1/G4 / QC | Open |
| R-010 | Provider/model names, versions, prices, or availability change | 4 | 4 | 16 | route unavailable or cost spike | Provider Binding indirection; health checks; version snapshots; fallbacks | G2/G4 / Platform | Open |
| R-011 | External API transmits confidential product assets | 3 | 5 | 15 | unapproved cloud route or retention policy | cloud notice; route policy; provider terms review; private/local option | G0/G2 / Security | Open |
| R-012 | Retry causes duplicate charges or inconsistent artifacts | 3 | 5 | 15 | ambiguous timeout after provider accepted request | idempotency keys where supported; attempt ledger; reconciliation | G1/G4 / Platform | Open |
| R-013 | Worker loss creates orphan tasks or duplicate execution | 3 | 4 | 12 | heartbeat lost during task | leases, heartbeats, reclaim policy, immutable attempts | G1/G3 / Platform | Open |
| R-014 | Local/R2/S3 storage paths diverge from database state | 3 | 4 | 12 | missing object, stale export, untracked local file | DB authority; content hashes; upload state; reconciliation jobs | G2/G4 / Platform | Open |
| R-015 | Large uploads are unreliable over studio networks | 3 | 3 | 9 | repeated transfer failure | tus/Uppy, chunking, resume, checksums, local agent later | G2/G4 / Platform | Open |
| R-016 | Cost estimate is materially wrong | 4 | 3 | 12 | actual cost exceeds estimate | route-specific estimation; call-count plan; variance reporting | G1/G5 / FinOps | Open |
| R-017 | Competitor references create IP, trademark, or policy exposure | 3 | 5 | 15 | copied logo/layout/text/unique trade dress | prohibited-element annotations; leakage QC; legal policy; user attestation | G0/G4 / Legal+Product | Open |
| R-018 | Generated content includes unsupported product claims | 3 | 5 | 15 | copy or imagery implies false functionality | Product Master fact source; schema; claim validation; human review | G1/G4 / Product | Open |
| R-019 | Recipe rules become stale as platforms change | 4 | 3 | 12 | rejected uploads or noncompliant assets | versioned Recipes; rule source/date; admin update workflow | G2/G5 / Product Ops | Open |
| R-020 | Batch fan-out overloads providers, queue, storage, or review | 3 | 4 | 12 | rate limits, long backlog, reviewer saturation | quotas, concurrency, backpressure, cost cap, queue visibility | G2/G4 / Platform | Open |
| R-021 | Experimental route silently becomes production default | 3 | 4 | 12 | Beta artifacts exported without required review | feature flags; route status; export gate; audit tests | G2/G4 / Product+Platform | Open |
| R-022 | Model output is aesthetically strong but product-unusable | 4 | 4 | 16 | high beauty score, low identity/platform utility | task-specific rubric; product identity first; reviewer training | G1/G5 / Visual Lead | Open |
| R-023 | Source data or annotation quality invalidates benchmarks | 3 | 4 | 12 | missing views, inconsistent gold labels | dataset checklist; dual review; adjudication; holdout freeze | G1 / Validation Lead | Open |
| R-024 | Security vulnerabilities in media processing tools | 3 | 5 | 15 | malicious file, decoder exploit, command injection | sandboxing, file-type validation, patched dependencies, no shell interpolation | G2/G4 / Security | Open |
| R-025 | Scope expands before G3 vertical slice | 4 | 4 | 16 | parallel UI/platform/model work begins | scope matrix enforcement; milestone review; non-goals | G0–G3 / Product Owner | Open |
| R-026 | Long-running background work appears silent or frozen | 4 | 4 | 16 | generic spinner, no intermediate state, customer abandons or distrusts task | mandatory SSE coverage; persistent task surface; first-event and silent-interval metrics | G2/G3/G5 / Product+Platform | Open |
| R-027 | Decorative hacker effects look fake, cheap, or misleading | 3 | 4 | 12 | users notice fake code/progress or cannot connect visuals to evidence | truthful event taxonomy; evidence links; restrained motion; moderated Chinese-user tests | G2/G5 / Design | Open |
| R-028 | SSE disconnect/reconnect loses or duplicates execution history | 3 | 5 | 15 | stale stage, repeated milestone, missing fallback/terminal state | persisted events; sequence; Last-Event-ID; dedupe; authoritative snapshot | G2/G3/G5 / Platform | Open |
| R-029 | English/raw technical messages reduce comprehension and product confidence | 4 | 3 | 12 | provider errors, stack traces, mixed-language buttons/logs | Chinese presentation mapper; release string audit; raw-log isolation | G2/G4/G5 / Product+Frontend | Open |
| R-030 | High-frequency live events overload browser/server or bury important findings | 3 | 4 | 12 | UI jank, event backlog, warnings missed | event classes; coalescing; priority; performance budgets; virtualized trace | G2/G4 / Platform+Frontend | Open |
| R-031 | Live events leak secrets, prompts, signed URLs, or sensitive provider details | 3 | 5 | 15 | unredacted payload appears in customer trace | allowlisted schemas; redaction; scoped evidence links; security tests | G2/G4 / Security | Open |
| R-032 | Live UI claims progress/evidence inconsistent with authoritative state | 3 | 5 | 15 | percentage jumps, completed milestone rolls back, wrong cost/status | server-authoritative state; event versioning; snapshot reconciliation; no client invention | G2/G4 / Platform+Frontend | Open |

## 3. Top risks requiring G1 evidence

The following are priority evidence risks: R-001, R-002, R-003, R-004, R-005, R-006, R-007, R-009, R-010, R-012, R-017, R-018, R-022, R-026, R-028, R-029, R-031, and R-032.

## 4. Risk review cadence

- Review at every gate boundary.
- Update likelihood/impact using evidence, not optimism.
- A risk can close only with evidence or an explicit accepted-risk decision.
- New high-risk model/provider routes require a new or updated risk entry before production use.
