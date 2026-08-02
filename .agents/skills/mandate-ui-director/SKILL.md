---
name: mandate-ui-director
description: "Use whenever designing, implementing, revising, or reviewing any visible player-facing screen, layout, component, map, document, dialogue, portrait presentation, responsive state, or visual interaction in MANDATE: 1983. Do not use for backend-only, database-only, or narrative-writing-only tasks."
---

# Direct MANDATE: 1983 UI Work

Apply the repository's visual direction and require evidence from the rendered application for every player-facing change.

## Required Inputs

1. Read the repository-root `AGENTS.md`.
2. Read [references/design-system.md](references/design-system.md).
3. Read [references/visual-review-checklist.md](references/visual-review-checklist.md).
4. Inspect the current implementation before editing.
5. Identify the screen's narrative purpose, primary action, and secondary actions.
6. Enumerate every relevant UI state before implementation: loading, empty, populated, error, disabled or unavailable, mobile, tablet, desktop, long content, and a long customized family name.

## Implementation Process

1. State a short implementation plan.
2. Implement the smallest complete, integrated change.
3. Use real, typed game data flowing through production boundaries; do not substitute disconnected mock data for integration.
4. Preserve strong visual hierarchy, responsive composition, keyboard operation, visible focus, screen-reader labels, reduced-motion behavior, and high-contrast support.
5. Provide loading, empty, and error states wherever data or actions can be unavailable.
6. Use documents, maps, offices, newspapers, television, classified files, photographs, stamps, and other physical government objects when they serve the screen's narrative purpose.
7. Use original, game-specific SVG icons for political concepts. Reserve generic icon libraries for mundane utility actions.

## Visual Direction Gates

Enforce a premium, original 1980s political-thriller presentation with period-appropriate materials. Do not copy the interface or protected visual expression of *Suzerain* or another game.

Reject:

- Generic SaaS dashboards, empty dashboard grids, and modern smartphone-style desktop UI.
- Default Tailwind or component-library appearance.
- Glassmorphism, neon cyberpunk styling, pixel art, and cartoon farming-game styling.
- Emoji used as production icons.
- Large modern rounded cards everywhere, excessive gradients, bright rainbow charts, and unnecessary decorative animation.
- Debug UI in production, plain initials as final portraits, and placeholder art presented as final.
- Hover-only actions, color-only status indicators, tiny text, and invisible focus.

## Rendered Verification

After implementation:

1. Run the actual browser application.
2. Use Playwright or the available browser tool to test the rendered page.
3. Test the required responsive layouts and content states.
4. Test keyboard navigation and visible focus.
5. Run automated accessibility checks and perform manual accessibility inspection.
6. Capture screenshots at the required viewports.
7. Inspect every screenshot visually against the review checklist.
8. Correct visual, interaction, responsive, and accessibility defects.
9. Repeat the affected checks after corrections.

A page is not complete merely because it compiles, renders, passes automated tests, or has a correct-looking DOM structure. Completion requires inspection of the visible rendered page.

## Generated Image Assets

When image generation is available:

- Generate only original assets with no real-person likenesses or copyrighted game assets.
- Save reusable generation prompts under `.prompts/` and keep style descriptions consistent across related assets.
- Inspect crop, readability, period accuracy, visual consistency, and placement inside the real UI before accepting an asset.
- Never treat an asset as final before it has been reviewed in its rendered context.

## Required Report

Report only verification actually executed. Include the implementation scope, UI states exercised, viewports tested, accessibility and keyboard checks run, screenshot paths, defects found and fixed, remaining limitations, and skipped or blocked checks.
