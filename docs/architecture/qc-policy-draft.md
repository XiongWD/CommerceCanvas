# Quality Control Policy Draft


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


## 1. Policy objective

QC protects product truth, platform validity, text accuracy, and operational integrity. It is not a single aesthetic score and cannot be delegated to one general-purpose model.

## 2. QC layers

| Layer | Mechanism | Typical checks | Authority |
|---|---|---|---|
| L0 | Deterministic code/tools | file validity, size, aspect, color, alpha, blank/duplicate, blur, exposure, safe area, encoding, duration | Can issue hard fail or warning |
| L1 | Specialized vision/OCR models and metrics | OCR, detection, segmentation, embeddings, LPIPS, contour, ΔE, logo/key-region matching | Can issue hard fail when calibrated policy says so |
| L2 | VLM semantic review | use plausibility, extra/missing parts, competitor logo, wearing/holding errors, claim-image conflict | Advisory or policy-defined fail; never overrides hard fail |
| L3 | Human review | final product, brand, platform, and business judgment | Can approve warnings; cannot erase evidence or bypass immutable hard constraints without a documented exception |

## 3. Severity model

| Severity | Meaning | Release behavior |
|---|---|---|
| INFO | Evidence or measurement only | No block |
| WARNING | Possible issue; review recommended or required by workflow | May proceed only according to policy |
| FAIL | Output does not meet current task requirement | Regenerate, repair, or reject |
| HARD_FAIL | Product truth, protected text, file integrity, policy, or security violation | Blocks approval/export |

## 4. L0 baseline checks

### Images

- readable file and allowed format;
- expected dimensions and aspect ratio;
- file size limits;
- color space and alpha-channel policy;
- blank or near-blank image;
- duplicate/near-duplicate output;
- blur/focus signal;
- over/underexposure;
- white-background coverage when required;
- product bounding-box occupancy and safe area;
- forbidden text in no-text slots;
- export naming and manifest consistency.

### Video

- readable container and codec;
- expected duration, dimensions, frame rate, and audio policy;
- decode integrity;
- black/frozen/duplicate frame checks;
- text/subtitle safe area;
- output size and platform limits.

Thresholds are `VALIDATION_REQUIRED`; the checks themselves are `FROZEN`.

## 5. L1 product identity checks

Evidence may include:

- product detection and SAM2 mask;
- DINO/SigLIP similarity against multiple Product Master references;
- mask-restricted LPIPS;
- contour/shape similarity;
- dominant and region-specific color ΔE;
- logo/model OCR;
- key-region crop matching;
- count and location of parts, ports, buttons, openings, and accessories.

No single score is sufficient. The policy should combine evidence and maintain category-specific thresholds.

## 6. Localization QC

Required checks:

1. OCR source coverage and confidence;
2. protected-token detection;
3. approved translation binding;
4. erase-region coverage;
5. deterministic text render success;
6. overflow/clipping/minimum-readable-size;
7. OCR readback against expected text;
8. number/unit/brand/model exact match;
9. product-region unintended-change check;
10. human review according to risk.

Critical protected-token mismatch is a hard failure.

## 7. Same-category competitor-reference QC

Check for:

- own Product Master identity;
- competitor logo/model/packaging leakage;
- copied unsupported unique product features;
- unsupported claim-image combinations;
- suite-level visual consistency;
- slot purpose and platform compliance.

Composition similarity alone is not a failure; competitor identity leakage is.

## 8. Same-product migration QC

- Mandatory L1 identity checks.
- Mandatory competitor-logo/model/text checks.
- Mandatory L2 semantic review.
- Mandatory L3 approval for every final Beta asset.
- Difficulty tier recorded.
- Beta output cannot be bulk auto-approved.

## 9. VLM policy

The VLM receives structured questions and relevant crops/references rather than an open-ended “is this good?” prompt. Its response must include reason codes and cited visual regions when supported.

The VLM cannot:

- override corrupt media;
- override dimensions/format failures;
- override protected-token mismatch;
- override calibrated identity hard failures;
- approve an artifact by itself where human review is mandatory.

## 10. Review requirements by risk

| Workflow | Default L3 policy |
|---|---|
| New Product Master first production | Required |
| New Recipe or provider/model version | Required until validation quota met |
| Standard supported scene image | Required for final MVP export; later sampling may be considered |
| Release localization | Required for critical-text images during MVP |
| Same-category borrowing | Required |
| Same-product migration | Always required |
| Generative video | Always required in MVP |
| Programmatic video from approved assets | Required before final export |

## 11. QC evidence schema

Each QC result should store:

- check ID/version and layer;
- artifact version;
- input/reference versions;
- metric values and thresholds;
- regions/crops/masks used;
- severity and reason code;
- model/tool version;
- execution timestamp and duration;
- raw output reference;
- policy decision and reviewer override, if allowed.

## 12. Override policy

- Warnings may be accepted by an authorized reviewer with reason.
- A FAIL may be superseded only by a new artifact or a documented policy exception.
- A HARD_FAIL cannot be silently overridden. Any exceptional business override requires a separate governance record and must remain visible in the export manifest/audit trail.

## 13. QC policy versioning

Artifacts are evaluated against a specific QC policy version. Re-running a newer policy creates new evidence; it does not delete old results. Export manifests record the policy version used for release.

## 14. Live QC presentation

QC execution must emit Chinese customer-visible events for check start, evidence readiness, warning/fail/hard-fail, conflict, review requirement, and final gate outcome. The customer experience shows the affected visual region and reason whenever evidence exists.

Minimum presentation rules:

- show check category in Chinese, such as 商品结构、颜色、Logo、文字、轮廓、尺寸规范、清晰度;
- pair metrics with plain-Chinese interpretation rather than showing an unexplained score;
- link warnings/failures to masks, crops, OCR boxes, difference maps, or relevant Product Master references;
- show HARD_FAIL as blocking and explain the safe next action;
- show L1/L2 disagreement and route it to human review rather than collapsing it into one score;
- do not expose raw VLM chain-of-thought, provider payloads, or unredacted prompts;
- preserve the underlying check ID, model/tool version, threshold, and evidence in the audit view.

The Live Intelligence Layer may progressively reveal completed QC findings, but it cannot announce approval before all required gates and human decisions are authoritative.
