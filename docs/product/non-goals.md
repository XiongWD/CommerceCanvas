# MVP Non-Goals


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

This document prevents scope expansion disguised as infrastructure, future-proofing, or model integration. Items below are not merely low priority; they are excluded from the MVP unless a formal scope-change decision is approved.

## 2. Explicit non-goals

| ID | Non-goal | Rationale | Revisit trigger | Status |
|---|---|---|---|---|
| NG-001 | Public user registration, subscription, payment, invoices, and SaaS metering | MVP targets private studio operations, not a public commercial service | Stable studio trial plus a separate SaaS business case | `OUT_OF_SCOPE` |
| NG-002 | Full multi-tenant isolation and tenant billing | Adds significant security and accounting scope before product-market validation | Managed cloud demand from multiple paying organizations | `OUT_OF_SCOPE` |
| NG-003 | Automatic publishing to Amazon, Shopify, or TikTok Shop | Introduces platform account, policy, and irreversible-action risk | Export workflow proves stable and publishing APIs are separately reviewed | `OUT_OF_SCOPE` |
| NG-004 | A general-purpose AI image editor | Product workflows and Recipes take precedence over free-form editing | Revisit only after core production workflows are stable | `OUT_OF_SCOPE` |
| NG-005 | Unlimited style/template marketplace | Creates quality and governance debt | At least three validated category packs and template governance | `OUT_OF_SCOPE` |
| NG-006 | Integrating every available model/provider | Increases testing, routing, failure, and billing complexity | A documented capability gap cannot be met by current bindings | `OUT_OF_SCOPE` |
| NG-007 | Training LoRA or foundation models | Storage, data rights, training operations, and evaluation are separate products | Demonstrated ROI and legally cleared training data | `OUT_OF_SCOPE` |
| NG-008 | Building a foundation image/video model | Not aligned with studio workflow value | No planned MVP trigger | `OUT_OF_SCOPE` |
| NG-009 | Guaranteeing 100% same-product competitor migration | Technical failure modes are material and category-specific | No guarantee; only evidence-based supported classes may be published | `OUT_OF_SCOPE` |
| NG-010 | Full nonlinear video editing timeline | MVP uses programmatic templates and generation experiments | Repeated user demand beyond template composition | `OUT_OF_SCOPE` |
| NG-011 | High-end brand-film production as a core flow | Veo/Kling premium ads are expensive and not required for initial value | Premium workflow business case and benchmark | `OUT_OF_SCOPE` |
| NG-012 | Full Windows desktop application | Web is the primary product; desktop duplicates UI and state | A lightweight agent proves insufficient | `OUT_OF_SCOPE` |
| NG-013 | Business state stored in Windows Agent or worker-local databases | Creates split-brain and recovery problems | No revisit; server database remains authoritative | `OUT_OF_SCOPE` |
| NG-014 | Exposing ComfyUI node graphs to ordinary users | Leaks implementation complexity and weakens workflow guarantees | Administrator-only diagnostic tools may be added separately | `OUT_OF_SCOPE` |
| NG-015 | Scraping or collecting hundreds of thousands of competitor images | Rights, storage, moderation, and data quality are separate risks | Separate legally reviewed data acquisition program | `OUT_OF_SCOPE` |
| NG-016 | Full digital asset management replacement | MVP manages workflow-linked product assets, not every corporate file | Proven need after trial | `OUT_OF_SCOPE` |
| NG-017 | ERP, inventory, order, logistics, or PIM replacement | CommerceCanvas consumes product facts but does not own commerce operations | Integrations may be considered later | `OUT_OF_SCOPE` |
| NG-018 | Automatic acceptance based only on a VLM score | VLM judgments are non-deterministic and cannot supersede hard checks | No revisit as a sole gate | `OUT_OF_SCOPE` |
| NG-019 | Regenerating the full image for release-grade text translation | Risks changing product identity | No revisit for release path | `OUT_OF_SCOPE` |
| NG-020 | Global fixed product-identity thresholds across all categories | Visual variance differs materially by product type | Category-specific calibration completed | `OUT_OF_SCOPE` as a design shortcut |
| NG-021 | English-first or mixed-language customer UI and interaction logs | All current customers are Chinese; mixed raw messages damage comprehension and perceived product completeness | No MVP revisit; localization framework may add languages later | `OUT_OF_SCOPE` |
| NG-022 | Exposing raw worker/provider/debug logs as the primary live experience | Raw logs leak implementation detail, may expose sensitive data, and do not communicate business meaning | Administrator diagnostic view only with redaction | `OUT_OF_SCOPE` |
| NG-023 | Fabricated AI thinking, fake terminal commands, code rain, or invented percentages | Creates short-term spectacle but damages trust when behavior and evidence do not match | No revisit | `OUT_OF_SCOPE` |
| NG-024 | A separate one-off progress component per page with incompatible semantics | Fragments state, copy, replay, and trust behavior | Use one event contract with page-specific presentation | `OUT_OF_SCOPE` |
| NG-025 | Visual effects that block media inspection or materially reduce performance/accessibility | The canvas and evidence remain primary | Only after measured UX benefit and performance budget | `OUT_OF_SCOPE` |

## 3. Prohibited implementation shortcuts

The following shortcuts are treated as scope or quality violations:

- storing model/provider names directly in user-facing workflow definitions without Provider Binding indirection;
- allowing a task to proceed to release after an unresolved hard QC failure;
- overwriting an approved asset instead of creating a new version;
- hiding retries or provider substitutions from the audit trail;
- treating a successful API response as a successful visual result;
- using prompt text as the sole product identity definition;
- silently converting an experimental route into the default route;
- creating generalized infrastructure before the G3 vertical slice requires it;
- showing a generic spinner for a multi-stage task while meaningful stage/evidence events exist;
- emitting customer-visible messages without a Simplified-Chinese presentation mapping;
- displaying determinate percentages without a real denominator;
- discarding business-significant SSE events so reconnect loses the execution narrative;
- using decorative 'hacker' effects to imply analysis that did not occur.

## 4. Scope-change procedure

A proposed non-goal may be reconsidered only when the proposal includes:

1. user or business evidence;
2. impact on G3/G4/G5 schedule;
3. new data and API requirements;
4. operational and security impact;
5. acceptance metrics;
6. explicit features to remove or defer in exchange.
