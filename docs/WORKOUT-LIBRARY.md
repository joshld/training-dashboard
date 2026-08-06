# Workout Library

The workout library is reusable training knowledge, separate from the current athlete plan. Markdown sources are authoritative; [`docs/workout-library.json`](workout-library.json) is a generated public/runtime artefact.

The library should explain not only what a workout is, but why it exists, when it is appropriate, how it progresses and what other training it may interfere with.

## Sources

- [`knowledge/running/workouts.md`](../knowledge/running/workouts.md) — running templates and progressions.
- [`knowledge/strength/workouts.md`](../knowledge/strength/workouts.md) — gym and strength templates.
- [`knowledge/sports-and-recovery.md`](../knowledge/sports-and-recovery.md) — soccer, futsal, cycling, walking and mobility.
- [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md) — compatibility and spacing rules.
- [`scripts/build-workout-library.mjs`](../scripts/build-workout-library.mjs) — parser, validation and generator.
- [`docs/workout-library.json`](workout-library.json) — generated output; do not edit manually.

## Current entry format

Each generated entry is a level-two Markdown section with bold metadata fields. At minimum:

```markdown
## Easy Run

**ID:** `running-easy-run`

**Purpose:** Build aerobic volume at low cost.

**Intensity:** Conversational effort.

**Tags:** `running`, `easy`, `aerobic`
```

The generator currently recognises optional fields including intensity, volume, recovery demand, compatibility, contraindications, progression, common mistakes, load profile and planning guidance. IDs must be unique lowercase kebab-case values.

Reference sections that are not workouts may omit an ID and must not be emitted as workout records. Actual workout records require both `ID` and `Purpose`.

## Categories

The current generated categories are `running`, `strength` and `mixed`. The intended domain categories are:

- **Running:** easy, recovery, long, threshold, tempo, interval, hill, fartlek, race-specific and taper sessions.
- **Strength:** upper push, upper pull, arms, lower strength, power, core and marathon-maintenance sessions.
- **Sport:** futsal, outdoor soccer, small-sided games and other high-intensity sport.
- **Cross-training:** cycling, swimming, rowing, hiking and other low-impact aerobic work.
- **Recovery:** walking, mobility and other low-fatigue supportive sessions.

The category model may become more granular in a future schema version. The generator must not silently reinterpret existing IDs when that migration occurs.

## Workout structure

A workout is more than a flat list of exercises or steps. The future schema should support ordered blocks such as:

- warm-up;
- main set;
- cool-down;
- superset;
- giant set;
- circuit;
- drop set;
- progression block;
- finisher;
- optional or conditional block.

Example strength structure:

```text
Warm-up
  Barbell curls — 21s

Giant set — 3 rounds
  Dumbbell skull crushers
  Hammer curls
  Band pushdowns
  Cross-body curls
  Rest 3 minutes after the full round

Strength superset
  Narrow-grip bench press
  Supinated dumbbell curl drop set
```

The runtime model should preserve block order, intra-block rest and between-round rest rather than flattening this into unrelated exercise rows.

## Exercise references

A future exercise library should allow strength templates to reference reusable exercises instead of repeating all exercise metadata. Exercise records may include:

- stable ID and display name;
- movement pattern;
- primary and secondary muscle groups;
- equipment;
- unilateral or bilateral execution;
- compatible substitutions;
- technique cues;
- local and systemic fatigue profile.

This is planned architecture, not current generated functionality.

## Progression and regression

Every template should eventually define:

- **Progression trigger:** evidence required before adding distance, duration, repetitions, load or intensity.
- **Progression step:** the smallest useful increase.
- **Hold rule:** when to repeat the current prescription.
- **Regression option:** how to reduce volume, intensity or complexity while preserving the session purpose.
- **Stop or modify condition:** pain, severe fatigue, poor recovery, heat or schedule conflict.

For running, progress useful time at the intended intensity before increasing pace. For strength, prefer adding controlled repetitions before load when appropriate. Avoid progressing several stressors at once.

## Equipment substitutions

Substitutions should preserve the movement pattern, target muscles and intended fatigue profile before matching the exact exercise.

Examples:

- cable pushdowns → resistance-band pushdowns;
- overhead cable extensions → overhead band extensions;
- barbell press → dumbbell or machine press;
- unsupported row → chest-supported row when lower-back fatigue must be limited.

A substitution must not quietly add lower-body, spinal or grip fatigue before a key run.

## Hybrid-training compatibility

Templates should describe compatibility with other sessions because the same workout can be appropriate or inappropriate depending on weekly placement.

Important rules include:

- Treat soccer and futsal as quality/high-impact load rather than easy cross-training.
- Avoid heavy lower-body strength immediately before races, important intervals or race-specific long runs.
- Upper-body strength usually has lower running interference but can still add systemic fatigue if volume is excessive.
- Protect key sessions by spacing high-impact or high-neuromuscular work.
- Do not compensate for a missed workout by compressing excessive hard training into the remaining days.

Durable compatibility rules belong in [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md), not duplicated inside every template.

## Authoring rules

1. Describe purpose before prescription.
2. Prefer ranges, effort descriptions and decision rules over false precision.
3. State recovery demand and incompatible pairings where relevant.
4. Include progression constraints and when to hold or modify the session.
5. Keep athlete-specific details in the plan or coach context, not the reusable library.
6. Use stable IDs; rename display labels without breaking references.
7. Run the generator after source changes and validate the resulting JSON.
8. Add parser tests before making a field newly mandatory across the whole library.

## Relationship to planning

The workout library supplies building blocks to the future training engine. It does not decide what the athlete should do by itself.

Template selection still requires current fitness, goal, phase, schedule, recovery, recent activities and hybrid-training constraints. See [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) for selection and progression rules and [`ROADMAP.md`](../ROADMAP.md) for implementation status.
