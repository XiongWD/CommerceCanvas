# Acceptance Metrics and Release Gates


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


## 1. Metric policy

The metric definitions are frozen; most numeric thresholds are provisional until G1 calibration. A threshold must not be silently relaxed after holdout results. Any change requires a documented rationale and re-evaluation.

## 2. Metric definitions

| Metric | Definition |
|---|---|
| First-pass approval rate | Approved without regeneration or manual image repair ÷ evaluated outputs |
| Two-attempt approval rate | Approved within at most two generation attempts ÷ evaluated outputs |
| Product identity hard-fail rate | Outputs judged to depict the wrong product/model or violate a prohibited identity feature ÷ outputs |
| Competitor leakage rate | Outputs containing competitor logo, model, packaging identity, or unsupported unique feature ÷ outputs |
| Critical text error rate | Incorrect brand, model, number, unit, mandatory warning, or product fact ÷ rendered critical blocks |
| Non-critical text error rate | Incorrect or unacceptable marketing/secondary copy ÷ rendered non-critical blocks |
| OCR protected-token recall | Correctly detected protected tokens ÷ expected protected tokens |
| Product-region unintended-change rate | Localization outputs with material product-region change ÷ localization outputs |
| Manual repair rate | Outputs needing external manual editing before approval ÷ outputs |
| Job terminal-failure rate | Jobs that cannot reach completed/partially completed state after policy retries ÷ jobs |
| Recovery correctness | Recovery scenarios that finish without duplicated final artifacts, lost state, or duplicate charge ÷ scenarios |
| Cost estimate variance | absolute(estimate − actual) ÷ actual |
| Live stage coverage | Required workflow stages that emit at least one valid customer event ÷ required stages |
| Evidence-linked finding rate | Customer-visible findings/warnings with inspectable artifact/region/evidence when evidence exists ÷ eligible findings/warnings |
| Time to first acknowledgement | Time from accepted command to first visible Chinese task acknowledgement |
| Time to first meaningful event | Time from accepted command to first stage/finding/evidence event beyond a generic acknowledgement |
| SSE replay correctness | Reconnect scenarios restored with correct ordered events and final snapshot, without gaps/duplicates/stale state ÷ tested scenarios |
| Chinese customer-copy coverage | Customer-visible strings resolved to approved Simplified Chinese ÷ discovered customer-visible strings |
| Raw-log leakage count | Unredacted stack traces, provider payloads, secrets, raw English debug messages, or hidden reasoning shown in ordinary customer UI |
| Perceived professional capability | Moderated Chinese-user rating of whether the workflow appears professional, capable, and worth continued exploration |
| Interaction trust | Moderated rating of whether live claims appear credible and sufficiently evidenced |

## 3. Hard release gates

These are required for every release candidate unless explicitly marked category-exempt:

| ID | Gate | Threshold | Status |
|---|---|---:|---|
| AM-H-001 | Corrupt or unreadable final files | 0 | `FROZEN` |
| AM-H-002 | Wrong output dimensions/aspect where Recipe marks them mandatory | 0 | `FROZEN` |
| AM-H-003 | Missing required Product Master version or provenance | 0 | `FROZEN` |
| AM-H-004 | Unresolved L0 hard failure | 0 | `FROZEN` |
| AM-H-005 | Critical protected-token mismatch in release localization | 0 | `FROZEN` |
| AM-H-006 | Final asset exported without required human approval | 0 | `FROZEN` |
| AM-H-007 | Hidden provider fallback or unrecorded attempt | 0 | `FROZEN` |
| AM-H-008 | Duplicate final artifact caused by retry/recovery | 0 in recovery test set | `FROZEN` |
| AM-H-009 | Customer-visible navigation/status/analysis trace/warning/error/action without approved Simplified-Chinese presentation | 0 in release-string audit | `FROZEN` |
| AM-H-010 | Fabricated percentage, fabricated analysis event, or fake reasoning presented as actual execution | 0 | `FROZEN` |
| AM-H-011 | Hidden retry, provider fallback, material cost increase, or required human intervention | 0 in required scenario set | `FROZEN` |
| AM-H-012 | Required long-running G3/G4 workflow with no SSE stage visibility | 0 | `FROZEN` |
| AM-H-013 | Raw diagnostic/secret/stack-trace leakage into ordinary customer interaction log | 0 | `FROZEN` |

## 4. Provisional G1/G5 targets

These targets are deliberately conservative starting points and must be validated rather than assumed.

### 4.1 Original and same-category image production

| Metric | G1 viability target | G5 studio target | Status |
|---|---:|---:|---|
| First-pass approval rate | ≥ 50% on holdout | ≥ 60% on supported SKU classes | `VALIDATION_REQUIRED` |
| Two-attempt approval rate | ≥ 70% | ≥ 80% | `VALIDATION_REQUIRED` |
| Product identity hard-fail rate | ≤ 8% | ≤ 5% | `VALIDATION_REQUIRED` |
| Competitor leakage rate | ≤ 2% | ≤ 1% | `VALIDATION_REQUIRED` |
| Manual repair rate | report only | ≤ 25% | `VALIDATION_REQUIRED` |

A route failing the overall target may still be approved for a narrower, explicitly defined category or difficulty class.

### 4.2 Same-product migration Beta

No threshold blocks MVP release. Promotion into Beta requires separate results by tier:

| Tier | Minimum holdout approval signal | Interpretation |
|---|---:|---|
| A — Easy | ≥ 60% approved within two attempts | May be exposed as limited Beta |
| B — Moderate | ≥ 35% approved within two attempts | Manual-heavy Beta only |
| C — Hard | Report only; no minimum | Research/unsupported unless evidence is unexpectedly strong |

Any product identity hard failure or text/logo corruption remains a failed sample even when the image is aesthetically strong.

### 4.3 Localization

| Metric | G1 viability target | G5 studio target | Status |
|---|---:|---:|---|
| Protected-token OCR recall | ≥ 99% | 100% on final release set | `VALIDATION_REQUIRED` |
| Critical text error rate | ≤ 1% before human review | 0 after required review | `VALIDATION_REQUIRED` / final hard gate |
| Non-critical first-render acceptance | ≥ 85% | ≥ 90% | `VALIDATION_REQUIRED` |
| Layout overflow/clipping | ≤ 5% first render | 0 final | `VALIDATION_REQUIRED` / final hard gate |
| Material product-region change | ≤ 2% first render | 0 final | `VALIDATION_REQUIRED` / final hard gate |

### 4.4 Programmatic video

| Metric | G1 viability target | G5 studio target | Status |
|---|---:|---:|---|
| Encode and playback success | ≥ 98% | 100% final set | `VALIDATION_REQUIRED` |
| Required duration/aspect compliance | ≥ 98% | 100% final set | `VALIDATION_REQUIRED` |
| Subtitle/text overflow | ≤ 5% first render | 0 final | `VALIDATION_REQUIRED` |
| Approved-template first-pass rate | ≥ 80% | ≥ 90% | `VALIDATION_REQUIRED` |

### 4.5 Operations and cost

| Metric | G5 target | Status |
|---|---:|---|
| Recovery correctness across required fault tests | 100% | `VALIDATION_REQUIRED` implementation |
| Job terminal-failure rate excluding invalid user input | ≤ 3% | `VALIDATION_REQUIRED` |
| Provider cost reconciliation coverage | 100% paid attempts | `FROZEN` |
| Cost estimate median variance | ≤ 15% | `VALIDATION_REQUIRED` |
| Cost estimate 90th-percentile variance | ≤ 30% | `VALIDATION_REQUIRED` |
| Audit record coverage for final assets | 100% | `FROZEN` |


### 4.6 Live Intelligence and Chinese interaction

| Metric | G2 prototype target | G5 studio target | Status |
|---|---:|---:|---|
| Chinese customer-copy coverage | 100% audited prototype flows | 100% release candidate | `FROZEN` |
| Required live stage coverage | 100% of prototype core stages | 100% of supported workflows | `FROZEN` |
| SSE replay correctness | 100% required reconnect scenarios | 100% required fault scenarios | `VALIDATION_REQUIRED` implementation |
| Evidence-linked finding rate | ≥ 90% where machine evidence exists | ≥ 95% | `VALIDATION_REQUIRED` |
| Time to first visible acknowledgement | ≤ 1 s in controlled environment | p95 ≤ 1.5 s excluding client network outage | `VALIDATION_REQUIRED` |
| Silent interval during active work | no unexplained interval > 15 s; heartbeat may maintain connection but must not simulate progress | same | `VALIDATION_REQUIRED` |
| Correct understanding of current stage and next action | ≥ 80% moderated task responses | ≥ 90% for warning/failure/intervention cases | `VALIDATION_REQUIRED` |
| Professional-capability rating | median ≥ 4/5 | median ≥ 4/5 | `VALIDATION_REQUIRED` |
| Interaction-trust rating | median ≥ 4/5 | median ≥ 4/5 | `VALIDATION_REQUIRED` |
| Reports of “fake/cheap hacker effect” | < 15% of participants | < 10% | `VALIDATION_REQUIRED` |
| Raw-log leakage | 0 | 0 | `FROZEN` |

Perception metrics are secondary to correctness. A visually impressive design fails if it reduces comprehension, hides risk/cost, or invents execution facts.

## 5. Human review rubric

Reviewers score each output on:

- product identity;
- product facts and text;
- composition and platform suitability;
- visual defects;
- competitor leakage;
- repair effort;
- final decision: approve, warning, revision, hard fail;
- for interaction reviews: current-stage comprehension, evidence discovery, trust, professional capability, distraction, and whether any display felt fabricated.

Aesthetic preference cannot override identity or critical-text failure.

## 6. Threshold calibration rule

For L1 identity metrics, do not freeze one global DINO/SigLIP/LPIPS/contour/ΔE threshold during G0. G1 must produce category-specific ROC/error analysis and select thresholds based on acceptable false-accept risk. False accepts are more costly than false rejects for product identity.

## 7. Reporting requirement

Every metric report must include sample count, category, difficulty, provider/model version, confidence interval where meaningful, and exclusions. A percentage without its denominator is not acceptable evidence. Interaction reports must additionally include scenario, event-trace revision, Chinese-copy revision, prototype revision, participant profile, and the exact evidence shown.
