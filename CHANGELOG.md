# Changelog

All notable changes to Training Log should be recorded here. This file describes what changed; `ROADMAP.md` describes what comes next.

## Unreleased

### Added

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

- Established Markdown files as the intended human-readable source of truth.
- Reclassified `docs/data.json` as a temporary/generated dashboard payload rather than the long-term authoritative training record.
- Reduced personal detail in the public repository README.
- Upgraded generated dashboard data to schema version 2 with plan suggestions.

### Known limitations

- Imported activities stored in browser localStorage do not sync across devices.
- Plan-suggestion decisions and saved What If scenarios are browser-local and do not yet update the Markdown plan automatically.
- The first What If engine uses transparent rules and simple natural-language matching rather than a server-side coaching model.
- FIT compatibility still needs broader testing.
- The dashboard is still partly maintained through legacy JSON while remaining sections are migrated.
- Mobile layout requires further device testing and refinement.

## Maintenance

Update this changelog whenever a user-visible feature, architecture decision, privacy boundary or important fix is committed.
