# Astryx Package Audit

> **Task:** G2-F3.5 R0 Phase C  
> **Audit date:** 2026-08-08

## Package Versions (verified via npm registry)

| Package | Version | Status | Why Needed |
|---|---|---|---|
| @astryxdesign/core | 0.3.0 | Beta, install | Core UI primitive library (Button, Input, Tabs, Dialog, etc.) |
| @astryxdesign/theme-neutral | 0.3.0 | Beta, install | Neutral theme foundation for Graphite Canvas mapping |
| @stylexjs/stylex | 0.19.0 | Stable, install | StyleX CSS-in-JS (Astryx peer dep) |
| @astryxdesign/cli | 0.3.0 | Beta, devDep only | Component/docs reference (will NOT run init) |

## Peer Dependencies

```
@astryxdesign/core@0.3.0:
  @stylexjs/stylex: ^0.19.0  ← will install 0.19.0
  react: >=19.0.0            ← already on 19.2.8 ✓
  react-dom: >=19.0.0        ← already on 19.2.8 ✓

@astryxdesign/theme-neutral@0.3.0:
  @astryxdesign/core: 0.3.0  ← will install 0.3.0
  react: >=19                ← already on 19.2.8 ✓
```

## Installation Strategy

- Versions pinned in package.json (no `latest`)
- lockfile will be committed
- No CDN dependencies
- CLI installed as devDependency but `astryx init` will NOT be run (would overwrite governance files)
- Manual package/theme setup instead of CLI init

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Beta API instability | Pin to 0.3.0; do not auto-upgrade |
| CLI overwrites AGENTS.md | Do NOT run `astryx init`; manual setup |
| StyleX + Tailwind CSS conflict | Explicit cascade layers (Phase D) |
| Bundle size | Monitor in build output |
