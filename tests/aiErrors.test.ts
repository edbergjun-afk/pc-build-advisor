import { APICallError, RetryError } from "ai";
import { describe, expect, it } from "vitest";
import { aiErrorCode, userErrorMessage } from "@/lib/aiErrors";

const apiError = (statusCode?: number) =>
  new APICallError({
    message: "provider said no (secret detail)",
    url: "https://example.test/v1/chat/completions",
    requestBodyValues: {},
    statusCode,
  });

describe("aiErrorCode", () => {
  it("maps provider HTTP status codes", () => {
    expect(aiErrorCode(apiError(401))).toBe("AI-401");
    expect(aiErrorCode(apiError(404))).toBe("AI-404");
  });

  it("unwraps retry errors to the last attempt", () => {
    const retry = new RetryError({ message: "failed after 3 attempts", reason: "maxRetriesExceeded", errors: [apiError(500), apiError(429)] });
    expect(aiErrorCode(retry)).toBe("AI-429");
  });

  it("detects network failures and falls back to a generic code", () => {
    expect(aiErrorCode(new TypeError("fetch failed"))).toBe("AI-NET");
    expect(aiErrorCode(apiError(undefined))).toBe("AI-NET");
    expect(aiErrorCode("weird")).toBe("AI-ERR");
  });

  it("never includes provider details in the user message", () => {
    const msg = userErrorMessage(aiErrorCode(apiError(401)));
    expect(msg).toContain("AI-401");
    expect(msg).not.toContain("secret detail");
  });
});
