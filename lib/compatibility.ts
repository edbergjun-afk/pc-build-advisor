import { getPartById } from "./catalog";
import type {
  BuildEvaluation,
  Category,
  Cooler,
  Cpu,
  Gpu,
  Issue,
  Motherboard,
  Part,
  PcCase,
  Psu,
  Ram,
  Storage,
  UseCase,
} from "./types";

/** Watts allowed for motherboard, drives, fans and peripherals. */
export const BASE_SYSTEM_W = 75;
/** Recommended PSU capacity as a multiple of estimated peak load. */
export const PSU_HEADROOM = 1.4;
/** Share of budget left unspent that triggers an upgrade hint for performance use cases. */
export const UNDERUSED_BUDGET_SHARE = 0.15;
const PERFORMANCE_USE_CASES: UseCase[] = ["gaming", "video-editing", "streaming"];

const SINGLE_CATEGORIES: Category[] = ["cpu", "motherboard", "ram", "gpu", "psu", "case", "cooler"];
const REQUIRED_CATEGORIES: Category[] = ["cpu", "motherboard", "ram", "storage", "psu", "case"];

export interface EvaluateInput {
  partIds: string[];
  budget: number;
  useCase: UseCase;
}

export function estimateLoadW(cpu?: Cpu, gpu?: Gpu): number {
  return (cpu?.powerW ?? 0) + (gpu?.powerW ?? 0) + BASE_SYSTEM_W;
}

export function recommendedPsuW(loadW: number): number {
  return Math.ceil((loadW * PSU_HEADROOM) / 50) * 50;
}

/**
 * Deterministic compatibility, power and budget check.
 * The AI model proposes part IDs; this function is the source of truth.
 */
export function evaluateBuild(input: EvaluateInput): BuildEvaluation {
  const issues: Issue[] = [];
  const parts: Part[] = [];

  for (const id of input.partIds) {
    const part = getPartById(id);
    if (part) parts.push(part);
    else issues.push({ severity: "error", code: "unknown_part", message: `Part "${id}" is not in the store catalogue.` });
  }

  const ofCategory = <T extends Part>(c: Category) => parts.filter((p) => p.category === c) as T[];

  for (const c of SINGLE_CATEGORIES) {
    if (ofCategory(c).length > 1) {
      issues.push({ severity: "error", code: "duplicate_part", message: `Choose only one ${c} (found ${ofCategory(c).length}).` });
    }
  }
  for (const c of REQUIRED_CATEGORIES) {
    if (ofCategory(c).length === 0) {
      issues.push({ severity: "error", code: "missing_part", message: `The build is missing a ${c}.` });
    }
  }

  const cpu = ofCategory<Cpu>("cpu")[0];
  const board = ofCategory<Motherboard>("motherboard")[0];
  const ram = ofCategory<Ram>("ram")[0];
  const gpu = ofCategory<Gpu>("gpu")[0];
  const storage = ofCategory<Storage>("storage");
  const psu = ofCategory<Psu>("psu")[0];
  const pcCase = ofCategory<PcCase>("case")[0];
  const cooler = ofCategory<Cooler>("cooler")[0];

  if (cpu && board && cpu.socket !== board.socket) {
    issues.push({ severity: "error", code: "socket_mismatch", message: `${cpu.name} uses ${cpu.socket} but the motherboard is ${board.socket}.` });
  }
  if (ram && board && ram.memoryType !== board.memoryType) {
    issues.push({ severity: "error", code: "memory_mismatch", message: `The memory is ${ram.memoryType} but the motherboard needs ${board.memoryType}.` });
  }
  if (board && pcCase && !pcCase.formFactors.includes(board.formFactor)) {
    issues.push({ severity: "error", code: "form_factor", message: `A ${board.formFactor} motherboard does not fit the ${pcCase.name}.` });
  }
  if (gpu && pcCase && gpu.lengthMm > pcCase.maxGpuLengthMm) {
    issues.push({ severity: "error", code: "gpu_length", message: `The graphics card is ${gpu.lengthMm} mm long; the case fits up to ${pcCase.maxGpuLengthMm} mm.` });
  }
  if (cpu && !cpu.integratedGraphics && !gpu) {
    issues.push({ severity: "error", code: "needs_gpu", message: `${cpu.name} has no integrated graphics, so a graphics card is required.` });
  }
  if (cpu && !cpu.includesCooler && !cooler) {
    issues.push({ severity: "error", code: "needs_cooler", message: `${cpu.name} does not include a cooler, so add a CPU cooler.` });
  }
  if (cooler && cpu && !cooler.sockets.includes(cpu.socket)) {
    issues.push({ severity: "error", code: "cooler_socket", message: `The cooler does not support the ${cpu.socket} socket.` });
  }
  if (cooler && pcCase) {
    if (cooler.kind === "liquid-240" && !pcCase.supports240Radiator) {
      issues.push({ severity: "error", code: "radiator_fit", message: `The ${pcCase.name} cannot mount a 240 mm radiator.` });
    } else if (cooler.heightMm > pcCase.maxCoolerHeightMm) {
      issues.push({ severity: "error", code: "cooler_height", message: `The cooler is ${cooler.heightMm} mm tall; the case fits up to ${pcCase.maxCoolerHeightMm} mm.` });
    }
  }
  const nvmeCount = storage.filter((s) => s.interface === "NVMe").length;
  if (board && nvmeCount > board.m2Slots) {
    issues.push({ severity: "error", code: "m2_slots", message: `${nvmeCount} NVMe drives selected but the motherboard has ${board.m2Slots} M.2 slot(s).` });
  }

  const loadW = estimateLoadW(cpu, gpu);
  const recPsu = recommendedPsuW(loadW);
  if (psu) {
    if (psu.wattage < loadW) {
      issues.push({ severity: "error", code: "psu_too_small", message: `The ${psu.wattage} W PSU is below the estimated ${loadW} W load.` });
    } else if (psu.wattage < recPsu) {
      issues.push({ severity: "warning", code: "psu_headroom", message: `A ${recPsu} W or larger PSU is recommended for headroom (estimated load ${loadW} W).` });
    }
  }

  // Use-case fit (advice, not blockers)
  if (input.useCase === "gaming" && !gpu) {
    issues.push({ severity: "warning", code: "gaming_no_gpu", message: "No graphics card: integrated graphics only suits light or esports titles at low settings." });
  }
  if ((input.useCase === "video-editing" || input.useCase === "streaming") && ram && ram.capacityGb < 32) {
    issues.push({ severity: "warning", code: "low_ram", message: `${ram.capacityGb} GB RAM may be tight for ${input.useCase.replace("-", " ")}; 32 GB is recommended.` });
  }
  if (input.useCase === "video-editing" && cpu && cpu.cores < 8) {
    issues.push({ severity: "warning", code: "few_cores", message: `${cpu.cores} cores will work, but 8 or more cores render video noticeably faster.` });
  }
  if (storage.length > 0 && storage.every((s) => s.kind === "HDD")) {
    issues.push({ severity: "warning", code: "no_ssd", message: "Add an SSD for the operating system; a hard drive alone feels slow." });
  }

  const total = parts.reduce((sum, p) => sum + p.price, 0);
  const remaining = input.budget - total;

  if (PERFORMANCE_USE_CASES.includes(input.useCase) && remaining > input.budget * UNDERUSED_BUDGET_SHARE) {
    issues.push({
      severity: "warning",
      code: "underused_budget",
      message: `PHP ${remaining.toLocaleString("en-PH")} of the budget is unused; upgrading the most important part for ${input.useCase.replace("-", " ")} would give better performance.`,
    });
  }

  return {
    useCase: input.useCase,
    budget: input.budget,
    parts: parts.map((p) => ({ id: p.id, category: p.category, name: p.name, price: p.price })),
    total,
    remaining,
    withinBudget: total <= input.budget,
    estimatedLoadW: loadW,
    recommendedPsuW: recPsu,
    compatible: !issues.some((i) => i.severity === "error"),
    issues,
  };
}
