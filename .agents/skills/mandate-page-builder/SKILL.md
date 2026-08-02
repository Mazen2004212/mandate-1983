---
name: mandate-page-builder
description: "Use when implementing or substantially revising one complete player-facing page or major screen in MANDATE: 1983, including its typed data integration, responsive states, interactions, accessibility, tests, and visual verification. Do not use for backend-only services, database migrations, narrative-writing-only tasks, or tiny isolated style changes."
---

# Build a Complete Player-Facing Page

Use `mandate-page-builder` to control completeness and integration. Load and follow `mandate-ui-director` to control visual direction and rendered visual quality. Use both skills together for every new or substantially revised player-facing page.

## Understand the Page

Before editing:

1. Read the repository-root `AGENTS.md`.
2. Read this skill, [references/page-contract.md](references/page-contract.md), and [references/delivery-checklist.md](references/delivery-checklist.md).
3. Load and follow `mandate-ui-director`, including both of its references.
4. Inspect related routes, components, types, tests, and design documentation.
5. Run the existing application when available.
6. Inspect the existing rendered page when one exists.
7. Identify the page's narrative purpose, primary action, and secondary actions.
8. Identify information that must remain hidden from the player.
9. Identify every game system that supplies or consumes the page's data.
10. State a short implementation plan.

## Define the Page Contract

Complete the template in [references/page-contract.md](references/page-contract.md) before implementation. Define the route, title, narrative purpose, actions, input data, mutations, authorization, accessibility, tests, visual verification, and every relevant state:

- Loading, empty, populated, error, and disabled or unavailable.
- Permission denied when applicable.
- Long content and long customized family names.
- Mobile, tablet, and desktop.
- Offline or failed network when relevant.
- Save conflict or stale revision when relevant.

Do not build a disconnected static mockup.

## Enforce Architecture Boundaries

- Use Server Components by default in Next.js. Use Client Components only for actual browser interaction.
- Keep TypeScript strict. Do not use `any`.
- Type props, domain objects, action inputs, and action results.
- Validate untrusted boundaries with Zod.
- Keep game-state calculations outside React components.
- Never mutate persistent game state directly from presentation code.
- Authorize protected actions on the server and make mutations idempotent.
- Use real, typed representative game data.
- Never hard-code customized family names or put authored scenario text in generic UI components.
- Do not scatter database calls through visual child components.
- Extract reusable components only when the abstraction is genuinely shared; prefer page-specific composition when it strengthens narrative identity.
- Separate domain data, application actions, persistence, presentation, styling, and content definitions.

## Implement Complete States

Implement every relevant state: loading, empty, populated, error, disabled or unavailable, permission denied, long content, long customized family names, slow network, mobile, tablet, and desktop.

- Do not treat a spinner alone as a complete loading experience. Preserve layout and narrative context where possible.
- Explain failures, preserve safe user progress, offer a recovery action, and never expose technical secrets.
- Explain why an empty state exists and what player action can create content while preserving the game's narrative style.

## Implement Real Interactions

Give every action an accessible name and appropriate hover, visible focus, pressed, disabled, pending, success, and error states. Prevent duplicate submission.

Require confirmation for irreversible decisions, signing major laws, declaring war, deleting saves, ending a political period, dismissing important officials, and destroying intelligence evidence. Do not interrupt harmless navigation with confirmation.

Do not create fake buttons. Every visible button must perform a real action, navigate to a valid destination, or be disabled with a clear explanation.

## Meet Responsive Requirements

Treat desktop as primary while supporting 1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 768×1024, and 390×844.

Prevent horizontal page overflow, clipped controls, hidden primary actions, and hover-only interaction. Maintain 44px minimum touch targets, readable mobile documents, appropriate drawers or full-screen overlays, mobile-friendly maps, long-name and long-number handling, and operation at 200% browser zoom.

## Test the Page

Choose the smallest appropriate combination of unit, component, integration, Playwright browser, accessibility, and screenshot tests. A new major page must normally include Playwright coverage for:

- The successful populated state.
- A loading or delayed state.
- An error state.
- Keyboard navigation.
- A mobile viewport.
- The main player action.

Never delete or weaken an existing test merely to make the page pass.

## Verify the Rendered Result

1. Run the actual browser application with realistic representative data.
2. Capture before screenshots when revising an existing page.
3. Capture after screenshots at the required viewports.
4. Follow the `mandate-ui-director` rendered-review process.
5. Inspect the screenshots visually.
6. Check the browser console and failed network requests.
7. Run accessibility scanning and manual checks.
8. Fix detected defects and repeat affected checks.

A page is not complete merely because TypeScript compiles, the route loads, unit tests pass, the DOM contains expected elements, or a screenshot file exists. Inspect the screenshot itself.

## Deliver an Evidence-Based Report

Use [references/delivery-checklist.md](references/delivery-checklist.md). Report the page, route, narrative purpose, primary action, changed files, integrated data, implemented states, executed tests and results, checked viewports, screenshot paths, accessibility checks, browser-console status, remaining limitations, blocked work, and skipped checks with reasons.

Never claim a check passed unless it was executed and its result inspected.
