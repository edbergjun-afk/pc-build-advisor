import { APICallError, RetryError } from "ai";

/**
 * Maps an AI provider failure to a short, non-sensitive code (e.g. "AI-401")
 * so users and maintainers can troubleshoot without seeing provider details.
 * The full error is logged server-side only.
 */
export function aiErrorCode(error: unknown): string {
  let e: unknown = error;
  if (RetryError.isInstance(e)) e = e.lastError;
  if (APICallError.isInstance(e)) {
    return e.statusCode ? `AI-${e.statusCode}` : "AI-NET";
  }
  if (e instanceof Error) {
    const text = `${e.message} ${String((e as { cause?: unknown }).cause ?? "")}`;
    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET/i.test(text)) return "AI-NET";
  }
  return "AI-ERR";
}

export function userErrorMessage(code: string): string {
  return `Sorry, the AI service had a problem. Please try again. (code ${code})`;
}
