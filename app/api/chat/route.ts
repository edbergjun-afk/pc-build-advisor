import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, tool, type Message } from "ai";
import { z } from "zod";
import { aiErrorCode, userErrorMessage } from "@/lib/aiErrors";
import { searchParts } from "@/lib/catalog";
import { evaluateBuild } from "@/lib/compatibility";
import { log } from "@/lib/log";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { createRateLimiter } from "@/lib/rateLimit";
import { CATEGORIES, FORM_FACTORS, MEMORY_TYPES, SOCKETS, USE_CASES } from "@/lib/types";
import { MAX_BODY_BYTES, MAX_BUDGET, parseChatRequest } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 30;

const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

function jsonError(message: string, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function POST(req: Request) {
  const started = Date.now();
  const requestId = crypto.randomUUID();

  // Secrets come from environment variables only (set in .env.local or the Vercel dashboard).
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log("error", "chat_misconfigured", { requestId, reason: "OPENAI_API_KEY not set" });
    return jsonError("The AI service is not configured yet. Please try again later.", 503);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const rl = limiter.check(ip);
  if (!rl.allowed) {
    log("warn", "chat_rate_limited", { requestId });
    return jsonError("Too many messages. Please wait a minute and try again.", 429, {
      "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
    });
  }

  const declaredLength = Number(req.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonError("Request is too large.", 413);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Request body must be JSON.", 400);
  }

  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    log("warn", "chat_invalid_request", { requestId, reason: parsed.error });
    return jsonError(parsed.error, 400);
  }

  const openai = createOpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
  const modelId = process.env.OPENAI_MODEL || "gpt-4o-mini";

  let toolCalls = 0;

  const result = streamText({
    model: openai.chat(modelId),
    system: SYSTEM_PROMPT,
    messages: convertToCoreMessages(parsed.data.messages as unknown as Message[]),
    temperature: 0.3,
    maxSteps: 8,
    tools: {
      searchParts: tool({
        description:
          "Search the store catalogue for one category of part. Returns up to 12 in-stock parts, cheapest first, with IDs, sample prices in PHP and key specs.",
        parameters: z.object({
          category: z.enum(CATEGORIES),
          maxPrice: z.number().positive().optional().describe("Maximum price in PHP"),
          socket: z.enum(SOCKETS).optional().describe("CPU socket (filters CPUs, motherboards, coolers)"),
          memoryType: z.enum(MEMORY_TYPES).optional().describe("Filters motherboards and RAM"),
          formFactor: z.enum(FORM_FACTORS).optional().describe("Filters motherboards and cases"),
        }),
        execute: async (args) => {
          toolCalls += 1;
          return searchParts(args);
        },
      }),
      evaluateBuild: tool({
        description:
          "Check a complete build: compatibility (socket, memory, form factor, GPU length, cooler), PSU wattage, use-case fit and total price against the budget. Always call this before presenting a build.",
        parameters: z.object({
          partIds: z.array(z.string().max(40)).min(1).max(12).describe("Catalogue IDs of all chosen parts"),
          budget: z.number().positive().max(MAX_BUDGET).describe("Customer budget in PHP"),
          useCase: z.enum(USE_CASES),
        }),
        execute: async (args) => {
          toolCalls += 1;
          const evaluation = evaluateBuild(args);
          log("info", "build_evaluated", {
            requestId,
            useCase: evaluation.useCase,
            compatible: evaluation.compatible,
            withinBudget: evaluation.withinBudget,
            errorCount: evaluation.issues.filter((i) => i.severity === "error").length,
          });
          return evaluation;
        },
      }),
    },
    onFinish: ({ usage, finishReason, steps }) => {
      log("info", "chat_completed", {
        requestId,
        model: modelId,
        latencyMs: Date.now() - started,
        steps: steps.length,
        toolCalls,
        finishReason,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
      });
    },
    onError: ({ error }) => {
      log("error", "chat_failed", {
        requestId,
        code: aiErrorCode(error),
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toDataStreamResponse({
    // Never send provider error details to the browser: only a short code (see README troubleshooting).
    getErrorMessage: (error) => userErrorMessage(aiErrorCode(error)),
  });
}
