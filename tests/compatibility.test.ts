import { describe, expect, it } from "vitest";
import { evaluateBuild, recommendedPsuW } from "@/lib/compatibility";

// A known-good budget gaming build (sample prices sum to PHP 38,600).
const GOOD = [
  "cpu-r5-5600",
  "mb-a520m-ddr4",
  "ram-ddr4-16",
  "gpu-rtx4060",
  "ssd-nvme-1tb",
  "psu-550-bronze",
  "case-matx-budget",
];

const codes = (ids: string[], budget = 40_000, useCase: Parameters<typeof evaluateBuild>[0]["useCase"] = "gaming") =>
  evaluateBuild({ partIds: ids, budget, useCase }).issues.map((i) => i.code);

describe("evaluateBuild", () => {
  it("accepts a compatible build within budget and totals the price", () => {
    const r = evaluateBuild({ partIds: GOOD, budget: 40_000, useCase: "gaming" });
    expect(r.compatible).toBe(true);
    expect(r.withinBudget).toBe(true);
    expect(r.total).toBe(38_600);
    expect(r.remaining).toBe(1_400);
    expect(r.estimatedLoadW).toBe(266);
    expect(r.issues).toEqual([]);
  });

  it("flags CPU socket and memory type mismatches", () => {
    const ids = GOOD.map((id) => (id === "mb-a520m-ddr4" ? "mb-b650m-ddr5" : id));
    const c = codes(ids);
    expect(c).toContain("socket_mismatch");
    expect(c).toContain("memory_mismatch");
  });

  it("requires a graphics card when the CPU has no integrated graphics", () => {
    const c = codes(GOOD.filter((id) => id !== "gpu-rtx4060"));
    expect(c).toContain("needs_gpu");
    expect(c).toContain("gaming_no_gpu");
  });

  it("flags a PSU that is below the estimated load", () => {
    const r = evaluateBuild({
      partIds: ["cpu-i7-14700k", "mb-z790-atx-ddr5", "ram-ddr5-32", "gpu-rtx4080s", "ssd-nvme-2tb", "psu-550-bronze", "case-atx-premium", "cool-aio-240"],
      budget: 200_000,
      useCase: "gaming",
    });
    expect(r.estimatedLoadW).toBe(648);
    expect(r.issues.map((i) => i.code)).toContain("psu_too_small");
    expect(r.compatible).toBe(false);
  });

  it("flags parts that do not physically fit the case", () => {
    const longGpu = GOOD.map((id) => (id === "gpu-rtx4060" ? "gpu-rtx4080s" : id));
    expect(codes(longGpu, 100_000)).toContain("gpu_length");

    const itx = ["cpu-r7-7800x3d", "mb-b650i-ddr5", "ram-ddr5-32", "ssd-nvme-1tb", "psu-650-gold", "case-itx-sff"];
    // "general" use case: this iGPU-only build is fine without a graphics card.
    expect(codes([...itx, "cool-tower-basic"], 100_000, "general")).toContain("cooler_height");
    expect(codes([...itx, "cool-aio-240"], 100_000, "general")).toContain("radiator_fit");
    expect(codes([...itx, "cool-lowprofile"], 100_000, "general")).toEqual([]);
  });

  it("reports over-budget builds without marking them incompatible", () => {
    const r = evaluateBuild({ partIds: GOOD, budget: 30_000, useCase: "gaming" });
    expect(r.withinBudget).toBe(false);
    expect(r.remaining).toBe(-8_600);
    expect(r.compatible).toBe(true);
  });

  it("hints to upgrade when a performance build leaves over 15% of the budget unused", () => {
    expect(codes(GOOD, 60_000, "gaming")).toContain("underused_budget");
    expect(codes(GOOD, 60_000, "office-school")).not.toContain("underused_budget");
    expect(codes(GOOD, 40_000, "gaming")).not.toContain("underused_budget");
  });

  it("rejects unknown part IDs (protects against hallucinated parts)", () => {
    expect(codes([...GOOD, "gpu-rtx9090-made-up"])).toContain("unknown_part");
  });

  it("flags missing required parts and duplicates", () => {
    const c = codes(["cpu-r5-5600", "cpu-r5-5600g"]);
    expect(c).toContain("duplicate_part");
    expect(c).toContain("missing_part");
  });
});

describe("recommendedPsuW", () => {
  it("adds headroom and rounds up to the next 50 W", () => {
    expect(recommendedPsuW(266)).toBe(400);
    expect(recommendedPsuW(648)).toBe(950);
  });
});
