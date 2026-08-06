# Design System

The Training Log design system is a framework-free CSS foundation for the static dashboard. Its implementation is [`docs/design-system.css`](design-system.css), loaded before page-specific styles in [`docs/index.html`](index.html).

## Design intent

The interface should feel calm, modern and performance-oriented. It should favour clear hierarchy, short summaries and detail on demand over dense tables or long walls of text.

The dashboard should answer four questions quickly:

1. What should I do today?
2. Am I on track this week?
3. What does the coach want me to notice?
4. What is coming next?

The design supports dark mode as the current default and a light-theme token set.

## Product hierarchy

Use this order on the home dashboard:

1. **Today and readiness** — greeting, current block, week progress and readiness.
2. **Today’s focus** — the next planned workout or recovery action.
3. **Week overview** — compact timeline with completion states.
4. **Coach insight** — one primary recommendation, not a list of competing messages.
5. **Recovery and nutrition** — compact status summaries.
6. **Recent activity and quick actions** — secondary information below the fold.

Important numbers should be visible without expanding a card. Detailed steps, reasoning and notes should use progressive disclosure.

## Token groups

Tokens are defined on `:root` and should be used by reusable components instead of introducing local magic values.

- **Colour:** background, surfaces, text, muted text, accent, semantic status colours and borders.
- **Typography:** font stack, text sizes, display sizing and eyebrow tracking.
- **Spacing:** `--space-1` through `--space-10`.
- **Shape:** small, medium, large and pill radii.
- **Elevation:** small and medium shadows.
- **Motion:** fast and standard transitions, reduced-motion behaviour and focus ring.
- **Layering:** sticky navigation, drawer and floating-action z-index tokens.

## Reusable primitives

| Primitive | Classes | Purpose |
|---|---|---|
| Layout | `.ds-container`, `.ds-section`, `.ds-stack`, `.ds-grid` | Consistent page width, spacing and responsive grids |
| Card | `.ds-card`, `.ds-card--soft`, `.ds-card__body`, `.ds-card__header` | Shared surface and content structure |
| Button | `.ds-button--primary`, `.ds-button--secondary`, `.ds-button--ghost` | Accessible action hierarchy |
| Status | `.ds-chip`, `.ds-chip--success`, `.ds-chip--warning` | Compact state and confidence labels |
| Progress | `.ds-progress`, `.ds-progress__bar`, `.ds-ring` | Training completion and circular metrics |
| Feedback | `.ds-empty`, `.ds-skeleton` | Empty, loading and progressive-enhancement states |

## Product-level components

These are semantic compositions of the primitives. They may initially be rendered by existing JavaScript rather than a component framework.

- **Hero card:** training block, weekly progress, readiness and race context.
- **Workout card:** activity type, day, key prescription, status and optional actions.
- **Metric card:** one important value with a short label and trend or state.
- **Coach card:** one insight, confidence or status and a single primary action.
- **Activity card:** activity type, date and two to four useful metrics.
- **Nutrition card:** macro emphasis, hydration status and one practical focus.
- **Recovery card:** readiness, fatigue, sleep or subjective body status.
- **Week timeline:** seven compact, tappable day states.
- **Coach launcher:** persistent **Ask Coach** pill or compact floating action button.

## Content-density rules

- Lead with the session name, distance/duration and status.
- Keep collapsed cards to one or two short supporting lines.
- Put steps, pace ranges, rationale and caveats inside an expandable detail area.
- Avoid repeating the same guidance in dashboard, plan and coach cards.
- Use icons and status chips as reinforcement, not as the only source of meaning.
- Prefer one clear insight over several low-priority messages.
- Do not use wide comparison tables on phone layouts; stack current and proposed states.

## Responsive behaviour

### Phone

- Single-column card flow.
- Large touch targets and no horizontal scrolling.
- Bottom navigation may replace desktop navigation.
- Drawers open from the bottom or fill the viewport.
- The Ask Coach control must not cover navigation or primary actions.

### Tablet

- One- or two-column layout depending on content priority.
- Today’s focus remains visually dominant.
- Timeline and quick actions may use compact grids.

### Desktop

- Use a constrained content width and balanced two-column sections.
- Avoid stretching text cards across the full viewport.
- Keep the primary dashboard flow readable from top left to bottom right.

Responsive behaviour should be content-led rather than tied to one device model. Test representative narrow, medium and wide viewports.

## Interaction rules

- Use hover effects only as an enhancement; every action must work by touch and keyboard.
- Expand and collapse controls must expose state through `aria-expanded`.
- Drawers and dialogs must manage focus, provide an accessible name and close with Escape.
- Preserve the user’s current page context when opening the coach drawer.
- Use animation to clarify state changes, not decorate every interaction.
- Respect `prefers-reduced-motion`.

## Accessibility

- Preserve semantic headings and landmarks.
- Maintain visible keyboard focus.
- Meet readable contrast in both themes.
- Do not encode readiness or completion using colour alone.
- Use descriptive button labels rather than icon-only actions where space permits.
- Keep body text comfortably readable on mobile.

## Usage rules

1. Prefer a design-system primitive before adding a page-specific pattern.
2. Use tokens for spacing, colours, radii, shadows, motion and layering.
3. Preserve keyboard focus visibility and semantic HTML.
4. Keep touch targets usable on small screens.
5. Keep page-specific CSS local when a pattern is genuinely unique.
6. Reuse the same card structure across Dashboard, Plan and Activities where the content model matches.
7. Do not make a visual change in a documentation-only task.

## Dashboard v2 migration

The foundation exists and is linked into the dashboard, but most legacy page styles still use historical aliases in [`docs/styles.css`](styles.css) and feature stylesheets.

Migrate incrementally:

1. Establish shared tokens and primitives.
2. Rebuild the home dashboard using semantic product-level cards.
3. Add the persistent context-aware Coach launcher and drawer.
4. Migrate Plan and Activities cards.
5. Migrate Workout Library, Nutrition and Recovery views.
6. Remove legacy aliases only after all consumers have moved.

Each migration should preserve current functionality and include phone and desktop visual checks. Delivery status belongs in [`ROADMAP.md`](../ROADMAP.md); current wiring belongs in [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md).
