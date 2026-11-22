# PRD: PC Build Advisor (v1)

**Owner:** TODO (your name / pair) · **Status:** v1 shipped · **Last updated:** 22 November 2026

## Problem
First-time PC buyers at an online computer store do not know which parts fit together or how to split their budget for their use case. They pick incompatible parts, ask staff the same questions repeatedly, or give up and buy a poor-value pre-built PC.

## Target user
A budget-conscious buyer in the Philippines (PHP 25,000 to PHP 100,000) who knows their use case (gaming, school/office, editing, programming, streaming) but not PC hardware.

## Goal
In under 2 minutes, give the user a complete, compatible, within-budget build made only of parts the store sells, with a short reason for the key choices.

## Non-goals (v1)
Real orders or payments; user accounts; live stock and price feeds; laptops or pre-builts; overclocking and performance benchmarks.

## User stories
1. As a buyer, I enter my budget and main use, and get a full parts list with total price.
2. As a buyer, I ask follow-ups ("make it quieter", "AMD graphics card instead") and the build updates.
3. As a buyer, I can see clearly whether the build is compatible and how much budget is left.
4. As the store, I only want parts from my catalogue recommended, never invented ones.

## Core features
| # | Feature | Acceptance criteria |
|---|---|---|
| F1 | Quick-start form (budget + use case) | Budget validated (PHP 10,000 to PHP 1,000,000, whole number). Submits a prefilled request. |
| F2 | AI chat with catalogue tools | Model calls `searchParts` and `evaluateBuild`. Never shows a part that is not in the catalogue. |
| F3 | Deterministic build check | Socket, memory, form factor, GPU length, cooler/radiator, M.2 slots, PSU load and headroom, budget. Covered by unit tests. |
| F4 | Build summary panel | Shows parts, total, budget left or over, power estimate, errors and warnings. |
| F5 | Safety and abuse limits | Server-only API key; input length and role validation; per-IP rate limit; generic error messages. |
| F6 | Monitoring | Vercel Web Analytics page views; structured JSON logs (latency, tool calls, tokens, check outcomes); `/api/health`. |

## Success metrics
- At least 90% of final builds are compatible and within budget (from logs).
- Median time to first build under 30 seconds.
- 3 of 3 test users get a build they rate 4 or 5 out of 5 for clarity (TODO: run the test).

## Constraints
Public GitHub repo, GitHub Actions CI, live Vercel URL, no hard-coded secrets, sample catalogue data only.

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Model invents parts or prices | Catalogue-only tools; unknown IDs fail the check; the panel shows the checked data, not model text. |
| Model returns incompatible build | `evaluateBuild` errors force a retry (up to 3 tries in the prompt; `maxSteps` 8). |
| Prompt injection or off-topic use | System prompt scope; client `system` messages rejected; message length caps. |
| API cost or abuse | Rate limit (20 requests per minute per IP per instance); small model; `maxSteps` cap. |
