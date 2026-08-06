# Changelog

All notable changes to Training Log should be recorded here. This file describes what changed; `ROADMAP.md` describes what comes next.

## Unreleased

### Added

- Living product roadmap with training-engine, workout-library, pace-engine and adaptive-coaching plans.
- Markdown-first architecture documentation.
- Planned Thursday arms workout with biceps and triceps prescriptions.
- Browser-local Garmin activity import and imported activity details.
- Initial mobile navigation and responsive layout improvements.

### Changed

- Established Markdown files as the intended human-readable source of truth.
- Reclassified `docs/data.json` as a temporary/generated dashboard payload rather than the long-term authoritative training record.
- Reduced personal detail in the public repository README.

### Known limitations

- Imported activities stored in browser localStorage do not sync across devices.
- FIT compatibility still needs broader testing.
- The dashboard is still partly maintained through manual JSON updates until the generator is implemented.
- Mobile layout requires further device testing and refinement.

## Maintenance

Update this changelog whenever a user-visible feature, architecture decision, privacy boundary or important fix is committed.