# Implementation Notes

This document records the current implementation shape and known migration boundaries. It complements [`ARCHITECTURE.md`](../ARCHITECTURE.md): architecture explains durable rules; this document explains what is currently wired.

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

## Coach and training-engine boundary

The current Coach Review and What If features are not a general adaptive training engine.

Current behaviour:

- plan suggestions are authored in Markdown;
- What If scenarios use browser-side rules in `docs/what-if.js`;
- decisions may remain browser-local;
- the optional authenticated API can persist supported suggestion decisions;
- no server-side model continuously rewrites the plan.

Planned behaviour is defined in [`AI-COACH.md`](AI-COACH.md) and [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md). Those documents are contracts, not evidence that the future engine is already implemented.

## Design-system status

`docs/design-system.css` provides tokens and reusable primitives. Most existing pages still use legacy classes and page-specific styles.

The next visual migration should rebuild the home dashboard first, preserve current functionality, then progressively migrate Plan, Activities, Workout Library, Nutrition and Recovery. See [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

## Verification

The repository currently provides:

- `npm run build:data` for the primary dashboard generator when Node/npm are available;
- direct Node execution of all three generators;
- JSON parsing validation for the three generated outputs in CI;
- JavaScript syntax checks via `node --check` as a lightweight local check.

There is no dedicated lint script or automated browser test suite at present. Adding schema tests, leakage tests and broader UI validation is unfinished work, not an undocumented guarantee.

## Deployment and privacy

The public dashboard is published from `docs/` through GitHub Pages. Anything in `docs/` is public. Source files under `coach/`, `health/` and private plan sections must not be copied into public JSON unless explicitly allowlisted.

The optional persistence service must keep write credentials on the server side and validate a small set of structured actions. A public browser must not receive repository write credentials.

## Known gaps

- Remaining dashboard sections still depend on legacy JSON.
- Generated timestamps make artefacts non-deterministic; the architecture goal is deterministic output.
- Schema tests for malformed Markdown and private-field leakage are not yet present.
- The browser-local import and suggestion state is not automatically synchronised across devices.
- The design-system primitives exist, but legacy page styles are not fully migrated.
- The What If logic is page-specific rather than a shared tested training-engine module.
- The workout library does not yet model exercise references, supersets, circuits or drop sets as structured data.
- Nutrition guidance is generated but the current Nutrition tab still uses its legacy payload.
- There is no formal TypeScript surface; the dashboard is currently vanilla JavaScript.

## Maintenance rule

Move durable decisions into architecture or domain contracts. Keep this document focused on current wiring, transitional behaviour and known gaps. Remove migration notes when the corresponding legacy path has been retired.
