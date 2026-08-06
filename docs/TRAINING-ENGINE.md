# Training Engine

The Training Engine is the future planning and simulation layer for Training Log. It will combine athlete goals, schedule constraints, recent training, recovery context and reusable knowledge to propose realistic hybrid-training plans.

The athlete owns the calendar. The engine may generate, compare and recommend, but it must not silently reschedule, replace, complete or delete sessions.

## Current status

The full engine is **not implemented**.

Current foundations include:

- a Markdown-first current plan;
- human-authored plan suggestions;
- a browser-side What If simulator;
- reusable workout and nutrition knowledge;
- session-compatibility rules;
- browser-local activity imports;
- optional authenticated persistence for approved plan decisions.

This document defines the intended contract so future implementation remains consistent.

## Responsibilities

The Training Engine should eventually support:

- realistic pace and effort ranges;
- workout selection from the reusable library;
- weekly and phase-level plan generation;
- hybrid load management across running, strength and soccer;
- progression, hold and regression decisions;
- Coach Review suggestions;
- What If comparisons;
- nutrition-scenario selection;
- explicit application of user-approved changes.

It should not own private conversation history, diagnose injury or directly mutate repository files.

## Inputs

### Goal context

- goal event and date;
- target time or completion goal;
- priority of the event;
- tune-up races;
- current training phase.

### Athlete context

- current fitness evidence from recent races and completed workouts;
- training history and usual weekly load;
- preferred and unavailable training days;
- preferred long-run day;
- strength schedule;
- soccer/futsal and other sport commitments;
- travel and calendar constraints;
- private recovery, pain or injury constraints;
- user preferences and previous accepted or rejected suggestions.

### Recent training context

- completed running, strength, sport and recovery sessions;
- planned versus completed differences;
- duration, distance, pace, heart rate, cadence and elevation when available;
- subjective RPE and session notes;
- recent long-run and quality-session progression;
- current week and rolling multi-week load.

### Reusable knowledge

- [`WORKOUT-LIBRARY.md`](WORKOUT-LIBRARY.md);
- [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md);
- [`knowledge/rules/session-compatibility.md`](../knowledge/rules/session-compatibility.md);
- future pace, progression and phase rules.

## Output contract

A generated or revised plan should provide:

- phase and week purpose;
- session day and type;
- purpose of each session;
- duration or distance range;
- pace, heart-rate or RPE guidance;
- workout steps or exercise blocks;
- recovery and compatibility notes;
- assumptions and confidence;
- alternatives where schedule or recovery is uncertain.

Recommendations should use ranges rather than false-precision single values.

## Decision hierarchy

When constraints compete, use this order:

1. Safety and explicit unavailable dates.
2. User intent and non-negotiable calendar choices.
3. Goal-event requirements and key-session protection.
4. Recovery and interference between hard running, lower-body strength and soccer.
5. Sustainable consistency and volume progression.
6. Workout variety and optimisation.

The engine should never compensate for missed training by compressing excessive hard work into the remaining days.

## Training-load model

The engine should treat different activities as distinct but interacting loads.

### Running

Track at least:

- total duration and distance;
- easy versus quality volume;
- longest run;
- race-specific volume;
- high-impact and neuromuscular demand;
- heat, hills and terrain where available.

### Strength

Track at least:

- upper- versus lower-body emphasis;
- movement patterns;
- working sets and intensity;
- local muscle fatigue;
- expected running interference;
- proximity to key running sessions.

### Soccer and futsal

Treat soccer/futsal as quality and high-impact load, not easy cross-training. Consider repeated acceleration, deceleration, sprinting and change of direction.

### Recovery and cross-training

Low-impact aerobic work, mobility and recovery sessions may support training without carrying the same impact cost. They still contribute time and fatigue when long or intense.

The first implementation should favour transparent rule-based classifications over a single opaque readiness score.

## Pace engine

### Inputs

- recent race performances;
- well-executed workouts;
- current easy-run response;
- goal pace;
- terrain, heat and fatigue;
- available training volume.

### Outputs

- recovery pace;
- easy pace;
- steady pace;
- marathon pace;
- threshold pace;
- VO2-max interval pace;
- repetition pace.

### Rules

- Use pace ranges and effort ceilings.
- Separate current-fitness pace from aspirational goal pace.
- Do not prescribe unsupported goal pace simply because it matches the target result.
- Allow effort, heart rate and conditions to override pace on hot, hilly or fatigued days.
- Update ranges from repeated evidence, not one unusually good or poor session.

## Workout selection

Select a workout by matching:

1. phase purpose;
2. goal-event demands;
3. current fitness;
4. recent stimulus and missing stimulus;
5. available day and time;
6. recovery and hybrid-training compatibility;
7. workout progression history;
8. athlete preference and variety.

The engine should select from the reusable library rather than inventing unstructured sessions. A chosen template may be parameterised for duration, repetitions, recovery and pace.

## Weekly planning

A week should normally contain:

- enough low-intensity work to support consistency;
- a limited number of meaningful quality stimuli;
- a long run appropriate to the phase;
- strength and sport placed to reduce interference;
- recovery space after demanding combinations;
- clear priorities when every planned session cannot fit.

The engine must not assume every week needs the same number of sessions. Travel, soccer, strength priorities and recovery can change the structure while preserving the most useful training.

## Periodisation

A generated block may include:

- **Foundation:** aerobic consistency, tissue tolerance and sustainable strength.
- **Development:** threshold, hills, VO2 and long-run progression.
- **Race-specific:** goal-event pace, fuelling rehearsal and race-specific long runs.
- **Taper:** reduced volume while preserving useful intensity and confidence.
- **Recovery:** reduced load after races, illness, travel or accumulated fatigue.

Phase transitions should depend on time to event, consistency and completed training rather than calendar date alone.

## Progression rules

Progress only when recent evidence supports it.

Possible progression dimensions:

- weekly duration or distance;
- long-run duration;
- quality volume;
- repetition count;
- work-interval duration;
- pace or effort;
- strength repetitions or load;
- session complexity.

Prefer changing one main stressor at a time. Use a hold week when execution, recovery or schedule is uncertain. Regress volume or intensity while preserving the workout purpose when fatigue or constraints rise.

## Coach Review suggestions

Suggestions should be generated only when a meaningful difference exists between the current plan and a better-supported alternative.

Examples:

- protect a long run after added soccer;
- reduce quality volume after poor recovery;
- preserve the plan when no change is needed;
- move lower-body strength away from a race-specific session;
- adjust pace expectations for heat or terrain;
- modify the next week after a missed session without compensatory overload.

Each suggestion follows the output contract in [`AI-COACH.md`](AI-COACH.md) and offers **Apply**, **Modify** and **Keep original**.

## What If simulator

A simulation must compare the current and proposed plan without modifying the active plan.

Initial scenario types:

- skip, move, shorten or extend a session;
- change a quality block;
- add strength, soccer, hiking or recovery work;
- reduce available training days;
- add a tune-up race;
- change the goal event or target time.

Comparison output should include:

- weekly distance and duration;
- quality-session count and spacing;
- longest and race-specific session;
- strength and soccer interference;
- estimated recovery demand;
- expected goal impact;
- assumptions, uncertainty and recommendation.

The first version should be deterministic and rule-based. More advanced modelling may be added only when it remains explainable.

## Nutrition selection

The engine may select or combine scenarios from [`NUTRITION-GUIDANCE.md`](NUTRITION-GUIDANCE.md) based on today’s session, tomorrow’s key session, conditions and recovery needs.

It should output macro emphasis, hydration focus and simple examples rather than require detailed calorie tracking.

## Applying a change

```text
Engine proposal
      |
      v
Current versus proposed preview
      |
      v
User chooses Apply, Modify or Keep original
      |
      v
Server validates an allowed structured action
      |
      v
Markdown source update and decision history
      |
      v
Generated dashboard data and deployment
```

The application layer owns persistence. The Training Engine returns proposals and structured actions; it does not write directly to GitHub or storage.

## Confidence and uncertainty

Confidence describes evidence quality, not the probability of race success.

- **High:** recent relevant evidence, complete schedule context and consistent rules.
- **Medium:** useful evidence with some missing recovery, condition or schedule information.
- **Low:** sparse, contradictory or stale information.

Low confidence should produce conservative guidance, explicit assumptions and fewer irreversible changes.

## Privacy and safety

- Keep injury, bodyweight, route and private athlete context outside public generated data.
- Do not diagnose pain or promise race outcomes.
- Do not optimise weight loss through the training engine.
- Do not apply plan changes without explicit approval.
- Do not treat a mechanical-risk or recovery signal as an automatic restriction.

## Implementation milestones

1. Stabilise schemas and privacy tests for Markdown-generated data.
2. Expand workout metadata and compatibility rules.
3. Implement reusable pace-range calculations with tests.
4. Move What If rules into shared deterministic helpers.
5. Generate structured Coach Review proposals.
6. Add preview-and-apply persistence for allowed actions.
7. Implement weekly plan generation.
8. Add adaptation from completed activities and subjective feedback.
9. Evaluate more advanced modelling only after transparent rules are well tested.

Delivery status and priorities remain in [`ROADMAP.md`](../ROADMAP.md). Current runtime wiring remains in [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
