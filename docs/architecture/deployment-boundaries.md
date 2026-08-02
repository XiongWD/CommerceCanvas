# Deployment and Trust Boundaries


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


## 1. Deployment modes

| Mode | Description | Business-state authority |
|---|---|---|
| Single-machine private | Web, API, DB, queue, workers, and local storage on one controlled machine | PostgreSQL |
| Studio LAN | Central control plane and storage with one or more LAN workers | Central PostgreSQL |
| Managed cloud | Hosted control plane/object storage with cloud and optional local workers | Hosted PostgreSQL |

The same logical contracts should apply across modes. Deployment mode must not change the meaning of Job, Task, Attempt, Artifact, QC, or Review states.

## 2. Logical topology

```text
Browser
  │ HTTPS
  ▼
React Web Application
  │ authenticated HTTP commands + SSE execution stream
  ▼
FastAPI Control Plane ───── PostgreSQL (business truth)
  │                         Redis / Job Queue (coordination)
  │                         Object Storage metadata bindings
  ▼
Worker Fleet / Provider Adapters
  ├─ image worker
  ├─ video worker
  ├─ OCR/translation worker
  ├─ QC worker
  └─ external cloud providers

Media bytes:
  local working storage ↔ controlled upload/download ↔ R2/S3
```

## 3. Authority boundaries

| Component | May own | Must not own |
|---|---|---|
| Web client | transient UI state, unsaved edits, SSE cursor, presentation state | authoritative job/review/product state or invented progress |
| Control Plane | business rules, state transitions, policies, audit | raw GPU execution |
| PostgreSQL | authoritative metadata and decisions | large media bytes |
| Redis/Queue | leases, scheduling signals, transient progress | sole job history or approval truth |
| Worker | temporary files, execution process, local cache | Product Master truth, review approval, permanent state machine |
| Object storage | media bytes and large evidence payloads | business lifecycle by object presence alone |
| External provider | model execution | internal job state or approval |
| Windows Agent | folder watch, sync, resume, local cache/GPU/export bridge | business truth or independent workspace database |

## 4. Storage tiers

### 4.1 Local working storage

Used for:

- upload staging;
- temporary normalized inputs;
- worker intermediate files;
- local model caches;
- incomplete upload chunks;
- render scratch space.

Local paths are not durable business references unless registered as managed storage locations. Cleanup must respect active task leases.

### 4.2 Object storage (R2/S3)

Used for:

- immutable source uploads;
- approved references;
- provider inputs when cloud access is allowed;
- generated artifacts requiring review/history;
- QC masks/crops/evidence as policy requires;
- approved final assets;
- export packages and manifests.

### 4.3 Database

Stores:

- object keys, hashes, sizes, media metadata, and lifecycle;
- lineage and versions;
- job/task/attempt state;
- Product Masters and Recipes;
- QC and review decisions;
- provider binding snapshots;
- costs and export manifests.

## 5. Network and trust zones

| Zone | Trust level | Controls |
|---|---|---|
| Browser/client | untrusted input | auth, validation, upload limits, CSRF/CORS policy |
| Control plane | trusted application zone | secrets isolation, least privilege, audit |
| Worker zone | semi-trusted execution | scoped credentials, sandboxing, signed/validated tasks |
| Object storage | durable data zone | scoped keys, encryption, checksums, retention |
| External provider | third-party zone | explicit cloud permission, minimized data, provider policy |

## 6. Worker contract

A worker receives:

- task/attempt ID;
- signed or authorized input references;
- immutable binding/parameter snapshot;
- output contract;
- heartbeat/lease rules;
- upload destinations or scoped credentials;
- cancellation signal mechanism.

A worker reports:

- accepted/started/progress/heartbeat;
- provider request identifiers;
- raw diagnostic logs and structured execution facts using stable event codes;
- evidence/artifact references and progress denominators when known;
- outputs with hashes and metadata;
- cost/usage information when available;
- terminal success/failure/cancel state.

A worker cannot directly mark an asset approved or exported.

## 7. Failure and recovery boundaries

- Control Plane owns retry and fallback decisions.
- Worker process restart must not imply task success or failure without lease/state evaluation.
- Every execution is an Attempt; retries never overwrite previous attempt evidence.
- Outputs are committed only after checksum and metadata validation.
- Ambiguous provider timeouts enter a reconciliation state rather than immediate blind retry where duplicate charge/output is possible.

## 8. Windows Agent boundary

The optional agent may:

- watch configured directories;
- create/resume uploads;
- cache downloads;
- invoke approved local GPU/ImageMagick/ffmpeg operations;
- export approved packages to fixed directories;
- report health and progress.

It must:

- authenticate to the control plane;
- use scoped credentials;
- tolerate offline periods;
- resume transfers by checksum/chunk state;
- avoid storing independent authoritative product/job/review databases.

## 9. Live Intelligence, SSE, and observability boundary

### 9.1 Transport and authority

- SSE is the default one-way server-to-browser transport for execution events.
- Authenticated HTTP APIs remain the command path for start, cancel, retry, approve, reject, request revision, and configuration changes.
- PostgreSQL remains the authority for Job/Task/Attempt/Artifact/QC/Review state. The SSE connection is a delivery channel, not the sole source of truth.
- Polling may exist only as a degraded recovery fallback; WebSocket is not required for MVP live execution.

### 9.2 Event envelope

The G2 contract must include at least:

- `event_id`, monotonic `sequence`, `emitted_at`;
- `workspace_id`, `job_id`, optional `task_id`, `attempt_id`, `artifact_id`;
- stable `event_type`, `stage_code`, severity and terminality;
- progress mode (`determinate` or `indeterminate`), completed/total when valid, elapsed time;
- internal facts and reason codes;
- Chinese presentation key plus resolved Chinese title, summary, detail and suggested action;
- evidence/artifact references and display hints;
- retry/fallback/provider/cost delta where applicable;
- schema version.

Workers emit execution facts, not arbitrary customer prose. The Control Plane validates, persists business-significant events, and maps them through versioned Chinese presentation definitions.

### 9.3 Delivery and recovery

- Browser reconnect uses `Last-Event-ID` or equivalent sequence cursor.
- The server replays persisted events in order and then sends a current authoritative snapshot.
- Clients deduplicate by event ID/sequence and detect gaps.
- Heartbeats keep connections observable but do not create fake customer progress.
- Event coalescing may reduce high-frequency noise but cannot hide retries, fallback, warnings, cost changes, evidence availability, intervention requests, or terminal state.
- A stale connection must visibly degrade to a Chinese “实时连接已中断，正在恢复” state rather than silently freezing.

### 9.4 Customer presentation and language

All customer-visible navigation, stages, analysis traces, warnings, errors, milestones, and actions use Simplified Chinese. Provider/model IDs, trace IDs, file hashes, and internal event codes may remain unchanged, but must be surrounded by Chinese context. Raw diagnostic logs, stack traces, provider payloads, secrets, and hidden reasoning are excluded from ordinary views.

### 9.5 Required production-state visibility

The system must expose:

- job/task/attempt state and timestamps;
- worker heartbeat and lease state;
- provider request ID, latency, retry, fallback, and failure class;
- artifact upload/validation and intermediate-result readiness;
- cost estimate, actual cost, and material cost delta;
- QC stages, findings, evidence, and review status;
- required user intervention and safe next actions.

Infrastructure metrics alone are insufficient; the customer needs a credible Chinese execution narrative linked to inspectable evidence.

## 10. G2 decisions still required

- exact queue technology and lease semantics;
- exact SSE endpoint shape, event schema versioning, replay retention, snapshot API, and event coalescing;
- object-key and local-directory conventions;
- credential issuance for LAN/local workers;
- upload strategy and tus deployment;
- retention/cleanup policies;
- disaster recovery targets;
- security model for managed cloud deployment.

## 11. Security and privacy for live events

- Event payloads follow least disclosure and are authorized by workspace/job scope.
- Secrets, signed storage URLs beyond required lifetime, full provider prompts, private headers, and stack traces are prohibited in customer SSE payloads.
- Evidence links use scoped authorization and expiry policy.
- Chinese error copy must remain actionable without revealing exploitable infrastructure detail.
- Administrative diagnostic access is separately permissioned, redacted, and audited.
