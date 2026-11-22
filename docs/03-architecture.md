# Architecture notes

## Overview

```
Browser (Next.js page, React client component)
  │  useChat() streams messages
  ▼
POST /api/chat   (Next.js route handler, Node runtime on Vercel)
  │  1. check OPENAI_API_KEY is set (env var, never in code)
  │  2. per-IP rate limit (in memory)
  │  3. body size + zod validation (roles, lengths, count)
  │  4. streamText(model, system prompt, tools, maxSteps 8)
  │        ├─ tool searchParts  → lib/catalog.ts (sample catalogue)
  │        └─ tool evaluateBuild → lib/compatibility.ts (rule engine)
  │  5. structured logs (lib/log.ts) → Vercel Logs
  ▼
OpenAI-compatible LLM API (OPENAI_BASE_URL, OPENAI_MODEL)

GET /api/health → status JSON (uptime checks)
<Analytics/>    → Vercel Web Analytics (page views)
```

## Key decisions

| Decision | Why |
|---|---|
| Next.js 14 App Router + Tailwind | Recommended stack; one repo for UI and API; easy Vercel deploys. |
| Vercel AI SDK (`ai` v4) + `@ai-sdk/openai` | Streaming and multi-step tool calling with little code. The provider is swappable. |
| OpenAI-compatible provider with configurable base URL | Works with the course-issued key (proxy endpoint) or a normal OpenAI key, without code changes. |
| Tools instead of putting the catalogue in the prompt | Keeps prompts small, forces real IDs and prices, and lets code (not the model) be the source of truth. |
| Deterministic rule engine | Compatibility must be correct and testable. LLMs are good at trade-offs, not at guaranteeing constraints. |
| No database in v1 | The catalogue is static sample data; there are no accounts or saved builds. Supabase is planned for v2 (saved builds and a stock table). |
| No auth in v1 | Anonymous shoppers. Abuse is limited by rate limiting and input caps. |
| Vercel Git integration for deploys, GitHub Actions for CI | Every push is linted, type-checked, tested and built in Actions. Vercel deploys `main` to production and PRs to previews. |

## Data model (lib/types.ts)

`Part` is a union of `Cpu | Motherboard | Ram | Gpu | Storage | Psu | PcCase | Cooler`, each with `id`, `name`, `price` (PHP) and the specs needed by the rules. `BuildEvaluation` is the tool result rendered by the build panel.

## Security notes
- API key only in server env vars (`.env.local` locally, Vercel project settings in production). `.env*` is git-ignored. CI scans for committed keys.
- Browser messages limited to `user`/`assistant` roles and length-capped. The last message must be from the user.
- Provider errors are logged server-side. The browser gets a generic message.
- Logs record counts and outcomes only, never message text, keys or IPs.
- Basic security headers in `next.config.mjs`.

## Known limitations
- In-memory rate limit is per serverless instance (best effort).
- Power and size rules are simplified approximations.
- A user could forge prior assistant/tool messages in the request. Impact is limited because there are no privileged actions, and all tools are read-only.
