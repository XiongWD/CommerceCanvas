# G1 Sample Set Plan


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


## 1. Objective

Create a small but deliberately difficult evidence set that can expose product-identity, localization, scene reconstruction, cost, and recovery failures before production architecture is frozen. This is an evaluation set, not a model-training corpus.

## 2. Required inventory

| Sample group | Target quantity | Purpose | Status |
|---|---:|---|---|
| Real SKUs | 20 | End-to-end product identity and workflow coverage | `FROZEN` quantity |
| Representative category groups | 3 | Expose materially different visual failure modes | `FROZEN` count / `VALIDATION_REQUIRED` final categories |
| Product reference images | 100–150 | Multi-view Product Masters and detail references | `FROZEN` range |
| Same-product competitor sets | 10 sets | Difficulty-tier migration benchmark | `FROZEN` quantity / Beta use |
| Same-category different-product sets | 10 sets | Creative Recipe extraction and reconstruction | `FROZEN` quantity |
| Localization images | 50 | OCR, translation, erasure, layout, readback | `FROZEN` quantity |
| Product video materials | 10 sets | Programmatic and generative video tests | `FROZEN` quantity |
| Representative live-execution traces | At least 12 scenarios | Event semantics, Chinese copy, evidence linkage, cross-page continuity, reconnect, failure/retry/fallback | `FROZEN` minimum |

## 3. Category selection criteria

Final categories must be chosen to maximize failure-mode coverage rather than business convenience. The three groups should collectively include:

1. **Rigid geometry and reflective surfaces** — exact ports, seams, openings, symmetry, and reflections.
2. **Text/packaging-heavy products** — brand, model, quantities, units, regulatory or instruction text.
3. **Soft, deformable, worn, held, or context-dependent products** — occlusion, human interaction, drape, scale, and pose.

Possible examples include consumer-electronics accessories, packaged home/beauty goods, and soft goods or wearable accessories. These examples are not frozen category choices.

## 4. SKU allocation

| Difficulty class | Quantity | Required traits |
|---|---:|---|
| Low | 6 | Clean references, simple geometry, low text density, no human interaction |
| Medium | 8 | Multiple materials, moderate reflections/details, some text or contextual use |
| High | 6 | Hand-held/worn/occluded, reflective, text-sensitive, fine geometry, or ambiguous scale |

At least five SKUs must contain protected logo/model text. At least five must have important numeric or unit text. At least five must require multiple reference angles to establish identity.

## 5. Reference capture requirements

Each Product Master sample should include, when physically applicable:

- front, side, back, and three-quarter views;
- one or more detail close-ups;
- isolated logo/label region;
- packaging front/back/side;
- dimensions or scale reference;
- approved facts and claims;
- explicit allowed/prohibited changes.

Reference images must preserve original files. Any normalized, cropped, masked, or compressed derivative must be stored as a separate artifact with lineage.

## 6. Competitor-set requirements

### 6.1 Same-category different-product sets

Each set should include 5–8 images covering at least three purposes among main image, scene, detail, selling point, parameter, and banner. The set must be annotated with:

- reusable visual structure;
- prohibited competitor identity elements;
- unsupported claims;
- expected own-product substitution constraints.

### 6.2 Same-product sets

Each set receives a difficulty label:

| Tier | Description |
|---|---|
| A — Easy | isolated or lightly staged product, low occlusion, similar angle |
| B — Moderate | contextual scene, moderate angle change, reflections or partial occlusion |
| C — Hard | worn/held, heavy occlusion, large angle change, fine packaging text, or multiple interacting subjects |

Beta conclusions must be reported separately by tier. Aggregating A/B/C into one success rate is prohibited.

## 7. Localization sample composition

The 50 images should include:

- 15 low-density text images;
- 20 medium-density selling-point or parameter images;
- 15 high-density or layout-constrained images;
- at least 15 with numbers/units;
- at least 10 with protected brands/models;
- at least 10 with transparent, gradient, textured, or complex text backgrounds;
- at least 15 German target renders to test text expansion and compound words.

Each text block must have an approved expected translation or an explicit “do not translate” decision.

## 8. Video sample composition

The 10 video sets should cover:

- 4 programmatic image-to-video templates;
- 3 lightweight single-shot motion cases;
- 3 high-risk generative cases involving hand-held, worn, multi-angle, or reflective products.

The generative cases are experiment-only and cannot become release blockers.


## 8.1 Live Intelligence scenario composition

The minimum 12 scenarios must cover:

1. Product Master ingest and reference validation;
2. competitor image-role and visual-structure analysis;
3. generation with determinate candidate count;
4. generation with indeterminate provider wait;
5. QC warning with linked evidence;
6. hard failure with safe Chinese remediation;
7. retry followed by success;
8. provider fallback with cost increase;
9. localization OCR/protected-token/layout/readback stages;
10. programmatic video render and encode;
11. worker disconnect and task recovery;
12. browser SSE disconnect, ordered replay, and cross-page continuation.

For each scenario retain the authoritative state history, raw structured events, resolved Chinese presentation, screenshots or prototype recording, and reviewer notes on clarity, trust, professional capability, excessive spectacle, and missing evidence.

## 9. Dataset split

| Split | Share | Use |
|---|---:|---|
| Calibration | 60% | Tune thresholds, prompts, and route policy |
| Holdout | 40% | Final G1 decision evidence; no threshold tuning after reveal |

The split must be SKU-disjoint where possible. Near-duplicate images of the same SKU must not appear on both sides for identity evaluations.

## 10. Annotation schema

Each sample requires:

- stable sample ID and source rights note;
- SKU/category/difficulty;
- Product Master version;
- protected regions/tokens;
- identity-critical regions;
- expected platform slot;
- allowed/prohibited modifications;
- expected translation and layout constraints;
- human gold decision rubric;
- known ambiguity or annotation disagreement;
- expected live stages and event types;
- expected Chinese titles/summaries/actions for critical events;
- evidence that should become inspectable at each milestone;
- whether progress is determinate or indeterminate.

## 11. Human evaluation

- Use at least two reviewers for holdout decisions involving identity or semantic plausibility.
- Resolve disagreements through a documented adjudication step.
- Reviewers must inspect the Product Master and not judge only aesthetic quality.
- Record pass, warning, hard fail, reason codes, and repair effort.

## 12. Evidence storage

For every experiment attempt, retain:

- exact input artifact versions;
- prompt or structured instruction snapshot;
- provider binding and model version;
- parameters and seed when available;
- raw output;
- normalized output used for metrics;
- metric results;
- human decisions;
- actual cost, duration, and retry count;
- error payloads and timeout state;
- ordered structured event stream and replay cursor;
- resolved Simplified-Chinese interaction-log copy;
- evidence/artifact links emitted during execution;
- prototype/session recording for interaction scenarios.

## 13. Dataset acceptance checklist

The sample set is ready only when:

- all 20 SKUs have minimum Product Master data;
- category and difficulty distributions meet this plan;
- rights/provenance notes exist;
- calibration/holdout split is frozen;
- protected tokens and identity regions are annotated;
- expected translations are reviewed;
- no hidden replacement of holdout samples occurs after poor results;
- all 12 Live Intelligence scenarios have expected event and Chinese-copy annotations;
- the scenario set includes success, warning, hard fail, retry, fallback, reconnect, and recovery rather than only ideal runs.
