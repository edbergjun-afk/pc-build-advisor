Title: v2: Live catalogue in Supabase with stock-aware recommendations

## Problem
v1 uses a static sample catalogue in `lib/catalog.ts`. Prices and stock never change, so a real store could not use the advisor without a code deploy for every price update.

## Proposal
- Move parts into a Supabase `parts` table (same fields as `lib/types.ts`, plus `stock_qty` and `updated_at`).
- `searchParts` queries Supabase and excludes out-of-stock items. `evaluateBuild` loads parts by ID from the DB.
- Add a `saved_builds` table so users can share a build link ("/b/<id>").
- Cache catalogue reads for 5 minutes. Keep the rule engine pure and unit-tested.

## Acceptance criteria
- [ ] Changing a price in Supabase is reflected in the next recommendation without a redeploy
- [ ] Out-of-stock parts are never recommended (unit and integration test)
- [ ] Shareable build link works in incognito
- [ ] Supabase keys only in server env vars; row-level security on tables

## Also consider
Shared rate limiting (Upstash Redis) instead of the in-memory limiter.
