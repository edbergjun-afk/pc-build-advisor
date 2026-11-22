/**
 * Simple fixed-window rate limiter kept in memory.
 * Limitation: on serverless hosts each instance has its own memory, so this is a
 * best-effort guard against accidental or casual abuse, not a hard global limit.
 * A shared store (e.g. Upstash Redis) is the v2 upgrade path.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
}

export function createRateLimiter(opts: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  const maxKeys = opts.maxKeys ?? 10_000;

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      let w = windows.get(key);
      if (!w || now - w.start >= opts.windowMs) {
        if (windows.size >= maxKeys) windows.clear(); // bound memory use
        w = { start: now, count: 0 };
        windows.set(key, w);
      }
      if (w.count >= opts.limit) {
        return { allowed: false, remaining: 0, retryAfterMs: w.start + opts.windowMs - now };
      }
      w.count += 1;
      return { allowed: true, remaining: opts.limit - w.count, retryAfterMs: 0 };
    },
  };
}
