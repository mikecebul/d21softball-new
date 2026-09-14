# d21softball-new

An improved version of [d21softball.org](https://d21softball.org) — a site for D21 softball tournaments, rules, umpire resources, archives, and team registration.

Teams register for tournaments through a multi-step form with Stripe checkout. There is no user dashboard. The backend is planned on Payload CMS v4.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React, TypeScript, file-based routing)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components in `src/components/ui`
- Vite + pnpm

## Project structure

- `src/routes` — app pages (home, tournaments, rules, umpires, archives, hall of fame, local leagues, visit, registration)
- `src/components` — site chrome and UI components
- `src/lib` — data and helpers

## Development server

- Start the app with `pnpm dev` (port 3000).
- Stop it with `pnpm dev:stop`. Temporary dev servers must be terminated before finishing work; do not kill unrelated Node/Vite processes.

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start dev server on port 3000 |
| `pnpm dev:stop`  | Stop the dev server           |
| `pnpm build`     | Production build              |
| `pnpm preview`   | Preview the production build  |
| `pnpm test`      | Run tests with Vitest         |
| `pnpm lint`      | Lint with ESLint              |
| `pnpm typecheck` | Type-check with TypeScript    |
| `pnpm format`    | Format files with Prettier    |

## Adding UI components

Add shadcn/ui components with:

```bash
npx shadcn@latest add button
```

Then import them, e.g.:

```tsx
import { Button } from "@/components/ui/button"
```
