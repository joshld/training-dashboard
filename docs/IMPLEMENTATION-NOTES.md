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

The dashboard generator derives the current plan's `progressDistance` from eligible public running records in `activities/records/` whose dates fall within the parsed plan date range. It also publishes `manualProgressDistance`, `derivedCompletedRunningDistance`, `progressSource`, `dateRangeStart` and `dateRangeEnd`; the manual plan value remains the fallback when no eligible distance is available.

## Import and activity-analysis boundary

The current import flow supports previewing FIT, TCX and GPX data and saving imported activities in browser-local state. The richer activity-analysis experience described in [`ACTIVITY-ANALYSIS.md`](ACTIVITY-ANALYSIS.md) is not fully implemented.

Current behaviour:

- imports are browser-local rather than a durable repository-backed activity source;
- public activity records are still Markdown summaries, not full FIT-derived analysis records;
- FIT imports normalize supported session, lap and non-location record metrics into the browser-local activity object;
- normalized record data is explicitly allowlisted for later charts and excludes GPS coordinates and unknown FIT fields;
- activity detail now exposes Overview, Laps and Running Dynamics sections;
- activity detail charts render pace, heart rate, cadence, temperature and available running-dynamics series with a Chart.js fallback;
- elevation charts, historical running-dynamics trends and coach analysis remain planned work.

## Coach and training-engine boundary

The current Coach Review and What If features are not a general adaptive training engine.

Current behaviour:

- plan suggestions are authored in Markdown;
- What If scenarios use browser-side rules in `docs/what-if.js`;
- decisions may remain browser-local;
- the optional authenticated API can persist supported suggestion decisions;
- no server-side model continuously rewrites the plan.

Planned behaviour is defined in [`AI-COACH.md`](AI-COACH.md), [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) and [`ACTIVITY-ANALYSIS.md`](ACTIVITY-ANALYSIS.md). Those documents are contracts, not evidence that the future engine is already implemented.

## Design-system status

`docs/design-system.css` provides tokens and reusable primitives. Most existing pages still use legacy classes and page-specific styles.

The next visual migration should rebuild the home dashboard first, preserve current functionality, then progressively migrate Plan, Activities, Workout Library, Nutrition and Recovery. See [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).

## Verification

The repository currently provides:

- `npm run build:data` for the primary dashboard generator when Node/npm are available;
- `npm test` / `node --test test/pipeline.test.mjs` for Markdown schema and privacy validation;
- direct Node execution of all three generators;
- JSON parsing validation for the three generated outputs in CI;
- Node built-in test coverage for Markdown schemas, public projections, privacy leakage and deterministic meaningful output;
- JavaScript syntax checks via `node --check` as a lightweight local check.

There is no dedicated lint script or automated browser test suite at present. The pipeline tests inject a fixed `generatedAt` value so meaningful output can be compared deterministically; production generation still records the current timestamp as metadata.

## Deployment and privacy

The public dashboard is published from `docs/` through GitHub Pages. Anything in `docs/` is public. Source files under `coach/`, `health/` and private plan sections must not be copied into public JSON unless explicitly allowlisted.

The optional persistence service must keep write credentials on the server side and validate a small set of structured actions. A public browser must not receive repository write credentials.

## Known gaps

- Remaining dashboard sections still depend on legacy JSON.
- Generated timestamps remain variable metadata; tests isolate them with an injected timestamp while asserting deterministic meaningful payloads.
- The browser-local import and suggestion state is not automatically synchronised across devices.
- Weekly running progress is derived only from repository Markdown activity records; browser-local imported activities do not affect generated dashboard progress until a public activity record exists.
- FIT field availability varies by device and export; unsupported fields remain null and are not inferred beyond pace and moving-time derivation from reliable records.
- Activity time-series data and charts are local-only; Chart.js remains an optional enhancement with text fallbacks.
- The design-system primitives exist, but legacy page styles are not fully migrated.
- The What If logic is page-specific rather than a shared tested training-engine module.
- Rich FIT-derived activity analysis is implemented for local summary, lap and running-dynamics display, but not public/generated activity data.
- Elevation charts, historical trends and coach analysis are planned work.
- The workout library does not yet model exercise references, supersets, circuits or drop sets as structured data.
- Nutrition guidance is generated but the current Nutrition tab still uses its legacy payload.
- There is no formal TypeScript surface; the dashboard is currently vanilla JavaScript.

## Maintenance rule

Move durable decisions into architecture or domain contracts. Keep this document focused on current wiring, transitional behaviour and known gaps. Remove migration notes when the corresponding legacy path has been retired.
