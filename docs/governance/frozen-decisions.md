# Frozen Decisions Register


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


## 1. Governance rule

These decisions are approved baselines. A developer or agent must not reinterpret them as suggestions. Changes require a new decision record describing rationale, evidence, impacted documents, migration, and acceptance impact.

## 2. Frozen decisions

| ID | Decision | Rationale / constraint |
|---|---|---|
| FD-001 | Product name is CommerceCanvas; positioning is Cross-Border Commerce Visual Studio / 跨境电商商品视觉工作台. | Establishes product identity and scope. |
| FD-002 | The product is a studio production system, not a single AI image tool. | Workflow, audit, QC, and batch operations are first-class. |
| FD-003 | Primary application is Web. | Supports private, LAN, and cloud deployment without duplicating desktop UI. |
| FD-004 | Supported deployment modes are single-machine private, studio LAN, and managed cloud. | Deployment flexibility is a product requirement. |
| FD-005 | PostgreSQL on the server/control plane is the sole business-state authority. | Prevents split-brain across workers/agents. |
| FD-006 | A future Windows Agent is lightweight and does not own business state. | Local integration without independent product database. |
| FD-007 | Product Master is mandatory and versioned for every SKU. | Generation and QC require a stable identity source. |
| FD-008 | MVP platform targets are Amazon, Shopify, and TikTok Shop. | Limits Recipe and export scope. |
| FD-009 | MVP language targets are zh-CN, en-US, and de-DE. | Limits localization scope while testing expansion complexity. |
| FD-010 | Same-category different-product visual borrowing is a formal MVP capability. | High-value workflow with manageable identity boundaries. |
| FD-011 | Same-product competitor migration is Beta/experimental and not an MVP release blocker. | Material failure risk; no universal automation promise. |
| FD-012 | Release localization changes text only and must not regenerate the product body. | Product truth takes precedence. |
| FD-013 | Release localization uses OCR, terminology protection, erasure, deterministic layout, OCR readback, and product-region difference checking. | Ensures traceable text accuracy. |
| FD-014 | Ordinary users select 快速、均衡、高质量、商品保真优先、文字准确优先—not model IDs. | Chinese product intent labels are stable; provider details can change. |
| FD-015 | Administrators may inspect/configure Provider and Model IDs through Provider Bindings. | Supports operations and audit. |
| FD-016 | Every attempt records actual provider/model version, input version, cost, duration, retries, QC, and review outcome. | Auditable economics and quality. |
| FD-017 | QC has four layers: L0 deterministic, L1 specialized, L2 VLM, L3 human. | No single-model quality authority. |
| FD-018 | VLM cannot override deterministic or calibrated hard failures. | Limits non-deterministic authority. |
| FD-019 | Programmatic product video is a formal MVP capability. | Reliable value using approved images and templates. |
| FD-020 | Generative product video is experimental in MVP. | Identity and cost remain uncertain. |
| FD-021 | Seedance is the initial generative-video experiment; Kling is integrated only if evidence shows material need. | Avoids premature multi-provider integration. |
| FD-022 | MVP includes Product Master, standard/scene images, same-category borrowing, localization, Recipes, batch Jobs, QC, review/versioning, export, and programmatic video. | Defines committed scope. |
| FD-023 | MVP excludes public registration/payment, multi-tenant SaaS billing, auto-publishing, massive scraping, LoRA training, foundation-model R&D, full video editor, full template marketplace, and full Windows desktop app. | Protects focus. |
| FD-024 | G0, G1, and G2 precede formal business-feature development. | Evidence and architecture must lead implementation. |
| FD-025 | G1 permits experiment scripts but not broad production frontend/backend implementation. | Prevents experiments from becoming accidental architecture. |
| FD-026 | G3 implements only the vertical chain: upload → Product Master → one Amazon scene image → L0 QC → human review → export. | Reduces integration risk. |
| FD-027 | The UI follows Graphite Canvas: media-first, dark neutral, compact, no ERP/KPI-card dominance, no large gradients/glassmorphism. | Aligns with professional visual-workspace use. |
| FD-028 | Provider/model candidates are not performance commitments until G1 validates them. | Avoids conflating roadmap with evidence. |
| FD-029 | Experimental routes must be visibly flagged and cannot silently become defaults or release blockers. | Governance and user trust. |
| FD-030 | Approved assets are versioned; revisions create new versions rather than overwrite history. | Review and audit integrity. |
| FD-031 | The Live Intelligence Layer is a formal horizontal MVP capability, not optional polish or a 任务详情-only feature. | Visible intelligence, trust, and differentiated product perception are core product value. |
| FD-032 | SSE is the default server-to-browser transport for execution events; authenticated HTTP APIs remain the command path and polling is only a degraded fallback. | One-way live production events need simple, reconnectable delivery without unnecessary bidirectional complexity. |
| FD-033 | Business-significant execution events are ordered, persisted, replayable, and reconcilable with an authoritative snapshot. | Navigation or network interruption must not erase or falsify task history. |
| FD-034 | All customer-visible UI, navigation, progress, analysis traces, warnings, error guidance, milestones, and actions use Simplified Chinese. | All current customers are Chinese; mixed technical English damages comprehension and perceived completeness. |
| FD-035 | Customer-visible interaction logs are structured Chinese product narratives, not raw worker/provider/debug logs. | Converts technical work into understandable capability while protecting security and usability. |
| FD-036 | Perceived sophistication must be produced by real stages, intermediate results, inspectable evidence, truthful metrics, and restrained high-information motion; fake thinking, fake terminal output, code rain, and invented percentages are prohibited. | Marketing value must reinforce rather than undermine trust. |
| FD-037 | A persistent task surface follows active work across core pages and expands to full task detail. | Prevents background work from becoming invisible after navigation. |
| FD-038 | Every core page consumes the shared event contract but presents page-specific intelligence and evidence. | Consistent semantics without generic one-size-fits-all UI. |

## 3. Required downstream conformance

All G2 architecture, data models, API contracts, UI flows, implementation plans, and acceptance tests must reference applicable FD IDs. A task that contradicts an FD must be rejected or escalated before code is written. In particular, implementations of Job/Task/Artifact, worker reporting, routing, QC, and every core page must reference FD-031 through FD-038.
