// Domain types for the PC parts catalogue and build evaluation.

export const CATEGORIES = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "psu",
  "case",
  "cooler",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SOCKETS = ["AM4", "AM5", "LGA1700"] as const;
export type Socket = (typeof SOCKETS)[number];

export const MEMORY_TYPES = ["DDR4", "DDR5"] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

export const FORM_FACTORS = ["ATX", "mATX", "ITX"] as const;
export type FormFactor = (typeof FORM_FACTORS)[number];

export const USE_CASES = [
  "gaming",
  "office-school",
  "video-editing",
  "programming",
  "streaming",
  "general",
] as const;
export type UseCase = (typeof USE_CASES)[number];

interface BasePart {
  id: string;
  name: string;
  /** Sample price in PHP (whole pesos). Illustrative only. */
  price: number;
}

export interface Cpu extends BasePart {
  category: "cpu";
  socket: Socket;
  cores: number;
  threads: number;
  /** Approximate maximum package power in watts, used for PSU sizing. */
  powerW: number;
  integratedGraphics: boolean;
  includesCooler: boolean;
}

export interface Motherboard extends BasePart {
  category: "motherboard";
  socket: Socket;
  memoryType: MemoryType;
  formFactor: FormFactor;
  m2Slots: number;
}

export interface Ram extends BasePart {
  category: "ram";
  memoryType: MemoryType;
  capacityGb: number;
  speedMts: number;
}

export interface Gpu extends BasePart {
  category: "gpu";
  vramGb: number;
  /** Approximate total board power in watts. */
  powerW: number;
  lengthMm: number;
}

export interface Storage extends BasePart {
  category: "storage";
  kind: "SSD" | "HDD";
  interface: "NVMe" | "SATA";
  capacityGb: number;
}

export interface Psu extends BasePart {
  category: "psu";
  wattage: number;
  efficiency: string;
}

export interface PcCase extends BasePart {
  category: "case";
  formFactors: FormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  supports240Radiator: boolean;
}

export interface Cooler extends BasePart {
  category: "cooler";
  kind: "air" | "liquid-240";
  sockets: Socket[];
  /** Height above the CPU in mm (for liquid coolers, the pump block). */
  heightMm: number;
}

export type Part = Cpu | Motherboard | Ram | Gpu | Storage | Psu | PcCase | Cooler;

export interface Issue {
  severity: "error" | "warning";
  code: string;
  message: string;
}

export interface BuildLine {
  id: string;
  category: Category;
  name: string;
  price: number;
}

export interface BuildEvaluation {
  useCase: UseCase;
  budget: number;
  parts: BuildLine[];
  total: number;
  remaining: number;
  withinBudget: boolean;
  estimatedLoadW: number;
  recommendedPsuW: number;
  compatible: boolean;
  issues: Issue[];
}
