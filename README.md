# d21softball-new

An improved version of [d21softball.org](https://d21softball.org) — a site for D21 softball tournaments, rules, umpire resources, archives, and team registration.

Team registration uses one account-free, three-step TanStack Form. It currently validates and previews entries; submission storage and Stripe checkout will be connected after the Payload CMS v4 backend is built. There is no user dashboard.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React, TypeScript, file-based routing)
- [TanStack Form](https://tanstack.com/form) with Zod validation
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) components in `src/components/ui`
- Vite + pnpm

## Project structure

- `src/routes` — app pages (home, tournaments, rules, umpires, archives, hall of fame, local leagues, visit, registration)
- `src/components` — site chrome and UI components
- `src/lib` — data and helpers

## Development server

- Use Node 24.15.0 or newer for the Payload v4 canary installer. With nvm, run `nvm install` followed by `nvm use` from this directory; `.nvmrc` selects the Node 24 release line.
- Start the app with `pnpm dev` (port 3000).
- Stop it with `pnpm dev:stop`. Temporary dev servers must be terminated before finishing work; do not kill unrelated Node/Vite processes.
- If Vite uses another port because 3000 is occupied, stop only that preview with `D21_DEV_PORT=3001 pnpm dev:stop` (substitute its actual port).

## Registration form

See [the registration implementation notes](docs/registration-form.md) for the reference pattern, submission contract, draft handling, and remaining backend integration.

## Installing Payload v4

The root route uses `createRootRoute` with an explicit query-client context type because `create-payload-app@4.0.0-canary.37` does not recognize `createRootRouteWithContext`. Both APIs support the existing TanStack Router context; this change allows the installer's root-shell transformation to run.

After selecting the Node version above, run:

```bash
pnpm dlx create-payload-app@canary --use-pnpm
```

Choose installation in the existing TanStack Start project and the desired database. The local MongoDB connection `mongodb://127.0.0.1/d21softball-new` requires MongoDB to be running on this machine when the app starts.

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
