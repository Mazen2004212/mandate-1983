# MANDATE: 1983 Repository Instructions

## Project Scope

Build an English-only, browser-based political narrative strategy game in an original fictional Cold War world. The player governs through political dialogue, cabinet meetings, documents, laws and decrees, economic policy, an interactive political map, diplomacy, intelligence reports, family scenarios, elections, coup attempts, border conflicts, and strategic decisions during full wars.

Do not introduce a controllable walking character, WASD movement, real-time combat, a 3D world, Unity, Godot, farming, or live AI-generated narrative during gameplay.

## Planned Stack

Use the Next.js App Router, React, strict TypeScript, Tailwind CSS with a custom design system, Supabase PostgreSQL/Auth/Storage with Row Level Security, Zod, Vitest, React Testing Library, Playwright, axe-core, pnpm, GitHub Actions, and Vercel when implementation begins.

## Engineering Rules

- Inspect existing files and applicable repository instructions before editing.
- Keep TypeScript strict. Do not use `any`; model uncertain data explicitly and narrow it safely.
- Keep game simulation and domain logic separate from React components.
- Make game-state mutations typed, deterministic, validated, idempotent, and independently testable.
- Store authored scenarios outside UI components and validate all scenario content with schemas.
- Never hard-code player-customized family names. Insert them through safe, validated template tokens.
- Keep immutable game definitions separate from mutable runtime save state.
- Never expose Supabase service-role credentials or other server-only secrets to browser code.
- Apply Row Level Security to all user-owned data.
- Design choice resolution and persistence to reject duplicate resolution and concurrent save overwrites.
- Never commit real secrets. Add or update `.env.example` whenever environment variables are introduced.
- Pin production dependency versions.
- Add relevant tests for every major game-system change. Never delete or weaken tests merely to make them pass.
- Never report a test, build, screenshot inspection, or deployment as successful unless it was actually executed and its result inspected.

## UI and Accessibility

- Use a premium 1980s political-thriller identity: dark wood, brass, paper, ink, forest green, navy, burgundy, cream, and old gold.
- Use semi-realistic editorial character portraits and period-appropriate government documents, newspapers, television, radio, maps, and offices.
- Avoid generic SaaS dashboards, glassmorphism, neon cyberpunk styling, pixel art, default-looking Tailwind or component-library UI, and emoji used as production icons.
- Do not present plain initials as final portraits or placeholder artwork as final artwork.
- Remove unfinished debug controls from production surfaces.
- Support desktop, tablet, and mobile layouts.
- Ensure keyboard operation and visible focus states.
- Implement loading, empty, error, and populated states for player-facing screens.
- After visible UI work, run the application, capture screenshots, and inspect them visually.
- Perform an accessibility review after player-facing UI work, including automated checks where applicable.

## Narrative and Content

- Create original fictional countries, characters, events, factions, and history.
- Do not copy protected creative content from *Suzerain* or any other game.
- Use authored, deterministic scenarios rather than live-generated narrative.
- Offer meaningful choices without an obviously perfect answer.
- Model immediate and delayed political, faction, character, regional, and media consequences.
- Preserve character memory of promises, betrayals, protection, appointments, and previous decisions.
- Keep fictional war and coup material strategic; do not provide real-world operational instructions.
- Keep presentation teen-appropriate. Exclude explicit sexual content, nudity, gore, and graphic torture.
- Every character involved in romance must be an adult.

## Required Workflow

1. Read this `AGENTS.md`.
2. Inspect the relevant repository files.
3. Identify and use the applicable repository skill, if one exists.
4. State a brief implementation plan.
5. Make the smallest complete, integrated change.
6. Run relevant validation and tests.
7. For visible UI work, run the application and capture screenshots.
8. Inspect captured screenshots visually.
9. Fix discovered defects before reporting completion.
10. Report completed, partial, skipped, and blocked work accurately.

## Definition of Done

Compilation alone does not make a feature complete.

A player-facing feature is complete only when it:

- Works in the actual browser application.
- Uses real, typed game data.
- Behaves responsively across supported viewport sizes.
- Supports keyboard access and visible focus.
- Handles loading, empty, and error states.
- Has relevant automated tests.
- Has been visually inspected when applicable.
- Produces no ordinary browser-console errors.
- Is documented accurately.
