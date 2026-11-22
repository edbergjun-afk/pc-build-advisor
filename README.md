# PC Build Advisor

An AI-powered PC build advisor for an online computer store. Tell it your budget (PHP) and what you will use the PC for. It picks parts **only from the store's catalogue**, then a **deterministic rule engine** checks socket, memory, size, cooling, power and budget before the build is shown.

- **Live app:** TODO: add your Vercel URL
- **Demo video (2 min):** TODO: add link
- **Reflection:** [docs/reflection.md](docs/reflection.md)
- **v2 issue:** TODO: add GitHub issue link

> Course project (Week 4 Graded Assignment 4.2). The catalogue and prices are sample data, not a real store.

## Why this is not just a chatbot wrapper
| Generic AI chat | PC Build Advisor |
|---|---|
| May suggest parts that don't exist or aren't sold | Tool calls restrict picks to catalogue IDs and prices |
| "Looks compatible" by guesswork | 15 tested rules: socket, DDR4/DDR5, form factor, GPU length, cooler height and radiator, M.2 slots, PSU load and headroom |
| Prices made up | Total and remaining budget computed in code |
| Wall of text | Checked build panel with a clear pass or fail and warnings |

## Features
- Quick-start form (budget + use case) and free-text chat with follow-ups
- Streaming responses with visible tool steps ("Searched GPUs under PHP 20,000", "Checked compatibility")
- Build summary panel: parts, total, budget left or over, power estimate, issues
- Input validation (zod), rate limiting, generic error messages, security headers
- Monitoring: Vercel Web Analytics, structured JSON logs, `/api/health`
- CI: lint, typecheck, unit tests, build and a committed-secret scan on every push and PR

## Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Vercel AI SDK v4 (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) · zod · Vitest · GitHub Actions · Vercel

See [docs/03-architecture.md](docs/03-architecture.md) and [spec.md](spec.md).

## Run locally
Requirements: Node.js 20 or later.

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
# edit .env.local and add your own key (never commit it)
npm run dev
```
Open http://localhost:3000.

### Environment variables
| Name | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | yes | API key for an OpenAI-compatible endpoint |
| `OPENAI_BASE_URL` | no | Endpoint base URL (for example a course proxy). Empty = api.openai.com |
| `OPENAI_MODEL` | no | Model name, default `gpt-4o-mini` (must support tool calling) |

## Tests
```bash
npm test          # unit tests (rule engine, validation, catalogue, rate limiter, formatting)
npm run typecheck
npm run lint
```

## Deployment
1. Push to a public GitHub repo. GitHub Actions runs CI (`.github/workflows/ci.yml`).
2. In Vercel: **Add New → Project → Import** the repo (framework: Next.js).
3. Under **Settings → Environment Variables**, add `OPENAI_API_KEY` (and `OPENAI_BASE_URL` and `OPENAI_MODEL` if needed) for Production and Preview.
4. Deploy. Every push to `main` redeploys production; PRs get preview URLs.
5. Under **Analytics**, enable Web Analytics.
6. Check `https://<your-app>/api/health`. It should show `"aiConfigured": true`.

## Monitoring
- **Vercel Web Analytics:** page views and visitors.
- **Vercel Logs:** filter by `event`: `chat_completed` (latency, steps, tokens), `build_evaluated` (compatible, within budget), `chat_failed`, `chat_rate_limited`.
- **Uptime:** point any free uptime checker at `/api/health`.

## Security
- No secrets in code. Keys are read from server env vars only, `.env*` is git-ignored, and CI fails if a key-like string is committed.
- Request validation: roles limited to `user` and `assistant` (no client `system` prompts), length and count caps, body size cap.
- Per-IP rate limit (best effort, per instance), generic error messages, security headers.

## Project docs
- [Idea validation (7 steps)](docs/01-idea-validation.md)
- [PRD](docs/02-prd.md)
- [Architecture notes](docs/03-architecture.md)
- [spec.md](spec.md) · [CLAUDE.md](CLAUDE.md) · [.cursorrules](.cursorrules)
- [Demo script](docs/demo-script.md) · [Reflection](docs/reflection.md)

## Limitations and v2
Sample catalogue and prices; simplified power and size rules; in-memory rate limit. Planned for v2: live catalogue in Supabase with stock and prices, saved and shareable builds, "add build to cart" handoff. See the v2 GitHub issue.
