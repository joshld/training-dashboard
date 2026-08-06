# Training Knowledge Base

This directory is the structured source of truth for reusable training knowledge used by the coach, plan generator, What If simulator and future workout builder.

## Scope

- `running/` — running workout templates and progressions
- `strength/` — strength-session templates and exercise substitutions
- `sports/` — soccer and other sport-load templates
- `recovery/` — recovery and mobility sessions
- `rules/` — compatibility, spacing and coaching rules

## Template principles

Every workout should define:

- a stable identifier;
- purpose and training stimulus;
- suitable goals and phases;
- intensity guidance using pace, heart rate and/or RPE;
- normal duration or distance range;
- expected recovery demand;
- compatibility with running, strength and sport sessions;
- contraindications and common mistakes;
- progression and regression options;
- tags for search and plan generation.

The library should provide ranges and decision rules rather than false precision. The coach must still account for the athlete's current fitness, goal, schedule, recovery and injury context.
