# G1 Experiment Matrix


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


## 1. Operating rule

G1 validates feasibility and failure boundaries. It does not prove universal quality. Every experiment must produce raw evidence, a written conclusion, and a decision: promote, retain as hypothesis, restrict, or reject.

## 2. Experiment matrix

| ID | Capability under test | Hypothesis | Candidate route | Primary measures | Decision output | Status |
|---|---|---|---|---|---|---|
| EX-IMG-001 | Local product editing | Qwen-Image-Edit-2511 can serve as a low-cost editor for bounded edits without unacceptable identity drift | Qwen-Image-Edit-2511 | identity hard-fail rate, mask LPIPS, contour, color ΔE, human pass, cost, latency | supported edit classes and prohibited classes | `VALIDATION_REQUIRED` |
| EX-IMG-002 | Same-category reconstruction | A Creative Recipe can transfer composition/lighting/page role without copying competitor product identity | Wan2.7-Image/Pro; Qwen-Image 2.0 Pro backup | own-product identity, competitor leakage, suite consistency, first/two-attempt pass, cost | default route and supported category limits | `VALIDATION_REQUIRED` |
| EX-IMG-003 | Same-product migration | Escalating from local edit to higher-fidelity cloud models improves success for Tier A/B samples | Qwen edit → Wan2.7 Image Pro → GPT Image 2 | pass rate by difficulty tier, logo/text integrity, repair effort, cost | Beta eligibility by tier; no universal claim | `NON_BLOCKING_EXPERIMENT` |
| EX-IMG-004 | Batch backgrounds/candidates | Lower-cost image models can produce useful candidates while product insertion remains controlled | FLUX.2 Klein/Pro; Wan fallback | candidate utility, composition diversity, cost, latency | fast-route eligibility | `VALIDATION_REQUIRED` |
| EX-LOC-001 | OCR and layout parsing | PaddleOCR plus block classification can recover release-relevant text and geometry | PaddleOCR | detection recall, recognition accuracy, block order, protected-token recall | OCR confidence policy and manual-review triggers | `VALIDATION_REQUIRED` |
| EX-LOC-002 | Translation | Qwen-MT-Plus can produce accurate zh/en/de product translations under glossary and schema constraints | Qwen-MT-Plus | critical fact errors, terminology compliance, length variants, human acceptance | translation route and retry policy | `VALIDATION_REQUIRED` |
| EX-LOC-003 | Deterministic render | SVG/Pango/HarfBuzz can reproduce acceptable layouts without changing product regions | deterministic renderer | overflow, clipping, visual balance, OCR readback, product-region difference | release renderer contract | `VALIDATION_REQUIRED` |
| EX-LOC-004 | Fast image translation | Qwen-MT-Image is useful for previews but may not meet release accuracy | Qwen-MT-Image | protected-token errors, product-region changes, OCR readback | preview-only or reject | `NON_BLOCKING_EXPERIMENT` |
| EX-QC-001 | L0 QC | Deterministic checks reliably catch invalid media and rule violations | OpenCV/Pillow/ImageMagick/pHash/SSIM/LPIPS/ffprobe | precision/recall against labeled failures, runtime | hard/warning rule set | `VALIDATION_REQUIRED` thresholds |
| EX-QC-002 | Product identity QC | Embeddings, masks, contour, color, OCR, and key-region matching can reduce human identity review load | DINO/SigLIP + SAM2 + local metrics | false accept, false reject, category variance | category-specific score policy | `VALIDATION_REQUIRED` |
| EX-QC-003 | Semantic VLM QC | Qwen3-VL-Plus can identify misuse, extra parts, competitor marks, and claim-image conflicts | Qwen3-VL-Plus | recall on semantic defect set, false alarms, explanation usefulness | supported checks and non-authority boundary | `VALIDATION_REQUIRED` |
| EX-VID-001 | Programmatic video | Approved images can be assembled into reliable platform-ready clips | Remotion + ffmpeg | encode success, duration, layout overflow, subtitle correctness, playback | MVP video template baseline | `FROZEN` capability / `VALIDATION_REQUIRED` templates |
| EX-VID-002 | Generative TikTok video | Seedance can produce useful 5–15 s clips for selected products without unacceptable identity drift | Seedance 2.0 | identity drift per frame/shot, temporal defects, human acceptance, cost | experimental supported cases | `NON_BLOCKING_EXPERIMENT` |
| EX-VID-003 | Product-consistency escalation | Kling is justified only where Seedance fails and cost/quality improves materially | Kling 3.0 Omni | paired quality gain, identity, cost multiplier | integrate or defer | `NON_BLOCKING_EXPERIMENT` |
| EX-OPS-001 | API timeout/retry | Attempts are recoverable without duplicate billing or ambiguous state | provider mock + selected real API | duplicate side effects, state accuracy, retry recovery | attempt/idempotency contract | `VALIDATION_REQUIRED` |
| EX-OPS-002 | Worker offline recovery | A task can be reclaimed safely after worker loss | local worker harness | orphan detection, duplicate execution, artifact integrity | lease/heartbeat policy | `VALIDATION_REQUIRED` |
| EX-COST-001 | Cost estimation | Pre-run estimates can remain within an approved variance from actual cost | all paid routes | estimate error by provider/task | estimation model and disclosure | `VALIDATION_REQUIRED` |
| EX-OPS-003 | SSE delivery and replay | Ordered execution events survive disconnect/reconnect without gaps, duplication, or stale terminal state | Control Plane SSE + event store + browser harness | event loss/duplication, order, replay latency, snapshot consistency, connection recovery | SSE/replay contract and retention | `VALIDATION_REQUIRED` implementation |
| EX-UX-001 | Live Intelligence semantic coverage | Page-specific event mappings make real progress, findings, evidence, risk, and actions understandable without raw logs | clickable prototype using recorded traces | stage recognition, next-action clarity, evidence discovery, silent-period perception | event taxonomy and page mapping | `VALIDATION_REQUIRED` |
| EX-UX-002 | Professional/high-tech perception | Graphite Canvas live execution increases perceived capability, trust, and willingness to continue without appearing fake or distracting | high-fidelity Chinese prototype A/B or moderated sessions | professional-capability rating, trust, interest, task comprehension, distraction/fakery reports | approved visual/motion patterns | `VALIDATION_REQUIRED` |
| EX-I18N-001 | Simplified-Chinese interaction copy | Chinese navigation, status, warnings, errors, milestones, and analysis traces are clear and consistent for studio users | Chinese copy inventory + scenario review | untranslated strings, jargon comprehension, action success, terminology consistency | Chinese copy standard and glossary | `VALIDATION_REQUIRED` quality / `FROZEN` language |

## 3. Controlled-variable requirements

For model comparisons:

- use the same Product Master version and input assets;
- hold task instructions, output size, and evaluation rubric constant unless the experiment explicitly studies them;
- record all provider-side defaults that cannot be controlled;
- do not compare a locally post-processed output to an unprocessed provider output without reporting the post-processing chain;
- separate route quality from retry count and human repair;
- for Live Intelligence comparison, use the same underlying authoritative event trace so only presentation density, motion, or wording changes;
- never improve perceived-capability scores by adding events that were not produced by the execution system.

## 4. Difficulty-specific evaluation

Same-product migration and generative video must be reported by difficulty tier. A route may be approved only for a subset. “Overall average” cannot hide failure in high-risk classes.

## 5. Minimum evidence per experiment

Each experiment report must include:

1. experiment ID and revision;
2. hypothesis and rejection conditions;
3. sample manifest and split;
4. binding/model versions and parameters;
5. raw quantitative outputs;
6. blinded human evaluation where practical;
7. failure gallery and reason-code counts;
8. cost and latency distribution, not only averages;
9. conclusion and confidence limits;
10. proposed scope/routing/QC change;
11. for interaction experiments, the raw event trace, Chinese copy version, screenshots/recording, and evidence-link coverage.

## 6. Promotion criteria

A hypothesis can be promoted to a frozen implementation decision only when:

- holdout results meet the approved metric gate;
- failure classes are documented;
- provider/model version is identifiable and available;
- cost is measurable;
- retry/fallback behavior is defined;
- no unresolved rights, privacy, or security blocker remains.

## 7. Live-experience rejection conditions

A Live Intelligence design is rejected or revised when it:

- leaves a multi-stage task visually silent while meaningful events exist;
- exposes raw English/provider/debug text to ordinary customers;
- displays invented progress or simulated reasoning;
- cannot reconnect and reconstruct the authoritative execution story;
- creates spectacle without inspectable evidence;
- materially reduces media inspection, accessibility, or interaction performance;
- causes users to misunderstand a warning, hard failure, cost increase, or required action.
