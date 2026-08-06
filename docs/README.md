# Training Log Documentation

This directory is the documentation hub for Training Log. The repository is the single source of truth for product direction, architecture, reusable training knowledge and implementation decisions.

## Start here

| Topic | Document | Use it for |
|---|---|---|
| Product direction | [`ROADMAP.md`](../ROADMAP.md) | Priorities, completed work and future capabilities |
| System architecture | [`ARCHITECTURE.md`](../ARCHITECTURE.md) | Source-of-truth boundaries, data flow, privacy and deployment |
| Design system | [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | Tokens, reusable UI patterns, dashboard hierarchy and responsive rules |
| AI coach | [`AI-COACH.md`](AI-COACH.md) | Coaching behaviour, context, recommendation and persistence boundaries |
| Training engine | [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) | Pace, planning, progression, hybrid load and What If contracts |
| Workout library | [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md) | Workout knowledge format, structured sessions, progression and substitutions |
| Nutrition guidance | [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md) | Macro emphasis, scenario selection, practical examples and limitations |
| Implementation notes | [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md) | Current runtime, generated artefacts, known gaps and verification |
| Codex workflow | [`CODEX.md`](CODEX.md) | Documentation-first contribution and definition-of-done rules |
| Change history | [`CHANGELOG.md`](../CHANGELOG.md) | What changed and why |

## Which document wins?

Use these boundaries when information appears in more than one place:

- [`ROADMAP.md`](../ROADMAP.md) owns priority and delivery status.
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) owns durable system and privacy decisions.
- Domain documents in `docs/` own behaviour and data contracts.
- [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md) owns current wiring and migration gaps.
- Source Markdown under `plans/`, `activities/`, `coach/`, `health/` and `knowledge/` owns actual records and reusable content.
- Generated JSON under `docs/` is never authoritative.

## Source records

- [`activities/`](../activities/) — completed activity logs and public summaries.
- [`plans/`](../plans/) — current plan, plan suggestions and schedule drafts.
- [`coach/`](../coach/) — private athlete context and coach observations.
- [`health/`](../health/) — private recovery and health context.
- [`knowledge/`](../knowledge/) — reusable workout, nutrition, sport and compatibility knowledge.

## Documentation rules

- Markdown source files are authoritative; generated JSON is not edited by hand.
- Public dashboard content must pass through an explicit allowlist.
- Private health, profile, injury, location and coaching context stays outside public build artefacts.
- Distinguish current, planned and future behaviour explicitly.
- Do not claim a documented future capability is already implemented.
- When a feature changes architecture, behaviour or data contracts, update the relevant documentation in the same change.
- Keep cross-links relative so they work both on GitHub and in local repository viewers.
