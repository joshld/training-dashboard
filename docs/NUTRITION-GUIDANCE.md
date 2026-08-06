# Nutrition Guidance

Nutrition guidance is reusable, scenario-based coaching knowledge. It is intended for practical training support and is not a medical nutrition plan.

## Sources and generation

- [`knowledge/nutrition/guidance.md`](../knowledge/nutrition/guidance.md) — authoritative Markdown scenarios.
- [`scripts/build-nutrition-guidance.mjs`](../scripts/build-nutrition-guidance.mjs) — parser, required-field validation and generator.
- [`docs/nutrition-guidance.json`](nutrition-guidance.json) — generated structured guidance.
- [`docs/nutrition.json`](nutrition.json) — legacy dashboard payload still consumed by the current Nutrition tab.

The generated guidance library and the legacy dashboard payload are currently separate. Migrating the Nutrition tab to consume `nutrition-guidance.json` is part of the broader generated-data migration tracked in [`ROADMAP.md`](../ROADMAP.md).

## Entry contract

Each scenario is a level-two Markdown section with these required fields:

- `ID` — unique lowercase kebab-case identifier.
- `Purpose` — the training context.
- `Protein`, `Carbohydrates`, `Fat` — practical macro guidance expressed as ranges or context-dependent guidance.
- `Hydration` — fluid and sodium guidance appropriate to the scenario.
- `Simple Examples` — familiar foods separated by semicolons.
- `Coach Focus` — the main decision or caution.

Optional fields include `During Training` and `Tags`.

## Principles

- Match fuelling to session duration, intensity, climate and recovery needs.
- Keep food familiar around key sessions and races.
- Avoid prescribing false precision when body size, tolerance or conditions are unknown.
- Treat hydration and sodium as context-dependent rather than a reason to force fluid.
- Keep private dietary, medical or body-composition details out of public generated data.

## Current scenarios

The library covers easy runs, recovery days, intervals, tempo, long runs, pre-long-run preparation, upper- and lower-body strength, soccer/futsal, double sessions, race week, carb loading, race morning, post-race recovery and hot-weather training.
