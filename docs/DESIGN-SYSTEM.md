# Design System

The Training Log design system is a framework-free CSS foundation for the static dashboard. Its implementation is [`docs/design-system.css`](design-system.css), loaded before the page-specific styles in [`docs/index.html`](index.html).

## Design intent

The interface should feel calm, modern and performance-oriented: clear hierarchy, compact decision-support cards, strong mobile behaviour and restrained visual emphasis. The system supports both dark mode (the current default) and a light-theme token set.

## Token groups

Tokens are defined on `:root` and should be used by reusable components instead of introducing local magic values.

- **Colour:** background, surfaces, text, muted text, accent, semantic status colours and borders.
- **Typography:** font stack, text sizes, display sizing and eyebrow tracking.
- **Spacing:** `--space-1` through `--space-10`.
- **Shape:** small, medium, large and pill radii.
- **Elevation:** small and medium shadows.
- **Motion:** fast and standard transitions, reduced-motion behaviour and focus ring.
- **Layering:** sticky and navigation z-index tokens.

## Reusable primitives

| Primitive | Classes | Purpose |
|---|---|---|
| Layout | `.ds-container`, `.ds-section`, `.ds-stack`, `.ds-grid` | Consistent page width, spacing and responsive grids |
| Card | `.ds-card`, `.ds-card--soft`, `.ds-card__body`, `.ds-card__header` | Shared surface and content structure |
| Button | `.ds-button--primary`, `.ds-button--secondary`, `.ds-button--ghost` | Accessible action hierarchy |
| Status | `.ds-chip`, `.ds-chip--success`, `.ds-chip--warning` | Compact state and confidence labels |
| Progress | `.ds-progress`, `.ds-progress__bar`, `.ds-ring` | Training completion and circular metrics |
| Feedback | `.ds-empty`, `.ds-skeleton` | Empty, loading and progressive-enhancement states |

## Usage rules

1. Prefer a design-system primitive before adding a page-specific pattern.
2. Use tokens for new spacing, colours, radii, shadows and transitions.
3. Preserve keyboard focus visibility and semantic HTML.
4. Keep touch targets usable on small screens.
5. Use `prefers-reduced-motion` for non-essential animation.
6. Keep page-specific CSS in the page stylesheet when a pattern is genuinely local.
7. Do not make a visual change in a documentation-only task.

## Migration status

The foundation exists and is linked into the dashboard, but most legacy page styles still use their historical aliases in [`docs/styles.css`](styles.css) and feature stylesheets. Migrating existing pages to the primitives is a product task, tracked in the mobile/dashboard redesign work in [`ROADMAP.md`](../ROADMAP.md), not a documentation task.
