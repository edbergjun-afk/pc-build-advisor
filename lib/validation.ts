import { z } from "zod";

export const MAX_MESSAGES = 40;
export const MAX_USER_CHARS = 1000;
export const MAX_ASSISTANT_CHARS = 8000;
export const MAX_BODY_BYTES = 200_000;

export const MIN_BUDGET = 10_000;
export const MAX_BUDGET = 1_000_000;

// Only user and assistant messages are accepted from the browser.
// A client-supplied "system" message would be a prompt-injection vector, so it is rejected.
const messageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
  .passthrough()
  .superRefine((m, ctx) => {
    const limit = m.role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (m.content.length > limit) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Message is too long (max ${limit} characters).` });
    }
  });

export const chatRequestSchema = z
  .object({
    messages: z.array(messageSchema).min(1).max(MAX_MESSAGES),
  })
  .passthrough()
  .superRefine((body, ctx) => {
    const last = body.messages[body.messages.length - 1];
    if (last.role !== "user") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "The last message must come from the user." });
    } else if (last.content.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please type a message." });
    }
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ParseResult =
  | { ok: true; data: ChatRequest }
  | { ok: false; error: string };

export function parseChatRequest(body: unknown): ParseResult {
  const result = chatRequestSchema.safeParse(body);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  return { ok: false, error: first?.message ?? "Invalid request." };
}

/** Budget check used by the quick-start form and the evaluateBuild tool. */
export const budgetSchema = z
  .number({ invalid_type_error: "Budget must be a number." })
  .int("Budget must be a whole number of pesos.")
  .min(MIN_BUDGET, `Budget must be at least PHP ${MIN_BUDGET.toLocaleString("en-PH")}.`)
  .max(MAX_BUDGET, `Budget must be at most PHP ${MAX_BUDGET.toLocaleString("en-PH")}.`);
