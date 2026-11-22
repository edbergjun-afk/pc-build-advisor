# spec.md: PC Build Advisor

Version 0.5 · 22 November 2026 · See the revision history at the end.

## 1. Purpose
A web app for an online computer store. A shopper gives a budget (PHP) and use case. An AI advisor builds a complete PC from the store catalogue, and deterministic code checks every build for compatibility, power and budget before it is shown.

## 2. Scope (v1)
In: quick-start form, streaming AI chat, two server tools, rule engine, build summary panel, input validation, rate limiting, logging, analytics, health check, CI, Vercel deploy.
Out: orders, payments, accounts, live prices or stock, saved builds.

## 3. User flow
1. User opens `/`, enters a budget and use case (or types freely, or clicks a starter prompt).
2. The client sends the conversation to `POST /api/chat`.
3. The model asks at most two clarifying questions, then calls `searchParts` per category.
4. The model calls `evaluateBuild`. On errors or over-budget, it swaps parts and re-checks (up to 3 tries).
5. The model streams a short plain-text answer. The client renders the latest `evaluateBuild` result in the build panel.
6. Follow-ups ("make it quieter") repeat steps 3 to 5.

## 4. API

### POST /api/chat
Request: `{ messages: Array<{ role: "user" | "assistant", content: string, ...uiFields }> }`

| Rule | Value | On failure |
|---|---|---|
| `OPENAI_API_KEY` set | required | 503 `{error}` |
| Rate limit | 20 requests per 60 s per IP (per instance) | 429 + `Retry-After` |
| Body size | ≤ 200,000 bytes (Content-Length) | 413 |
| JSON | valid | 400 |
| Messages | 1 to 40; roles `user` or `assistant` only | 400 |
| Length | user ≤ 1,000 chars; assistant ≤ 8,000 chars | 400 |
| Last message | role `user`, not blank | 400 |

Response: AI SDK data stream (text and tool-invocation parts). Stream errors show a generic message plus a short code (`AI-<HTTP status>`, `AI-NET` or `AI-ERR`; see the README troubleshooting table). Provider error text is logged server-side only.

### GET /api/health
`{ status: "ok", aiConfigured: boolean, customEndpoint: boolean, catalogueSize: number, commit: string, time: string }`. Never returns secret values.

## 5. Tools

### searchParts
Input: `category` (cpu, motherboard, ram, gpu, storage, psu, case, cooler), optional `maxPrice`, `socket` (AM4, AM5, LGA1700), `memoryType` (DDR4, DDR5), `formFactor` (ATX, mATX, ITX).
Output: up to 12 parts, cheapest first: `{ id, name, price, specs }`.

### evaluateBuild
Input: `partIds` (1 to 12), `budget` (positive, ≤ PHP 1,000,000), `useCase` (gaming, office-school, video-editing, programming, streaming, general).
Output: `BuildEvaluation` with `parts`, `total`, `remaining`, `withinBudget`, `estimatedLoadW`, `recommendedPsuW`, `compatible` and `issues[]`.

## 6. Rules (lib/compatibility.ts)

| Code | Severity | Rule |
|---|---|---|
| unknown_part | error | Every ID must exist in the catalogue |
| duplicate_part | error | At most one of each part type, except storage |
| missing_part | error | CPU, motherboard, RAM, storage, PSU and case are required |
| socket_mismatch | error | CPU socket = motherboard socket |
| memory_mismatch | error | RAM type = motherboard memory type |
| form_factor | error | Case supports the motherboard form factor |
| gpu_length | error | GPU length ≤ case maximum |
| needs_gpu | error | CPU without integrated graphics needs a GPU |
| needs_cooler | error | CPU without a bundled cooler needs a cooler |
| cooler_socket | error | Cooler supports the CPU socket |
| radiator_fit / cooler_height | error | 240 mm AIO needs radiator support; air cooler height ≤ case maximum |
| m2_slots | error | Number of NVMe drives ≤ motherboard M.2 slots |
| psu_too_small | error | PSU watts ≥ estimated load (CPU + GPU + 75 W) |
| psu_headroom | warning | PSU watts ≥ load × 1.4, rounded up to the next 50 W |
| gaming_no_gpu, low_ram, few_cores, no_ssd | warning | Use-case advice |
| underused_budget | warning | Gaming, video editing or streaming build leaves more than 15% of the budget unspent |

`compatible` means there are no errors. `withinBudget` means total ≤ budget (tracked separately).

## 7. Non-functional
- **Secrets:** env vars only (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`). CI fails on key-like strings.
- **Performance:** first token in under 5 s typical; `maxDuration` 60 s; `maxSteps` 14.
- **Accessibility:** labelled inputs, `aria-live` chat region, keyboard-usable controls.
- **Formatting:** money as `PHP 45,000.00` (ISO code); units with spaces (`650 W`, `240 mm`).
- **Observability:** JSON logs `chat_completed`, `build_evaluated`, `chat_failed`, `chat_rate_limited`, `chat_invalid_request`; Vercel Web Analytics.

## 8. Testing
Vitest unit tests for the rule engine, validation, catalogue search, currency formatting and rate limiter. CI runs lint, typecheck, tests and build on every push and PR.

## 9. Revision history
| Version | Date | Change | Reason |
|---|---|---|---|
| 0.1 | 22 November 2026 | First draft: AI chat that recommends parts from a catalogue placed in the system prompt; model checks compatibility itself. | Initial design. |
| 0.2 | 22 November 2026 | (a) Catalogue moved behind a `searchParts` tool. (b) Compatibility moved to a deterministic `evaluateBuild` rule engine with unit tests. (c) Added server-side zod validation, rejection of client `system` messages, rate limit, generic error messages. (d) Added the build summary panel driven by tool results. (e) Budget tracked separately from compatibility. | Review found: the model can hallucinate parts and prices and cannot guarantee constraints; the prompt-embedded catalogue does not scale; the original spec had no abuse limits; and "over budget" mixed with "incompatible" confused users. **TODO:** add your reviewer's name and comments (peer, instructor or AI review). |
| 0.5 | 22 November 2026 | `maxSteps` 8 → 14, `maxDuration` 30 s → 60 s; the prompt asks for parallel searches and a closing text reply. | Live test: the model ran 7 searches one per step, plus the check, which used all 8 steps and left no step for the reply (the build panel filled, but no chat text). |
| 0.4 | 22 November 2026 | Added the `underused_budget` warning. The prompt now tells the model to fix affordable warnings and use 85% to 100% of the budget for performance use cases. Chat renders `**bold**`. | Live test: a PHP 40,000 gaming build left PHP 10,500 unused with an RTX 3050 when an RTX 4060 fit. A follow-up asking for a better GPU still left PHP 7,500 and an unfixed PSU warning. The model also used markdown bold despite the prompt. |
| 0.3 | 22 November 2026 | Chat errors show a short non-sensitive code (`AI-401`, `AI-NET`…); `chat_failed` logs include the code. | Live testing: the first deploy failed with only a generic message, and the cause could not be diagnosed without dashboard access. |
