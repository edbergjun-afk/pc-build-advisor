# CLAUDE.md: guidance for AI coding agents

## Project
PC Build Advisor: a Next.js 14 (App Router) + Tailwind app. An AI chat (Vercel AI SDK v4, OpenAI-compatible provider) recommends PC builds from a sample catalogue. A deterministic rule engine checks them. Read `spec.md` first; it is the source of truth.

## Commands
- `npm run dev` starts the dev server (needs `.env.local`; see `.env.example`)
- `npm test` runs the Vitest unit tests
- `npm run lint`, `npm run typecheck`, `npm run build` (CI runs all four)

## Layout
- `app/api/chat/route.ts` is the chat endpoint: validation, rate limit, `streamText` with tools
- `app/api/health/route.ts` is the health check
- `components/Advisor.tsx` holds the chat UI (`useChat`); `components/BuildPanel.tsx` shows the checked build
- `lib/catalog.ts` holds the sample catalogue and `searchParts`; `lib/compatibility.ts` is the rule engine
- `lib/validation.ts` (zod), `lib/rateLimit.ts`, `lib/log.ts`, `lib/prompt.ts`, `lib/format.ts`
- `tests/` holds the unit tests; `docs/` holds the validation, PRD, architecture and reflection docs

## Rules
1. **Never hard-code secrets.** Read keys from `process.env` on the server only. Never prefix them with `NEXT_PUBLIC_`. Never log them.
2. Compatibility and pricing logic lives in `lib/compatibility.ts`, not in the prompt. Every new rule needs a unit test and a row in `spec.md` §6.
3. The model may only recommend catalogue parts. Keep `evaluateBuild` as the gate before a build is shown.
4. Validate all request input with zod in `lib/validation.ts`. Return `{ error }` JSON with a correct HTTP status. Never leak provider errors to the client.
5. Money is shown as `PHP 1,234.56` via `formatPHP`, never with a currency symbol. Units are spaced (`650 W`).
6. Logs are structured JSON via `log()`, with no message content, keys or IPs.
7. Keep components small and typed. No `any`. Prefer server logic in `lib/`.
8. Update `spec.md` (including the revision history) when behaviour changes.
9. Run `npm test && npm run typecheck && npm run lint` before committing. Use small, meaningful commits (`feat:`, `fix:`, `test:`, `docs:`, `ci:`).
