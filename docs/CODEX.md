# Codex Contribution Guide

This is the repository-specific operating guide for Codex and other AI-assisted contributors. It is subordinate to the user’s request and repository safety rules, and it is intended to keep future work aligned with the documented architecture.

## Before changing code

1. Read [`README.md`](../README.md), [`ARCHITECTURE.md`](../ARCHITECTURE.md), [`ROADMAP.md`](../ROADMAP.md) and [`CHANGELOG.md`](../CHANGELOG.md).
2. Read the relevant knowledge and source records for the feature.
3. Identify the highest-priority unfinished roadmap item.
4. Summarise the current architecture, affected data boundary and implementation plan.
5. Identify missing or stale documentation and update it when the feature warrants it.
6. Only then edit application files.

## Implementation rules

- Follow the Markdown-first source-of-truth model.
- Prefer reusable design-system primitives and shared helpers.
- Do not duplicate parsing, rendering or decision logic.
- Preserve existing functionality and progressive enhancement behaviour.
- Keep public/private boundaries explicit; never publish private health or profile data accidentally.
- Do not edit generated JSON by hand.
- Keep the dashboard usable when optional APIs, Chart.js or generated overlays are unavailable.
- Update architecture or implementation notes when the runtime/data flow changes.

## Validation rules

Run the most relevant checks available for the change:

```powershell
npm run build:data
node scripts/build-workout-library.mjs
node scripts/build-nutrition-guidance.mjs
```

Validate generated JSON and run `node --check` on changed JavaScript. If a command is unavailable, state the limitation and use the closest equivalent. Do not claim lint or tests passed when the repository has no corresponding script.

## Git workflow

- Use descriptive `feature/...`, `fix/...` or `docs/...` branches; do not use `codex/...` in branch names.
- Keep commits logical and separate. Use clear imperative commit messages.
- Inspect `git status` and the diff before staging.
- Stage only files belonging to the current task.
- Do not merge, rewrite history or delete branches without explicit instruction.

## Documentation placement

- Product direction and priorities: [`ROADMAP.md`](../ROADMAP.md).
- Architecture and privacy boundaries: [`ARCHITECTURE.md`](../ARCHITECTURE.md).
- Reusable UI rules: [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md).
- Coach behaviour: [`AI-COACH.md`](AI-COACH.md).
- Training knowledge contracts: [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md) and [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md).
- Current implementation and migration gaps: [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
