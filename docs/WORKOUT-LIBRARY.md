# Workout Library

The workout library is reusable training knowledge, separate from the current athlete plan. Its Markdown sources are authoritative; the JSON file is a generated public/runtime artefact.

## Sources

- [`knowledge/running/workouts.md`](../knowledge/running/workouts.md) — running templates and progressions.
- [`knowledge/strength/workouts.md`](../knowledge/strength/workouts.md) — gym and strength templates.
- [`knowledge/sports-and-recovery.md`](../knowledge/sports-and-recovery.md) — soccer, futsal, cycling, walking and mobility.
- [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md) — compatibility and spacing rules.
- [`scripts/build-workout-library.mjs`](../scripts/build-workout-library.mjs) — parser, validation and generator.
- [`docs/workout-library.json`](workout-library.json) — generated output; do not edit manually.

## Entry format

Each generated entry is a level-two Markdown section with bold metadata fields. At minimum:

```markdown
## Easy Run

**ID:** `running-easy-run`

**Purpose:** Build aerobic volume at low cost.

**Intensity:** Conversational effort.

**Tags:** `running`, `easy`, `aerobic`
```

The generator recognises optional fields including intensity, volume, recovery demand, compatibility, contraindications, progression, common mistakes, load profile and planning guidance. IDs must be unique lowercase kebab-case values.

## Categories

The current generator groups entries into `running`, `strength` and `mixed`. The knowledge base covers easy/aerobic work, long runs, tempo, intervals, hills, race-specific work, gym sessions and other sports/recovery activities.

## Authoring rules

1. Describe purpose before prescription.
2. Prefer ranges, effort descriptions and decision rules over false precision.
3. State recovery demand and incompatible pairings where relevant.
4. Include progression constraints and when to hold or modify the session.
5. Keep athlete-specific details in the plan or coach context, not the reusable library.
6. Run the generator after source changes and validate the resulting JSON.

## Roadmap relationship

The library supports the future pace engine and plan generator described in [`ROADMAP.md`](../ROADMAP.md). It is not yet a full adaptive prescription engine: selecting the right template still requires current fitness, goal, schedule, recovery and injury context.
