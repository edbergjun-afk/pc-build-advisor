import { describe, expect, it } from "vitest";
import { CATALOG, getPartById, searchParts } from "@/lib/catalog";
import { formatPHP } from "@/lib/format";
import { createRateLimiter } from "@/lib/rateLimit";

describe("catalogue", () => {
  it("has unique IDs and positive whole-peso prices", () => {
    const ids = CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of CATALOG) {
      expect(Number.isInteger(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("filters by socket and price, cheapest first", () => {
    const r = searchParts({ category: "cpu", socket: "AM5" });
    expect(r.parts.length).toBeGreaterThan(0);
    for (const p of r.parts) expect(getPartById(p.id)).toMatchObject({ category: "cpu", socket: "AM5" });
    const prices = r.parts.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const cheap = searchParts({ category: "gpu", maxPrice: 15_000 });
    expect(cheap.parts.every((p) => p.price <= 15_000)).toBe(true);
  });

  it("filters cases by motherboard form factor", () => {
    const r = searchParts({ category: "case", formFactor: "ATX" });
    expect(r.parts.map((p) => p.id)).not.toContain("case-matx-budget");
  });
});

describe("formatPHP", () => {
  it("uses the ISO currency code, not a symbol", () => {
    expect(formatPHP(45_000)).toBe("PHP 45,000.00");
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit per window, then blocks until the window resets", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1_000 });
    expect(rl.check("a", 0).allowed).toBe(true);
    expect(rl.check("a", 1).allowed).toBe(true);
    const blocked = rl.check("a", 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(998);
    expect(rl.check("b", 2).allowed).toBe(true); // keys are independent
    expect(rl.check("a", 1_000).allowed).toBe(true);
  });
});
