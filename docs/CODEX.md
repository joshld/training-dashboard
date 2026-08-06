# Codex Contribution Guide

This is the repository-specific working agreement for Codex and other AI-assisted contributors. It is subordinate to the user’s explicit request and repository safety rules. Its purpose is to keep future work aligned with the documented architecture without making Codex the product owner.

## Instruction precedence

Use this order when instructions conflict:

1. The user’s explicit request for the current task.
2. Repository safety and privacy constraints.
3. Durable decisions in [`ARCHITECTURE.md`](../ARCHITECTURE.md).
4. Product priorities and status in [`ROADMAP.md`](../ROADMAP.md).
5. Domain contracts under `docs/` and `knowledge/`.
6. Existing implementation patterns where they do not conflict with the above.

Do not invent a major architecture, dependency or product direction to fill a documentation gap. Record a TODO or request a decision instead.

## Before changing files

1. Read [`README.md`](../README.md), [`ARCHITECTURE.md`](../ARCHITECTURE.md), [`ROADMAP.md`](../ROADMAP.md) and [`CHANGELOG.md`](../CHANGELOG.md).
2. Read [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md) to understand what is actually wired.
3. Read the task-specific contracts and source records.
4. Inspect the relevant application files.
5. Summarise the scope, affected data boundary and implementation plan.
6. Identify documentation that must change with the implementation.
7. Only then edit files.

If the user names a task, implement that task. Do not replace it with the highest-priority roadmap item. Use the roadmap to resolve unspecified follow-on work, not to override explicit instructions.

## Task-specific reading

| Task | Required context |
|---|---|
| Dashboard or page redesign | [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md), relevant HTML/CSS/JavaScript and mobile roadmap items |
| Coach or suggestions | [`AI-COACH.md`](AI-COACH.md), [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md), suggestion sources and persistence code |
| Workout library | [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md), `knowledge/running/`, `knowledge/strength/`, sport/recovery knowledge and generator |
| Nutrition | [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md), `knowledge/nutrition/` and generator |
| Plan generation or What If | [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md), [`AI-COACH.md`](AI-COACH.md), current plan and compatibility rules |
| Import or activity history | [`ARCHITECTURE.md`](../ARCHITECTURE.md), import scripts, activity records and privacy boundary |

## Implementation rules

- Follow the Markdown-first source-of-truth model.
- Preserve the athlete-owned calendar; never add silent automatic plan changes.
- Prefer reusable design-system primitives and shared helpers.
- Do not duplicate parsing, rendering, validation or decision logic.
- Preserve progressive enhancement and useful read-only fallbacks.
- Keep public and private data boundaries explicit; anything under `docs/` is public.
- Do not edit generated JSON by hand.
- Validate write actions as structured, permitted operations.
- Update architecture or implementation notes when runtime, persistence or data flow changes.
- Keep scope tight and avoid unrelated cleanup unless requested.

## Documentation-only tasks

- Describe the current implementation accurately.
- Distinguish **current**, **planned** and **future** behaviour.
- Preserve established terminology and cross-links.
- Do not change application files or generated artefacts.
- Do not claim an unimplemented capability exists.
- Leave unresolved product decisions as TODOs rather than silently choosing them.

## Validation

Run the checks relevant to the files changed:

```powershell
npm run build:data
node --test test/pipeline.test.mjs
node scripts/build-workout-library.mjs
node scripts/build-nutrition-guidance.mjs
```

Also parse generated JSON, run `node --check` on changed JavaScript, use `git diff --check`, and inspect UI changes at phone and desktop widths. If a command or test suite does not exist, state that limitation. Never claim a check passed when it was not run.

## Git workflow

- Use descriptive `feature/...`, `fix/...` or `docs/...` branches.
- Keep commits logical and use clear imperative messages.
- Inspect `git status`, staged files and the complete diff before committing.
- Stage only files belonging to the current task.
- Do not merge or rewrite shared history without explicit instruction.
- Prefer a pull request for multi-file or architectural work.

## Definition of done

A task is complete only when:

- the requested behaviour or documentation scope is complete;
- existing behaviour outside the task remains intact;
- relevant validation has passed or limitations are reported;
- the public/private data boundary has been reviewed;
- user-facing work considers loading, empty, error and unavailable-service states;
- documentation and roadmap status are updated when warranted;
- the final summary lists files changed, checks run, remaining limitations and the next logical step.

## Review checklist

- Does the result match the user’s actual request?
- Is current behaviour clearly separated from future intent?
- Could information intended to remain private reach `docs/`?
- Does any action change the plan without explicit approval?
- Is logic duplicated or hidden in page-specific code?
- Does the UI remain usable on a phone and when optional services are unavailable?
- Are generated files reproducible and source files authoritative?

## Documentation placement

- Product direction: [`ROADMAP.md`](../ROADMAP.md).
- Architecture and privacy: [`ARCHITECTURE.md`](../ARCHITECTURE.md).
- UI rules: [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).
- Coach behaviour: [`AI-COACH.md`](AI-COACH.md).
- Planning and simulation: [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md).
- Training knowledge: [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md) and [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md).
- Current runtime and gaps: [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
- Change history: [`CHANGELOG.md`](../CHANGELOG.md).
