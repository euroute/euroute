# Contributing to Euroute

Thanks for your interest. Euroute is a small project, so the process is light.

## Running it locally

Requirements: [Bun](https://bun.sh) — the canonical package manager for this
repository. Node.js 20+ with npm works too, but do not commit a generated
`package-lock.json`.

```sh
bun install
cp .env.example .env   # fill in your own values
bun run dev
```

You need your own Supabase project. Apply the SQL files in
`supabase/migrations/` in order to get the schema, row-level-security policies
and grants. Journey data needs no API key — Transitous is open.

Full setup and command reference: [`docs/development.md`](docs/development.md).
System overview: [`docs/architecture.md`](docs/architecture.md).

`bun.lock` is the lockfile used by the production build. Commit lockfile changes
only when you intentionally change dependencies.

## Secrets

- **Never commit secrets, tokens, API keys or a `.env` file.** `.env` and
  `.env.*` are gitignored; keep them that way.
- Document any new environment variable in `.env.example` with a placeholder
  value and a comment — names only, never real values.
- Anything read from `process.env` is server-only. Never prefix a secret with
  `VITE_`: that inlines it into the browser bundle.
- If you believe a secret has been exposed, do not open a public issue — see
  "Reporting a vulnerability" below.

## Issues

Open an issue with: what you did, what you expected, what happened, plus the
route and browser. For journey-search problems, include the origin, destination,
date and travel style — results depend on upstream timetable data and change
over time.

## Pull requests

1. Fork and branch from `main`.
2. Keep the change focused; one concern per pull request.
3. Run `bun run lint`, `bun run test` and `bun run format`, and make sure
   `bun run build` succeeds. New logic — scoring, connection rules, station
   handling, time zones — should come with tests; the existing suite under
   `src/**/*.test.ts` is the pattern to follow.
4. Describe what changed and why, and note any database migration or new
   environment variable.
5. By contributing, you agree your contribution is licensed under
   AGPL-3.0-only, the licence of this project.
6. Respect [`TRADEMARKS.md`](TRADEMARKS.md): the code is open, the Euroute name,
   logo and visual identity are not. Do not add or alter brand assets, and do
   not present a fork as the official Euroute service.

## Code quality expectations

- TypeScript, no new `any` where a real type is possible.
- Server-only logic lives in `*.server.ts` / server functions; never import
  those from client components.
- Use the design tokens in `src/styles.css` and the existing shadcn/ui
  components. No hard-coded colours.
- All user-facing strings go through the i18n layer in `src/lib/i18n.tsx`, with
  both Swedish and English translations.
- Database changes go in a new file in `supabase/migrations/`; never edit an
  applied migration. Every new public table needs row-level security, policies
  and explicit grants.
- Do not add wording that implies Euroute sells tickets or that a booking is
  confirmed. Euroute links out to operators; it does not sell.
- Respect the upstream routing provider: no new request patterns that increase
  upstream load without a cache and a budget.

## Reporting a vulnerability

Security reports do not belong in normal issues or pull requests. Use GitHub's
private vulnerability reporting on this repository ("Security" tab, "Report a
vulnerability"), and allow reasonable time for a fix before disclosure. Full
details in [`SECURITY.md`](SECURITY.md).

## Conduct

Participation is covered by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Contact

All contact goes through this repository: open an issue for bugs, questions and
feature ideas, and use private vulnerability reporting for security.

