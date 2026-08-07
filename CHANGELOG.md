# Changelog

All notable changes to Training Log should be recorded here. This file describes what changed; `ROADMAP.md` describes what comes next.

## Unreleased

### Added

- Local FIT activity analysis with normalized summary, lap and running-dynamics metrics, plus privacy-safe time-series preservation for future charts.
- Node built-in schema, privacy-leakage and deterministic-generation tests for the Markdown-first data pipeline.
- Sanitised the current public plan status so lower-back context remains private.
- Living product roadmap with training-engine, workout-library, pace-engine and adaptive-coaching plans.
- Markdown-first architecture documentation and generator pipeline.
- Planned Thursday arms workout with biceps and triceps prescriptions.
- Browser-local Garmin activity import and imported activity details.
- Initial mobile navigation and responsive layout improvements.
- Markdown-authored plan suggestions generated into the public dashboard payload.
- Coach Review panel on the Plan page with current-versus-suggested comparisons.
- Browser-local **Apply**, **Modify**, and **Keep original** decisions for plan suggestions.
- Confidence, reasoning, and expected-impact fields for each suggestion.
- First usable **What If?** training simulator on the Plan page.
- Scenario support for skipping, moving, shortening or extending workouts, adding soccer or strength, and replacing a workout with rest.
- Current-versus-proposed comparisons for weekly distance, quality sessions, longest run and recovery outlook.
- Copy-for-coach and browser-local scenario history actions.

### Changed

- Current plan weekly running progress now derives from completed public running records within the plan date range, with manual progress retained as a fallback and source metadata exposed.
- Established Markdown files as the intended human-readable source of truth.
- Reclassified `docs/data.json` as a temporary/generated dashboard payload rather than the long-term authoritative training record.
- Reduced personal detail in the public repository README.
- Upgraded generated dashboard data to schema version 2 with plan suggestions.
- Redesigned plan workouts as compact, colour-coded cards with expandable details.
- Collapsed coach recommendations into concise summaries with detail-on-demand.
- Reworked What If results into visual comparison cards with stronger hierarchy.
- Reduced spacing and text density on mobile Plan views.

### Known limitations

- Imported activities stored in browser localStorage do not sync across devices.
- Plan-suggestion decisions and saved What If scenarios are browser-local and do not yet update the Markdown plan automatically unless the authenticated persistence service is configured.
- The first What If engine uses transparent rules and simple natural-language matching rather than a server-side coaching model.
- FIT compatibility still needs broader testing.
- The dashboard is still partly maintained through legacy JSON while remaining sections are migrated.
- Mobile layout requires further device testing and refinement.

## Maintenance

Update this changelog whenever a user-visible feature, architecture decision, privacy boundary or important fix is committed.
