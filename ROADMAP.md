# Training Log Roadmap

_Last updated: 7 August 2026_

This document is the living source of truth for product direction, priorities and implementation status. Every meaningful feature decision should be reflected here as it is proposed, started, completed, deferred or changed.

See the [documentation hub](docs/README.md) for the architecture, design-system, AI-coach, activity-analysis, workout-library, nutrition and implementation contracts that support this roadmap.

## Product vision

Build a privacy-conscious hybrid training platform that combines running, strength, soccer and other activities with planning, activity analysis, nutrition guidance and coaching.

The user remains in control. The system may recommend changes, explain trade-offs and offer one-click actions, but it must not silently overwrite the training plan or force automatic rescheduling.

## Design principles

- **User control:** recommendations are optional and explainable.
- **Hybrid training:** running, strength, soccer and other activities share one calendar and activity history.
- **Privacy first:** sensitive health, bodyweight and athlete-profile information must not be published by default.
- **Markdown source of truth:** human-maintained plans, activities, coaching notes and roadmap documents live in Markdown.
- **Generated dashboard data:** JSON under `docs/` is a build artefact for the public web UI, not the authoritative record.
- **Progressive enhancement:** the dashboard remains useful when external integrations are unavailable.
- **Realistic coaching:** training pace, volume and workout selection must be grounded in current ability, goal, timeframe and available training days.

## Current release state

### Highest-priority unfinished work

The highest-priority unfinished feature is completing the Markdown-first migration: move the remaining dashboard sections out of legacy `docs/data.json` and `docs/nutrition.json`, add schema/privacy tests, and retire manual editing of those payloads. This remains the foundation for reliable coaching, workout-library, nutrition and activity-analysis features.

### Completed

- [x] GitHub Pages dashboard
- [x] Plan, Activities, Performance, Recovery, Nutrition and Coach sections
- [x] Public/private content separation started
- [x] FIT, TCX and GPX import preview foundation
- [x] Browser-local activity import
- [x] Duplicate detection for browser-local imports
- [x] Imported activity detail view
- [x] Initial mobile responsive pass
- [x] Strength, running, recovery and coaching Markdown logs

### In progress

#### Markdown-first data architecture — High priority

- [x] Establish Markdown as the intended source of truth
- [x] Document architecture and migration rules
- [x] Add a zero-dependency Markdown-to-JSON generator
- [x] Add an allowlisted public plan source in `plans/current-plan.md`
- [x] Add dated Markdown activity records
- [x] Add GitHub Actions validation and generation workflow
- [x] Load generated plan and activity data into the dashboard with a legacy fallback
- [ ] Migrate remaining dashboard sections out of `docs/data.json`
- [x] Add schema tests for malformed Markdown and private-field leakage
- [ ] Stop manually editing legacy JSON once all dashboard sections are generated

#### Garmin import and activity analysis — High priority

- [x] Import page
- [x] TCX and GPX parsing
- [x] FIT parsing foundation
- [x] Activity preview
- [x] Browser-local save
- [x] Activity details
- [x] Confirm and normalize supported FIT summary, lap and running-dynamics metrics
- [x] Preserve richer non-location FIT time-series data locally for analysis
- [ ] Improve FIT compatibility and error reporting
- [x] Add pace, heart-rate and cadence charts
- [x] Add temperature and running-dynamics charts
- [x] Add lap-level running-dynamics display
- [x] Add running-dynamics summary display
- [ ] Add running-dynamics historical trends
- [ ] Add richer interval detection
- [ ] Export an activity Markdown record
- [ ] Persist imports to the repository or a private backend
- [ ] Automatic Garmin synchronisation

#### Mobile experience — High priority

- [x] Basic responsive layout
- [x] Mobile bottom navigation foundation
- [ ] Complete mobile-first dashboard redesign
- [ ] Improve calendar and plan views on narrow screens
- [ ] Improve activity details, lap cards and charts on phones
- [ ] Test common Android and iPhone viewport sizes
- [ ] Add installable PWA support

## Near-term roadmap

### Plan intelligence and suggestions — High priority

Keep coaching suggestions directly within the Plan page rather than creating a separate page.

- Add contextual **Coach Review** indicators to upcoming workouts.
- Show the current prescription beside the suggested change.
- Explain why the change is being suggested and the expected benefit or trade-off.
- Include confidence, assumptions and any important uncertainty.
- Provide **Apply**, **Modify** and **Keep original** actions.
- Never apply a suggestion silently.
- Record whether suggestions were accepted, rejected or modified.
- Support manually authored suggestions first, then generate them from completed activities, recovery feedback and schedule constraints.
- Show a clear “No changes recommended” state when the plan remains appropriate.

### What If mode / Training Simulator — High priority

Add a **What If?** action to the Plan page that simulates a change without modifying the active plan.

Initial scenarios:

- Skip a workout.
- Move a workout to another day.
- Shorten or extend a run.
- Reduce or increase a quality block.
- Add a strength, soccer, hiking or recovery session.
- Limit the next week to fewer available training days.
- Add a tune-up race.
- Change the goal event or target time.

Comparison output:

- Current plan versus proposed plan.
- Weekly distance and training time.
- Number and spacing of quality sessions.
- Long-run and race-specific volume.
- Estimated recovery demand.
- Interference with strength or soccer.
- Expected impact on the goal, with uncertainty rather than false precision.
- A clear recommendation and explanation.

Safety and control rules:

- Simulations must not change the active plan until explicitly applied.
- Clearly separate known facts, assumptions and estimates.
- Do not present injury risk or race outcomes as certainties.
- Prefer conservative recommendations when activity or recovery data is incomplete.
- Allow the user to modify the proposed scenario before applying it.

Longer-term, personalise simulations using completed Garmin activities, subjective RPE, recovery patterns, heat response, workout history, running dynamics and previous suggestion decisions.

### Activity records

- Create one dated Markdown record per completed session.
- Support running, strength, soccer, mobility, cycling and other activities.
- Keep raw Garmin files private where practical.
- Generate public summaries without route coordinates or sensitive notes.
- Add edit, delete and duplicate-management workflows.

### Activity analysis

See [`docs/ACTIVITY-ANALYSIS.md`](docs/ACTIVITY-ANALYSIS.md) for the detailed contract.

Activity detail pages should eventually expose:

- Overview — summary, training effect, HR, pace, calories, temperature and coach observations.
- Laps — responsive lap cards or tables with pace, HR, cadence and running dynamics.
- Charts — pace, heart rate, cadence, elevation, temperature and running-dynamics overlays.
- Running Dynamics — cadence, stride length, ground contact time, GCT balance, vertical oscillation and vertical ratio.
- Coach Analysis — explainable observations using the evidence from the activity.

Historical activity analysis should support:

- pace at similar heart rate;
- heart rate at similar pace;
- cadence, stride-length and ground-contact-time trends;
- vertical oscillation and vertical-ratio trends;
- heat-adjusted performance;
- long-run and marathon-pace efficiency;
- comparison against similar-distance runs and rolling baselines.

### Strength and gym module

- Dedicated Gym page
- Push, pull, legs and custom session categories
- Sets, reps, load, RPE and duration
- Exercise history and volume trends
- Muscle-group coverage
- Planned sessions that move to Activities when completed

### Running analysis

- Weekly and monthly distance
- Long-run progression
- Tempo and threshold trends
- Interval execution
- Easy pace versus heart rate
- Lap and workout comparison
- Shoe-distance tracking

### Weekly review

- Running, strength, soccer and recovery summary
- Consistency and workload review
- Coach observations
- Lessons learned
- Recommendations for the following week

## Training engine

### Workout library

Create a broad library of sessions organised by purpose and phase.

#### Easy and aerobic

- Recovery run
- Easy run
- Easy run with strides
- Steady aerobic run
- Aerobic progression

#### Long runs

- Easy long run
- Progressive long run
- Fast-finish long run
- Marathon-pace finish
- Marathon-pace blocks
- Alternating steady and marathon pace
- Long run with tempo blocks
- Long run with controlled surges

#### Threshold and tempo

- Continuous tempo
- Cruise intervals
- Broken tempo
- Tempo ladder
- Progressive tempo
- Threshold kilometres or miles

#### VO2 max and intervals

- 200 m, 400 m, 600 m and 800 m repetitions
- 1 km and 1200 m repetitions
- Mile repeats
- Mixed-distance intervals
- Controlled sharpening sessions

#### Hills and fartlek

- Short hill sprints
- Long hill repeats
- Uphill threshold
- Hill fartlek
- One-minute on/off
- Pyramids
- Mixed fartlek

#### Race-specific and taper

- 5 km, 10 km, half-marathon and marathon-specific workouts
- Race simulations
- Tune-up sessions
- Taper sessions that retain intensity while reducing volume

Each workout template should define purpose, suitable training phase, target intensity, duration or distance range, recovery rules, progression constraints and contraindications.

### Pace engine

Inputs:

- Current fitness from recent races and completed workouts
- Goal event and target time
- Training history
- Heat, terrain and fatigue context
- Activity-analysis trends such as pace/heart-rate relationship and running dynamics
- Available training days and weekly load

Outputs:

- Recovery pace
- Easy pace
- Steady pace
- Marathon pace
- Threshold pace
- VO2-max interval pace
- Repetition pace

Paces must be ranges rather than false-precision single numbers. The engine should distinguish a pace ceiling from a target and should avoid prescribing goal pace that is unsupported by current fitness.

### Plan generator

Inputs:

- Goal event and date
- Goal time or completion goal
- Current fitness
- Available days and maximum weekly time
- Preferred long-run day
- Strength schedule
- Soccer and other sport commitments
- Travel, holidays and unavailable dates
- Injury and recovery constraints kept private

Outputs:

- Periodised plan with aerobic, development, race-specific and taper phases
- Appropriate workout variety
- Realistic volume progression
- Recovery placement around gym and soccer
- Clear purpose and pacing for every session

### Adaptive coach

- Review completed activities and subjective feedback
- Detect missed or altered sessions
- Suggest changes without applying them automatically
- Explain the reason and expected trade-off
- Provide **Apply** and **Keep original** actions
- Learn how the athlete responds to different workouts, activity-analysis trends and weekly structures

## Longer-term roadmap

- Official Garmin Connect Developer Program integration if approved
- Private local Garmin sync service as a fallback
- Two-way workout delivery to compatible devices
- Fitness, fatigue and readiness modelling
- Race prediction with uncertainty ranges
- Weather- and heat-aware pacing
- Nutrition and race-fuelling planner
- Season planning across multiple goals
- Goal and personal-record history
- Searchable activity library
- Private authentication and multi-device synchronisation
- Optional private coach sharing

## Ideas backlog

- Training-load heatmap
- Route recommendations
- Heat acclimation tracking
- Shoe lifecycle tracking
- Strength-running interference analysis
- Soccer load estimates
- Mobility and rehabilitation tracking
- Grocery and meal-planning support
- Achievement timeline
- Import from other platforms

## Maintenance rule

Update this document whenever:

- a feature is agreed upon;
- implementation starts or finishes;
- priority changes;
- a design or privacy decision changes;
- a feature is deliberately deferred or rejected;
- architecture changes affect future work.

`CHANGELOG.md` records what changed. `ARCHITECTURE.md` records how it works. This roadmap records where the project is going.
