# AI Coach and Coaching Rules

Training Log’s coach is currently a decision-support layer, not an autonomous model or medical system. It combines human-authored coaching context, structured plan suggestions, transparent What If rules and optional authenticated persistence.

## Source context

- [`coach/athlete-profile.md`](../coach/athlete-profile.md) — private athlete goals, schedule, preferences and constraints.
- [`coach/observations.md`](../coach/observations.md) — current observations and coaching priorities.
- [`health/recovery.md`](../health/recovery.md) — private recovery context.
- [`plans/current-plan.md`](../plans/current-plan.md) — current prescription and coach guidance.
- [`plans/plan-suggestions.md`](../plans/plan-suggestions.md) — human-authored current-versus-suggested changes.
- [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md) — spacing, interference and recovery rules.

## Current capabilities

### Coach tab

The Coach tab presents current observations and provides a link to continue a private coaching conversation. The repository does not store that external conversation as a generated public dataset.

### Coach Review

Plan suggestions show the current prescription, proposed change, reason, expected impact, priority and confidence. Browser-local actions are **Apply**, **Modify** and **Keep original**. When the optional API is configured and the user signs in with GitHub, decisions can be written back to the repository through [`api/plan/decision.js`](../api/plan/decision.js).

### What If simulator

The Plan page can simulate skipping, moving, shortening or extending sessions, adding strength or soccer and replacing a workout with rest. It compares the current and proposed plan using transparent rules. It does not modify the active plan unless an explicit persistence workflow applies a suggestion.

## Coaching principles

- Preserve user control; recommendations never silently overwrite the plan.
- Explain the reason, trade-off, assumptions and uncertainty.
- Treat soccer/futsal and lower-body strength as meaningful training load.
- Protect key sessions by considering spacing, recovery and interference.
- Prefer conservative decisions when activity or recovery data is incomplete.
- Do not diagnose injury or present race outcomes as certain.
- Judge trends and repeated evidence rather than one workout in isolation.

## Decision flow

```text
Private athlete and recovery context
              +
Current plan + completed activities + knowledge rules
              |
              v
      Human-authored suggestion or transparent simulation
              |
              v
 Current vs proposed explanation with uncertainty
              |
       +------+------+
       |             |
       v             v
 Keep original   Explicit user action
                 |
                 v
       Browser-local decision
                 |
       Optional signed API persistence
```

## Future model boundary

Any future server-side or model-assisted coach must retain the same safety contract: private inputs stay private, outputs remain explainable, suggestions are reviewable, and plan changes require explicit user confirmation. See [`ROADMAP.md`](../ROADMAP.md) for the adaptive-coach and training-engine roadmap.
