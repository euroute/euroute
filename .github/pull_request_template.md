## What and why

<!-- What does this change do, and what problem does it solve? -->

## Checklist

- [ ] One concern per pull request
- [ ] `bun run lint`, `bun run test` and `bun run build` pass locally
- [ ] User-facing strings go through `src/lib/i18n.tsx` in both Swedish and English
- [ ] No new environment variable, or it is documented in `.env.example` and the README
- [ ] No database migration, or it is a new file in `supabase/migrations/` with row-level security, policies and grants
- [ ] No wording that implies Euroute sells tickets or confirms a booking
- [ ] No change that increases upstream Transitous load without a cache and a budget
- [ ] No secrets, tokens or real credentials added

## Notes for reviewers

<!-- Anything worth knowing: screenshots, trade-offs, follow-up work. -->

By opening this pull request you agree your contribution is licensed under
AGPL-3.0-only, and you have read [`TRADEMARKS.md`](../TRADEMARKS.md).
