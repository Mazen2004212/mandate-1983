# MANDATE: 1983

**MANDATE: 1983** is an original, browser-based political narrative strategy game set in a fictional Cold War world. As the newly elected President of the Republic of Varenne, the player must govern through cabinet politics, economic policy, laws, intelligence, diplomacy, family pressure, and the consequences of difficult decisions.

The project is English-only and deliberately avoids a real-time combat or 3D-world format. Its focus is political institutions, authored narrative, and choices with immediate and delayed consequences.

## Current status

The repository is in active MVP development. The current browser build is an accessible, responsive institutional-dossier interface foundation; it does **not** yet provide a complete playable route, authentication, or persistent saves.

Implemented foundations include:

- A Next.js application shell and reusable interface components.
- Strict TypeScript and Zod contracts for game content and state.
- Deterministic scenario eligibility, scheduling, choice mutation, delayed effects, and calculation systems.
- Exact integer-based treasury arithmetic and MVP outcome evaluation.
- Unit, integration, accessibility, and end-to-end test infrastructure.

See [docs/PROGRESS.md](docs/PROGRESS.md) for the verified implementation record and [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md) for the first-playable boundary.

## World

The game opens in 1983 after a narrow election in Varenne. The incoming administration inherits disputed public accounts, weakened reserves, fragile institutions, and an unresolved border crisis. No political bloc has an unquestioned mandate, and every decision carries a cost.

The setting, characters, institutions, and history are original. [docs/STORY_BIBLE.md](docs/STORY_BIBLE.md) is the project canon.

## Technical approach

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS design system
- Zod-validated authored content and runtime state
- Deterministic, independently testable domain logic
- Vitest, React Testing Library, Playwright, and axe-core
- pnpm workspace and GitHub Actions

The intended MVP will add secure Supabase-backed authentication and saves, with row-level security and idempotent state mutations.

## Getting started

### Prerequisites

- Node.js 22.12 or later
- pnpm 11.9.0

### Install and run

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Copy `.env.example` to `.env.local` if you need to set the public development environment label. Do not commit credentials or other secrets.

### Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Repository guide

| Path             | Purpose                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| `src/app`        | Next.js routes and application shell                                                |
| `src/components` | Reusable, accessible UI components                                                  |
| `src/content`    | Validated authored-content contracts and runtime content systems                    |
| `src/domain`     | Pure game-state, initialization, arithmetic, randomization, and calculation logic   |
| `docs`           | MVP scope, story canon, architecture, systems design, roadmap, and progress records |
| `e2e`            | Playwright end-to-end tests                                                         |

## Documentation

- [MVP scope](docs/MVP_SCOPE.md)
- [Story bible](docs/STORY_BIBLE.md)
- [Systems design](docs/SYSTEMS_DESIGN.md)
- [Content architecture](docs/CONTENT_ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Progress tracker](docs/PROGRESS.md)

## Contributing

Read [AGENTS.md](AGENTS.md) before making changes. In particular, preserve the separation between presentation, authored content, and deterministic domain logic; do not add unverified gameplay claims; and run the relevant checks for every change.
