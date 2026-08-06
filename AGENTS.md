# Training Log Agent Instructions

This repository uses a documentation-first workflow.

Before making changes, read:

- `README.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `docs/CODEX.md`
- `docs/IMPLEMENTATION-NOTES.md`

Then read the domain documentation relevant to the task:

- UI or dashboard work → `docs/DESIGN-SYSTEM.md`
- Coaching or suggestions → `docs/AI-COACH.md`
- Planning, adaptation or What If → `docs/TRAINING-ENGINE.md`
- Workout knowledge → `docs/WORKOUT-LIBRARY.md`
- Nutrition → `docs/NUTRITION-GUIDANCE.md`

Follow `docs/CODEX.md` as the repository contribution contract.

If the task is explicitly specified, follow that task rather than substituting a different roadmap item.

## Core rules

- The athlete owns the calendar.
- Never silently reschedule, replace, complete or delete planned sessions.
- Recommendations must remain optional and explainable.
- Markdown source files are authoritative.
- Generated JSON under `docs/` must not be edited manually.
- Anything under `docs/` must be treated as publicly accessible.
- Private health, injury, bodyweight, route, profile and coaching information must not leak into public generated data.
- Preserve existing behaviour unless the task explicitly changes it.
- Prefer shared helpers and reusable design-system primitives over duplicated logic.
- Distinguish clearly between current, planned and future behaviour.
- Do not invent architecture or product decisions when documentation is unclear.
- Keep changes scoped to the requested task.
- Run the relevant validation before declaring work complete.

## Workflow

For non-trivial work:

1. Inspect the existing implementation.
2. Summarise the affected architecture and proposed approach.
3. Implement the smallest coherent change.
4. Run relevant tests, generators and syntax checks.
5. Inspect the final diff.
6. Update documentation when behaviour, architecture or roadmap status changes.
7. Report files changed, validation performed and remaining limitations.

Do not merge, rewrite shared history or delete branches without explicit instruction.
