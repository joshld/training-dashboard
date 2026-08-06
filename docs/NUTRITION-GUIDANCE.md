# Nutrition Guidance

Nutrition guidance is reusable, scenario-based coaching knowledge. Its purpose is to answer a practical question: **what macro emphasis, hydration focus and simple food choices support today’s training?**

It is not intended to become a detailed calorie tracker, food database or medical nutrition plan.

## Sources and generation

- [`knowledge/nutrition/guidance.md`](../knowledge/nutrition/guidance.md) — authoritative Markdown scenarios.
- [`scripts/build-nutrition-guidance.mjs`](../scripts/build-nutrition-guidance.mjs) — parser, required-field validation and generator.
- [`docs/nutrition-guidance.json`](nutrition-guidance.json) — generated structured guidance.
- [`docs/nutrition.json`](nutrition.json) — legacy dashboard payload still consumed by the current Nutrition tab.

The generated guidance library and legacy dashboard payload are currently separate. Migrating the Nutrition tab to consume `nutrition-guidance.json` is tracked in [`ROADMAP.md`](../ROADMAP.md).

## Entry contract

Each scenario is a level-two Markdown section with these required fields:

- `ID` — unique lowercase kebab-case identifier.
- `Purpose` — the training context.
- `Protein`, `Carbohydrates`, `Fat` — practical macro guidance expressed as ranges or context-dependent emphasis.
- `Hydration` — fluid and sodium guidance appropriate to the scenario.
- `Simple Examples` — familiar foods separated by semicolons.
- `Coach Focus` — the main decision or caution.

Optional fields include `During Training` and `Tags`.

Example:

```markdown
## Interval Day

**ID:** `nutrition-interval-day`

**Purpose:** Support a high-quality running session and recovery.

**Protein:** Maintain the normal daily target.

**Carbohydrates:** High; place useful carbohydrate before and after the session.

**Fat:** Moderate; avoid an unusually heavy meal close to training.

**Hydration:** Start hydrated and replace fluid according to conditions and sweat loss.

**Simple Examples:** oats and fruit; chicken and rice; yoghurt and banana

**Coach Focus:** Fuel the quality session rather than treating it like an easy day.
```

## Output contract

The dashboard or coach should present nutrition guidance as a short daily summary:

- **Protein target or emphasis**
- **Carbohydrate target or emphasis**
- **Fat target or emphasis**
- **Hydration focus**
- **One-sentence coaching focus**
- **A small set of simple meal or snack examples**

Exact gram targets may be calculated from bodyweight only in a private context. Public generated guidance should contain reusable ranges and scenario language, not private bodyweight or food logs.

## Scenario selection

Nutrition guidance should consider both today and the next important session.

Examples:

- Easy run today and rest tomorrow → standard training-day guidance.
- Strength today and long run tomorrow → combine protein recovery with higher carbohydrate preparation.
- Long run today → include pre-session, during-session and recovery guidance.
- Soccer/futsal → treat as a high-intensity session with meaningful carbohydrate and hydration needs.
- Hot weather → elevate hydration and sodium guidance without forcing a universal fluid volume.

When several scenarios apply, the system should merge compatible guidance and identify one primary focus. It should not display several repetitive cards.

## Principles

- Match fuelling to session duration, intensity, climate and recovery needs.
- Keep protein consistently adequate across training and recovery days.
- Increase carbohydrate emphasis around long, intense or double-session days.
- Keep food familiar around key sessions and races.
- Avoid false precision when body size, tolerance, conditions or actual intake are unknown.
- Treat hydration and sodium as context-dependent rather than a reason to force fluid.
- Use simple examples rather than requiring detailed meal logging.
- Keep private dietary, medical and body-composition details out of public generated data.

## User feedback

The first useful feedback model should remain lightweight, for example:

- followed well;
- partly followed;
- not followed;
- protein on target / close / missed;
- carbohydrate preparation adequate / low;
- hydration good / uncertain / poor.

This feedback may inform later coaching, but it must not be treated as a precise dietary record.

## Current scenarios

The library covers easy runs, recovery days, intervals, tempo, long runs, pre-long-run preparation, upper- and lower-body strength, soccer/futsal, double sessions, race week, carb loading, race morning, post-race recovery and hot-weather training.

## Safety and scope

- Guidance is for training support, not treatment of a medical condition.
- The system should not encourage restrictive eating, rapid weight loss or compensatory behaviour.
- Race fuelling and hydration should be tested in training before race day.
- Individual gastrointestinal tolerance, climate and sweat rate can override generic examples.

See [`AI-COACH.md`](AI-COACH.md) for the coaching boundary and [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) for how session context selects guidance.
