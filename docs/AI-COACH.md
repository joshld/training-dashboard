# AI Coach and Coaching Rules

Training Log’s coach is a decision-support layer. The athlete owns the calendar and remains the final decision-maker; the coach may explain, compare and propose, but it must not silently reschedule, replace, complete or delete sessions.

The current application combines human-authored coaching context, structured plan suggestions, transparent What If rules and optional authenticated persistence. It is not currently an autonomous model, medical system or injury-diagnosis service.

## Product contract

The coach must:

- preserve user control and require explicit confirmation before changing the plan;
- explain the reason, trade-off, assumptions and uncertainty behind a recommendation;
- treat running, strength, soccer/futsal and recovery work as one combined training load;
- use the minimum private context required for the task;
- distinguish current facts from estimates and future projections;
- remain useful when optional APIs, generated overlays or external integrations are unavailable.

The coach must not:

- force automatic rescheduling or veto a user decision;
- present injury risk, readiness or race outcomes as certain;
- diagnose pain or replace medical assessment;
- expose private profile, health, route, bodyweight or nutrition details in public generated data;
- apply arbitrary client-supplied patches to plan files.

## Context sources

### Private athlete context

- [`coach/athlete-profile.md`](../coach/athlete-profile.md) — goals, schedule, preferences and constraints.
- [`coach/observations.md`](../coach/observations.md) — current observations and coaching priorities.
- [`health/recovery.md`](../health/recovery.md) — recovery and health context.

### Plan and activity context

- [`plans/current-plan.md`](../plans/current-plan.md) — current prescription and coach guidance.
- [`plans/plan-suggestions.md`](../plans/plan-suggestions.md) — human-authored current-versus-suggested changes.
- [`activities/`](../activities/) — completed-session records and public summaries.

### Reusable knowledge

- [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md) — spacing, interference and recovery rules.
- [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md) — reusable workout contracts.
- [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md) — scenario-based macro and hydration guidance.
- [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) — future planning, simulation and adaptation rules.

## Context-aware interaction

The planned universal **Ask Coach** control should provide page context without making the user repeat obvious information.

Examples:

- Dashboard — today’s session, week status and current coach focus.
- Plan — selected week, workout or active What If scenario.
- Activities — the selected activity and relevant comparison history.
- Nutrition — today’s training context and applicable nutrition scenario.
- Recovery — recent load and available recovery feedback.

Page context is a convenience, not permission to take action. The coach still previews any proposed mutation and waits for explicit confirmation.

## Current capabilities

### Coach tab

The Coach tab presents current observations and links to a private coaching conversation. The repository does not store that external conversation as a generated public dataset.

### Coach Review

Plan suggestions show the current prescription, proposed change, reason, expected impact, priority and confidence. Browser-local actions are **Apply**, **Modify** and **Keep original**. When the optional API is configured and the user signs in with GitHub, validated decisions can be written back through [`api/plan/decision.js`](../api/plan/decision.js).

### What If simulator

The Plan page can simulate skipping, moving, shortening or extending sessions, adding strength or soccer and replacing a workout with rest. It compares the current and proposed plan using transparent browser-side rules. A simulation does not modify the active plan.

## Decision priorities

When several considerations compete, use this order:

1. **Safety and explicit constraints** — pain, injury guidance, unavailable dates and user-defined non-negotiables.
2. **User intent** — the requested goal, preferred schedule and explicit choices.
3. **Key-session protection** — races, race-specific long runs and important quality sessions.
4. **Recovery and interference** — spacing of hard running, lower-body strength and soccer/futsal.
5. **Consistency and sustainable progression** — preserve useful training without compensatory overload.
6. **Optimisation** — pace, volume and workout variation only after the higher priorities are satisfied.

The coach should not “make up” missed training by compressing excessive load into the remaining days.

## Recommendation output

A structured recommendation should contain:

- **Context:** what prompted the review.
- **Current plan:** the relevant existing prescription.
- **Suggested change:** one clear proposal, or “No change recommended”.
- **Reason:** the main evidence and rule used.
- **Expected impact:** likely benefit and trade-off.
- **Assumptions:** missing information or inferred conditions.
- **Confidence:** high, medium or low, with a short explanation.
- **Actions:** Apply, Modify or Keep original when an actionable change exists.

Confidence is not a probability of success. It describes how complete and consistent the available evidence is.

## Action and persistence boundary

```text
Private context + plan + activities + reusable rules
                        |
                        v
          Recommendation or simulation preview
                        |
                        v
         Explanation, assumptions and confidence
                        |
              +---------+---------+
              |                   |
              v                   v
       Keep original       Explicit user action
                                  |
                                  v
                    Validate allowed mutation
                                  |
                       +----------+----------+
                       |                     |
                       v                     v
               Browser-local state   Optional signed API
                                             |
                                             v
                                  Markdown source update
                                             |
                                             v
                                  Regenerate public JSON
```

The write API must identify the authenticated account, validate that the requested action is allowed, re-read the current source revision and reject stale or arbitrary patches. The browser must never contain repository credentials.

## Failure behaviour

When required context is unavailable or contradictory, the coach should:

- state what is missing;
- avoid false precision;
- prefer a conservative option;
- preserve the current plan unless the user chooses otherwise;
- offer a small number of clear alternatives rather than inventing certainty.

When optional services fail, the dashboard should fall back to read-only or browser-local behaviour and explain that persistence is unavailable.

## Safety boundaries

- Pain or injury discussion should focus on reducing load, monitoring symptoms and seeking appropriate professional assessment when warranted.
- Nutrition guidance is practical training support, not a medical diet or eating-disorder intervention.
- Heat, hydration and race-fuelling guidance must account for individual tolerance and conditions rather than prescribe universal exact values.
- Coaching should judge trends and repeated evidence rather than one isolated workout.

## Future adaptive coach

A future server-side or model-assisted coach may combine completed activities, subjective RPE, recovery patterns, training history, weather and previous decisions. It must retain the same contract:

- private inputs stay private;
- reasoning remains inspectable;
- uncertainty is explicit;
- actions are previewed;
- plan changes require confirmation;
- the athlete can modify or reject every proposal.

See [`ROADMAP.md`](../ROADMAP.md) for delivery status and [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md) for the planning and simulation contract.
