# Implementation Notes

This document records the current implementation shape and known migration boundaries. It complements [`ARCHITECTURE.md`](../ARCHITECTURE.md): architecture explains the durable rules; this document explains what is currently wired.

## Runtime surfaces

| Surface | Current role |
|---|---|
| `docs/index.html` | Static dashboard shell and tab content |
| `docs/app.js` | Navigation, legacy dashboard loading, rendering and charts |
| `docs/generated-overlay.js` | Applies generated plan/activity data over the legacy dashboard payload |
| `docs/plan-suggestions.js` | Loads generated suggestions and manages browser-local decisions |
| `docs/what-if.js` | Runs transparent browser-side training simulations |
| `docs/auth-persistence.js` | Optional GitHub-authenticated persistence for suggestion decisions |
| `api/` | Optional serverless authentication and GitHub write endpoints |
| `.github/workflows/build-dashboard-data.yml` | Generates and validates public JSON on relevant pushes and pull requests |

## Data pipeline

```text
Markdown source
  ├─ plans/current-plan.md + plan-suggestions.md
  │    └─ scripts/build-dashboard-data.mjs → docs/generated-data.json
  ├─ knowledge/running, strength, sports-and-recovery
  │    └─ scripts/build-workout-library.mjs → docs/workout-library.json
  └─ knowledge/nutrition/guidance.md
       └─ scripts/build-nutrition-guidance.mjs → docs/nutrition-guidance.json

docs/data.json + docs/nutrition.json remain legacy dashboard payloads.
```

The current dashboard loads `data.json` and `nutrition.json` first. `generated-overlay.js` overlays the generated plan/activity payload, while the Nutrition tab still reads the legacy `nutrition.json`. This is intentional transitional behaviour and is tracked in the roadmap.

## Verification

The repository currently provides:

- `npm run build:data` for the primary dashboard generator when Node/npm are available.
- Direct Node execution of all three generators.
- JSON parsing validation for the three generated outputs in CI.
- JavaScript syntax checks via `node --check` as a lightweight local check.

There is no dedicated lint script or automated browser test suite at present. Adding schema tests, leakage tests and broader UI validation is unfinished work, not an undocumented guarantee.

## Deployment and privacy

The public dashboard is published from `docs/` through GitHub Pages. Anything in `docs/` is public. Source files under `coach/`, `health/` and private plan sections must not be copied into public JSON unless explicitly allowlisted.

## Known gaps

- Remaining dashboard sections still depend on legacy JSON.
- Generated timestamps make artefacts non-deterministic; the architecture goal is deterministic output.
- Schema tests for malformed Markdown and private-field leakage are not yet present.
- The browser-local import and suggestion state is not automatically synchronised across devices.
- The design-system primitives exist, but legacy page styles are not fully migrated.
- There is no formal TypeScript surface; the dashboard is currently vanilla JavaScript.
