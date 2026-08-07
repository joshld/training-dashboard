# Activity Analysis

Activity Analysis defines how Training Log should import, display and learn from completed activities. The goal is to make the dashboard a useful analysis tool, not only a log of Garmin summaries.

This document covers FIT import, activity detail views, lap analysis, running dynamics, charts, historical comparisons and future coach/training-engine use.

## Current status

The full activity-analysis experience is **not implemented**.

Current foundations include:

- browser-local FIT, TCX and GPX import preview foundations;
- imported activity detail view;
- normalized FIT session, lap and non-location record metrics stored locally;
- Overview, Laps and Running Dynamics sections in imported activity details;
- public activity summaries generated from Markdown records;
- current dashboard activity cards;
- training-engine and coach documentation that can consume activity evidence later.

The first extraction milestone is complete. Charts, historical comparisons, Coach Analysis and public/private persistence remain future work.

## Product goal

Training Log should answer questions Garmin summaries do not make obvious:

- Did I become more efficient at the same pace or heart rate?
- Did cadence, stride length or ground-contact time change as fatigue built?
- Was the final third of the run controlled or deteriorating?
- Did heat, hills, soccer or gym fatigue affect this session?
- Is this a low, moderate or high recovery-cost session?
- What should the coach learn from this run?

Activity Analysis is the evidence layer for future coaching and planning decisions.

## FIT import scope

The FIT importer should extract every supported metric that is useful for training analysis, while preserving the raw activity file or enough normalised detail for future parser improvements.

### Summary metrics

- activity type;
- start time and timezone;
- distance;
- elapsed time;
- timer time;
- moving time where available or derivable;
- average and best pace/speed;
- elevation gain/loss where available;
- calories;
- aerobic and anaerobic training effect where available;
- average and maximum heart rate;
- average and maximum cadence;
- average temperature;
- device/source metadata.

### Running dynamics

- average run cadence;
- maximum run cadence;
- average stride length;
- average ground contact time;
- average ground contact time balance;
- average vertical oscillation;
- average vertical ratio;
- lap-level running dynamics where available;
- time-series running dynamics where available.

### Laps and splits

- lap number;
- lap start time;
- lap distance;
- lap elapsed/timer/moving time;
- average and best pace/speed;
- average and maximum heart rate;
- average and maximum cadence;
- calories;
- average temperature;
- lap-level running dynamics.

### Time-series records

- timestamp;
- GPS position, subject to privacy rules;
- distance;
- speed or pace;
- heart rate;
- cadence;
- altitude/elevation;
- temperature;
- stride length;
- ground contact time;
- ground contact balance;
- vertical oscillation;
- vertical ratio.

## Privacy boundary

FIT files may contain sensitive information, especially route coordinates, timestamps, device identifiers and location patterns.

Public generated data must not include:

- route coordinates unless explicitly allowed;
- exact home/work start or finish locations;
- private notes;
- injury, health or bodyweight context;
- detailed private nutrition records;
- device identifiers that are not needed for the public dashboard.

The importer should separate:

- **raw private activity source** — original FIT/TCX/GPX and full time series;
- **private analysis data** — detailed route, record stream and sensitive annotations;
- **public summary data** — allowlisted fields safe for the dashboard.

Public summaries must be produced by explicit allowlist, not by removing sensitive fields after building a broad object.

## Activity detail views

Each completed activity should eventually expose five primary views.

### Overview

High-level summary and key observations:

- distance;
- duration;
- average pace;
- average and maximum heart rate;
- calories;
- training effect;
- temperature;
- recovery cost;
- one or two coach observations.

### Laps

Per-lap cards or a responsive table showing:

- time;
- cumulative time;
- distance;
- average pace;
- average and maximum heart rate;
- cadence;
- stride length;
- ground contact time;
- ground contact balance;
- vertical oscillation;
- vertical ratio;
- temperature.

On mobile, lap data should avoid wide horizontal tables. Use compact cards with expandable details.

### Charts

Interactive or progressively enhanced charts should support:

- pace/speed;
- heart rate;
- cadence;
- elevation;
- temperature;
- stride length;
- ground contact time;
- ground contact balance;
- vertical oscillation;
- vertical ratio.

Charts should allow overlays where useful, such as pace plus heart rate or cadence plus stride length. The page must remain useful if Chart.js or another optional charting dependency is unavailable.

### Running dynamics

A dedicated running-dynamics section should show:

- average cadence;
- maximum cadence;
- average stride length;
- average ground contact time;
- ground contact balance;
- vertical oscillation;
- vertical ratio.

Where history exists, show comparison to relevant baselines such as the last 4-8 weeks, similar-distance runs or similar-effort runs.

Example:

```text
Cadence
169 spm
+3 spm versus recent easy-run average

Ground Contact Time
260 ms
-6 ms versus recent easy-run average

Stride Length
1.03 m
+0.05 m versus recent easy-run average
```

### Coach analysis

Coach analysis should turn metrics into explainable observations.

Examples:

- cadence stayed stable as pace increased;
- ground contact time decreased during the final third;
- stride length improved without a heart-rate spike;
- vertical ratio rose late, suggesting fatigue or terrain effect;
- heart rate stayed controlled for the pace;
- recovery cost appears low, moderate or high.

Coach observations must state the evidence used and avoid over-interpreting one activity.

## Historical analysis

Training Log should trend metrics across weeks and months.

Useful comparisons include:

- pace at similar heart rate;
- heart rate at similar pace;
- cadence trend;
- stride-length trend;
- ground-contact-time trend;
- vertical oscillation and vertical-ratio trend;
- heat-adjusted performance;
- long-run efficiency;
- marathon-pace efficiency;
- fatigue change across the final third of comparable runs;
- similar-route or similar-distance comparisons.

The dashboard should support comparing two activities and comparing one activity against rolling baselines.

## Derived insights

Derived metrics should be transparent and conservative.

Potential insights:

- **Efficiency improvement:** faster pace at equal/lower heart rate with stable or improved mechanics.
- **Fatigue signature:** cadence, stride length, vertical ratio or heart rate deteriorates late in the session.
- **Heat impact:** pace/heart-rate relationship worsens in higher temperature.
- **Strength interference:** lower-body fatigue markers appear after gym sessions.
- **Readiness support:** mechanics and heart rate look normal for the planned stimulus.

These insights are supporting evidence, not medical conclusions or automatic plan changes.

## Training-engine integration

Activity Analysis provides evidence to [`TRAINING-ENGINE.md`](TRAINING-ENGINE.md).

The training engine may use activity-analysis trends to support:

- fatigue estimation;
- readiness assessment;
- progression and hold decisions;
- recovery-cost estimates;
- pace-range updates;
- detection of improving running economy;
- detection of deteriorating mechanics;
- Coach Review recommendations;
- What If scenario comparisons.

The engine should use trends and repeated evidence, not a single unusually good or poor activity.

## Design relationship

Activity detail pages should follow [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md):

- overview first;
- compact cards on mobile;
- detail on demand;
- clear chart fallbacks;
- no colour-only meaning;
- touch-friendly lap and chart interactions;
- context-aware Ask Coach entry point.

## Implementation milestones

1. **Complete** — Confirm and normalize supported FIT summary, lap and running-dynamics metrics.
2. **Complete** — Preserve richer non-location imported activity data in a local structure.
3. Define public activity-summary allowlists and privacy tests.
4. **Partial** — Add activity-detail sections for Overview, Laps, Charts and Running Dynamics; Coach Analysis remains.
5. **Complete** — Add lap-level running-dynamics display where supplied by the export.
6. **Partial** — Add time-series charts for pace, heart rate, cadence, temperature and available running dynamics; elevation remains.
7. **Partial** — Add running-dynamics charts; historical comparisons remain.
8. Feed validated activity-analysis features into Coach Review and the Training Engine.

Delivery priority belongs in [`ROADMAP.md`](../ROADMAP.md). Current wiring belongs in [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
