# Training Log Documentation

This directory is the documentation hub for Training Log. The repository is the single source of truth for product direction, architecture, reusable training knowledge and implementation decisions.

## Start here

| Topic | Document | Use it for |
|---|---|---|
| Product direction | [`ROADMAP.md`](../ROADMAP.md) | Priorities, completed work and future capabilities |
| System architecture | [`ARCHITECTURE.md`](../ARCHITECTURE.md) | Source-of-truth boundaries, data flow, privacy and deployment |
| Design system | [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) | Tokens, reusable CSS primitives and UI rules |
| AI coach | [`AI-COACH.md`](AI-COACH.md) | Coaching behaviour, decision rules and persistence boundaries |
| Workout library | [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md) | Workout knowledge format, generation and safety rules |
| Nutrition guidance | [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md) | Nutrition knowledge format, use and limitations |
| Implementation notes | [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md) | Current runtime, generated artefacts, known gaps and verification |
| Codex workflow | [`CODEX.md`](CODEX.md) | Documentation-first contribution protocol for AI-assisted work |
| Change history | [`CHANGELOG.md`](../CHANGELOG.md) | What changed and why |

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
- Product decisions belong in [`ROADMAP.md`](../ROADMAP.md); system decisions belong in [`ARCHITECTURE.md`](../ARCHITECTURE.md); implementation details belong in [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
- When a feature changes the architecture, update the relevant documentation in the same change.
