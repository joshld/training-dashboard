# Training Log Architecture

_Last updated: 6 August 2026_

## Architecture decision

Training Log uses a **Markdown-first source model**. The [documentation hub](docs/README.md) links the product, architecture, design, coaching and implementation contracts that support this model.

Human-readable Markdown files are authoritative. JSON and other assets under `docs/` exist to serve the GitHub Pages dashboard and should be generated rather than maintained manually. The current runtime still has a deliberate legacy fallback; see [Implementation Notes](docs/IMPLEMENTATION-NOTES.md).

```text
Markdown source records
        ↓
Validation and build script
        ↓
Sanitised generated JSON
        ↓
GitHub Pages dashboard
```

## Source-of-truth areas

```text
activities/        Completed activity records and readable logs
plans/             Current and historical training plans
coach/             Private coaching notes and athlete context
health/            Private recovery and nutrition records
ROADMAP.md         Product direction and feature status
CHANGELOG.md       Implemented changes
ARCHITECTURE.md    System structure and data rules
```

## Public dashboard area

```text
docs/
  index.html
  import.html
  *.js
  *.css
  data.json               Legacy dashboard payload
  nutrition.json          Legacy nutrition payload
  generated-data.json     Generated plan/activity overlay
  workout-library.json    Generated reusable workout library
  nutrition-guidance.json Generated nutrition guidance library
```

Anything under `docs/` must be treated as publicly accessible. Hiding an element with CSS or JavaScript does not make its source data private.

## Intended activity structure

The current aggregate files can remain during migration, but the target is one record per session:

```text
activities/
  2026/
    08/
      2026-08-03-upper-pull.md
      2026-08-04-upper-push.md
      2026-08-05-intervals.md
      2026-08-05-lower-body.md
```

A future activity record should use predictable front matter:

```yaml
---
id: 2026-08-05-intervals
date: 2026-08-05T06:30:00+10:00
status: completed
activity: running
workout_type: intervals
duration_seconds: 3121
distance_km: 9.0
source: garmin-fit
public: true
---
```

The body remains readable Markdown and can contain workout purpose, splits, subjective feedback and coach notes. Private fields must not be copied into public build artefacts unless explicitly allowed.

## Intended plan structure

Plans should be human-readable Markdown documents with structured front matter or consistent tables. They should describe:

- week and date range;
- planned sessions;
- target distance or duration;
- workout steps and pace ranges;
- completion status;
- plan revisions and rationale.

The public dashboard receives only the fields required to render its calendar and workout cards. The reusable knowledge contracts are documented in [Workout Library](docs/WORKOUT-LIBRARY.md) and [Nutrition Guidance](docs/NUTRITION-GUIDANCE.md).

## Build pipeline target

The current build scripts are:

- `scripts/build-dashboard-data.mjs` reads the current plan, plan suggestions and public activity records into `docs/generated-data.json`.
- `scripts/build-workout-library.mjs` reads the workout knowledge base into `docs/workout-library.json`.
- `scripts/build-nutrition-guidance.mjs` reads nutrition scenarios into `docs/nutrition-guidance.json`.

The build pipeline should:

1. Read Markdown and front matter from approved source directories.
2. Validate required fields and reject malformed records.
3. Apply a public-field allowlist.
4. Generate dashboard JSON into `docs/`.
5. Avoid route coordinates, health notes, bodyweight and private coaching context.
6. Fail the build if a sensitive or unknown field is about to be published.
7. Keep generated files deterministic so changes are reviewable.

## Import flow

### Current

```text
FIT / TCX / GPX
      ↓
Browser parser
      ↓
Preview
      ↓
Browser localStorage
      ↓
Activities view on that device
```

### Next

```text
FIT / TCX / GPX
      ↓
Parser and validation
      ↓
Activity Markdown export
      ↓
Repository or private storage
      ↓
Build dashboard JSON
      ↓
Available on every authorised device
```

### Long-term

```text
Garmin sync service
      ↓
Raw activity ingestion
      ↓
Deduplication and normalisation
      ↓
Private activity store
      ↓
Sanitised public/private dashboard views
```

## Privacy boundary

Public build data may include broad training information such as activity type, distance, duration, pace and generic readiness labels.

Private source records may include injury context, pain details, bodyweight, exact nutrition logs, route coordinates, athlete profile data and personal coaching discussion.

Publication must be opt-in at the field level through an allowlist, not achieved by removing fields after the fact.

## Migration plan

1. Continue updating existing Markdown logs immediately.
2. Create roadmap, changelog and architecture documents.
3. Add individual dated activity records for new sessions.
4. Define front matter schemas.
5. Add generators for the remaining dashboard sections and retire the legacy `docs/data.json` and `docs/nutrition.json` dependencies.
6. Migrate existing plan and activity content.
7. Mark generated JSON clearly and stop editing it manually.
8. Add automated validation in GitHub Actions.

## Non-goals for the current static release

- Storing Garmin credentials in browser code
- Writing directly to GitHub without secure authentication
- Treating localStorage as permanent or cross-device storage
- Publishing private athlete or health data
- Allowing automatic plan changes without user confirmation

## Related contracts

- [Design system](docs/DESIGN-SYSTEM.md) defines reusable UI tokens and primitives.
- [AI coach](docs/AI-COACH.md) defines recommendation, simulation and persistence boundaries.
- [Implementation Notes](docs/IMPLEMENTATION-NOTES.md) records what is currently wired versus planned.
