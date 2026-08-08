# ADR: Astryx Runtime No-Go

> **Status:** ACCEPTED  
> **Date:** 2026-08-09  
> **Phase:** G2-F3.5 R5

## Decision

Astryx runtime components are **not used** as CommerceCanvas production UI foundation.

## Evidence

| Round | Issue |
|---|---|
| R0 | White consumer controls on dark Graphite background |
| R1/R2 | Required heavy theme override (color-scheme hacks, token remapping) |
| R3 | Over-emphasized Badge/Button — visual hierarchy failure |
| R4 | 7 solid buttons + 6 rainbow badges in demo; Graphite identity diluted |

## Why

- Graphite visual identity diluted by Astryx default visual skin
- Global token coupling too strong — single `--color-accent` override cascaded to all components
- Requires excessive CSS overrides (unlayered `!important`, `color-scheme` hacks)
- Wrapper remained pass-through — no real Graphite customization possible without fighting Astryx internals
- Component library becomes visual subject instead of business content
- Visual regression risk too high for F4/F5

## Keep

Astryx as **reference documentation** for:
- Component anatomy (Button structure, Dialog focus lifecycle)
- Keyboard interaction patterns (menu navigation, focus trap)
- Accessibility reference (ARIA roles, focus management)
- Spacing/typography research

## Migration

| Old Policy | New Policy |
|---|---|
| A — Astryx Direct | **SUPERSEDED** |
| B — CC Wrapper over Astryx | **SUPERSEDED** → G (Graphite Native) |
| C — CC Custom | C (unchanged) |

New policies:
- **G**: Graphite Native Primitive (`@/components/ui/`)
- **C**: CommerceCanvas Business Custom
- **R**: Reference-only pattern (Astryx docs)
