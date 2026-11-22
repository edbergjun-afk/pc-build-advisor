import type {
  Category,
  FormFactor,
  MemoryType,
  Part,
  Socket,
} from "./types";

/**
 * SAMPLE CATALOGUE — illustrative data for a course project.
 * Prices are made-up sample prices in PHP, not real market prices.
 * Specs are simplified approximations used only for compatibility rules.
 */
export const CATALOG: readonly Part[] = [
  // CPUs
  { id: "cpu-i3-12100f", category: "cpu", name: "Intel Core i3-12100F", price: 4800, socket: "LGA1700", cores: 4, threads: 8, powerW: 89, integratedGraphics: false, includesCooler: true },
  { id: "cpu-r5-5600", category: "cpu", name: "AMD Ryzen 5 5600", price: 6500, socket: "AM4", cores: 6, threads: 12, powerW: 76, integratedGraphics: false, includesCooler: true },
  { id: "cpu-i5-12400f", category: "cpu", name: "Intel Core i5-12400F", price: 7000, socket: "LGA1700", cores: 6, threads: 12, powerW: 117, integratedGraphics: false, includesCooler: true },
  { id: "cpu-r5-5600g", category: "cpu", name: "AMD Ryzen 5 5600G", price: 7200, socket: "AM4", cores: 6, threads: 12, powerW: 88, integratedGraphics: true, includesCooler: true },
  { id: "cpu-i5-13400", category: "cpu", name: "Intel Core i5-13400", price: 11000, socket: "LGA1700", cores: 10, threads: 16, powerW: 148, integratedGraphics: true, includesCooler: true },
  { id: "cpu-r5-7600", category: "cpu", name: "AMD Ryzen 5 7600", price: 11500, socket: "AM5", cores: 6, threads: 12, powerW: 88, integratedGraphics: true, includesCooler: true },
  { id: "cpu-i7-14700k", category: "cpu", name: "Intel Core i7-14700K", price: 23500, socket: "LGA1700", cores: 20, threads: 28, powerW: 253, integratedGraphics: true, includesCooler: false },
  { id: "cpu-r7-7800x3d", category: "cpu", name: "AMD Ryzen 7 7800X3D", price: 24000, socket: "AM5", cores: 8, threads: 16, powerW: 162, integratedGraphics: true, includesCooler: false },

  // Motherboards
  { id: "mb-a520m-ddr4", category: "motherboard", name: "A520 micro-ATX board (AM4, DDR4)", price: 3600, socket: "AM4", memoryType: "DDR4", formFactor: "mATX", m2Slots: 1 },
  { id: "mb-h610m-ddr4", category: "motherboard", name: "H610 micro-ATX board (LGA1700, DDR4)", price: 4200, socket: "LGA1700", memoryType: "DDR4", formFactor: "mATX", m2Slots: 1 },
  { id: "mb-b760m-ddr4", category: "motherboard", name: "B760 micro-ATX board (LGA1700, DDR4)", price: 7000, socket: "LGA1700", memoryType: "DDR4", formFactor: "mATX", m2Slots: 2 },
  { id: "mb-b550-atx-ddr4", category: "motherboard", name: "B550 ATX board (AM4, DDR4)", price: 7500, socket: "AM4", memoryType: "DDR4", formFactor: "ATX", m2Slots: 2 },
  { id: "mb-b650m-ddr5", category: "motherboard", name: "B650 micro-ATX board (AM5, DDR5)", price: 8500, socket: "AM5", memoryType: "DDR5", formFactor: "mATX", m2Slots: 2 },
  { id: "mb-b650-atx-ddr5", category: "motherboard", name: "B650 ATX board (AM5, DDR5)", price: 12500, socket: "AM5", memoryType: "DDR5", formFactor: "ATX", m2Slots: 3 },
  { id: "mb-z790-atx-ddr5", category: "motherboard", name: "Z790 ATX board (LGA1700, DDR5)", price: 13500, socket: "LGA1700", memoryType: "DDR5", formFactor: "ATX", m2Slots: 3 },
  { id: "mb-b650i-ddr5", category: "motherboard", name: "B650 mini-ITX board (AM5, DDR5)", price: 17000, socket: "AM5", memoryType: "DDR5", formFactor: "ITX", m2Slots: 2 },

  // Memory
  { id: "ram-ddr4-16", category: "ram", name: "16 GB (2 x 8 GB) DDR4-3200", price: 2400, memoryType: "DDR4", capacityGb: 16, speedMts: 3200 },
  { id: "ram-ddr4-32", category: "ram", name: "32 GB (2 x 16 GB) DDR4-3200", price: 4300, memoryType: "DDR4", capacityGb: 32, speedMts: 3200 },
  { id: "ram-ddr5-16", category: "ram", name: "16 GB (2 x 8 GB) DDR5-5600", price: 3400, memoryType: "DDR5", capacityGb: 16, speedMts: 5600 },
  { id: "ram-ddr5-32", category: "ram", name: "32 GB (2 x 16 GB) DDR5-6000", price: 6200, memoryType: "DDR5", capacityGb: 32, speedMts: 6000 },
  { id: "ram-ddr5-64", category: "ram", name: "64 GB (2 x 32 GB) DDR5-6000", price: 12000, memoryType: "DDR5", capacityGb: 64, speedMts: 6000 },

  // Graphics cards
  { id: "gpu-rtx3050-6", category: "gpu", name: "NVIDIA GeForce RTX 3050 6 GB", price: 9500, vramGb: 6, powerW: 70, lengthMm: 170 },
  { id: "gpu-rx6600", category: "gpu", name: "AMD Radeon RX 6600 8 GB", price: 12500, vramGb: 8, powerW: 132, lengthMm: 200 },
  { id: "gpu-rx7600", category: "gpu", name: "AMD Radeon RX 7600 8 GB", price: 15500, vramGb: 8, powerW: 165, lengthMm: 250 },
  { id: "gpu-rtx4060", category: "gpu", name: "NVIDIA GeForce RTX 4060 8 GB", price: 17500, vramGb: 8, powerW: 115, lengthMm: 240 },
  { id: "gpu-rtx4060ti-16", category: "gpu", name: "NVIDIA GeForce RTX 4060 Ti 16 GB", price: 27000, vramGb: 16, powerW: 165, lengthMm: 250 },
  { id: "gpu-rx7800xt", category: "gpu", name: "AMD Radeon RX 7800 XT 16 GB", price: 31000, vramGb: 16, powerW: 263, lengthMm: 280 },
  { id: "gpu-rtx4070s", category: "gpu", name: "NVIDIA GeForce RTX 4070 SUPER 12 GB", price: 37000, vramGb: 12, powerW: 220, lengthMm: 300 },
  { id: "gpu-rtx4080s", category: "gpu", name: "NVIDIA GeForce RTX 4080 SUPER 16 GB", price: 62000, vramGb: 16, powerW: 320, lengthMm: 330 },

  // Storage
  { id: "ssd-sata-500", category: "storage", name: "500 GB SATA SSD", price: 2000, kind: "SSD", interface: "SATA", capacityGb: 500 },
  { id: "ssd-nvme-500", category: "storage", name: "500 GB NVMe SSD (Gen3)", price: 2300, kind: "SSD", interface: "NVMe", capacityGb: 500 },
  { id: "hdd-2tb", category: "storage", name: "2 TB 7200 rpm hard drive", price: 3200, kind: "HDD", interface: "SATA", capacityGb: 2000 },
  { id: "ssd-nvme-1tb", category: "storage", name: "1 TB NVMe SSD (Gen4)", price: 3900, kind: "SSD", interface: "NVMe", capacityGb: 1000 },
  { id: "ssd-nvme-2tb", category: "storage", name: "2 TB NVMe SSD (Gen4)", price: 7200, kind: "SSD", interface: "NVMe", capacityGb: 2000 },

  // Power supplies
  { id: "psu-450-bronze", category: "psu", name: "450 W 80 PLUS Bronze PSU", price: 2300, wattage: 450, efficiency: "80 PLUS Bronze" },
  { id: "psu-550-bronze", category: "psu", name: "550 W 80 PLUS Bronze PSU", price: 2900, wattage: 550, efficiency: "80 PLUS Bronze" },
  { id: "psu-650-gold", category: "psu", name: "650 W 80 PLUS Gold PSU", price: 4500, wattage: 650, efficiency: "80 PLUS Gold" },
  { id: "psu-750-gold", category: "psu", name: "750 W 80 PLUS Gold PSU", price: 5600, wattage: 750, efficiency: "80 PLUS Gold" },
  { id: "psu-850-gold", category: "psu", name: "850 W 80 PLUS Gold PSU", price: 7000, wattage: 850, efficiency: "80 PLUS Gold" },
  { id: "psu-1000-gold", category: "psu", name: "1000 W 80 PLUS Gold PSU", price: 9500, wattage: 1000, efficiency: "80 PLUS Gold" },

  // Cases
  { id: "case-matx-budget", category: "case", name: "Budget micro-ATX tower", price: 1800, formFactors: ["mATX", "ITX"], maxGpuLengthMm: 250, maxCoolerHeightMm: 150, supports240Radiator: true },
  { id: "case-atx-airflow", category: "case", name: "Mid-tower ATX airflow case", price: 3800, formFactors: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 330, maxCoolerHeightMm: 165, supports240Radiator: true },
  { id: "case-itx-sff", category: "case", name: "Small form factor mini-ITX case", price: 5200, formFactors: ["ITX"], maxGpuLengthMm: 300, maxCoolerHeightMm: 70, supports240Radiator: false },
  { id: "case-atx-premium", category: "case", name: "Premium mid-tower ATX glass case", price: 6500, formFactors: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 400, maxCoolerHeightMm: 170, supports240Radiator: true },

  // CPU coolers
  { id: "cool-tower-basic", category: "cooler", name: "Single-tower 120 mm air cooler", price: 1500, kind: "air", sockets: ["AM4", "AM5", "LGA1700"], heightMm: 155 },
  { id: "cool-lowprofile", category: "cooler", name: "Low-profile air cooler", price: 2200, kind: "air", sockets: ["AM4", "AM5", "LGA1700"], heightMm: 47 },
  { id: "cool-tower-dual", category: "cooler", name: "Dual-tower air cooler", price: 4200, kind: "air", sockets: ["AM4", "AM5", "LGA1700"], heightMm: 165 },
  { id: "cool-aio-240", category: "cooler", name: "240 mm AIO liquid cooler", price: 5500, kind: "liquid-240", sockets: ["AM4", "AM5", "LGA1700"], heightMm: 55 },
];

const BY_ID = new Map(CATALOG.map((p) => [p.id, p]));

export function getPartById(id: string): Part | undefined {
  return BY_ID.get(id);
}

/** One-line spec summary shown to the AI model and in the UI. */
export function describePart(p: Part): string {
  switch (p.category) {
    case "cpu":
      return `${p.socket}, ${p.cores}C/${p.threads}T, ~${p.powerW} W, ${p.integratedGraphics ? "has integrated graphics" : "needs a graphics card"}, ${p.includesCooler ? "cooler included" : "no cooler included"}`;
    case "motherboard":
      return `${p.socket}, ${p.memoryType}, ${p.formFactor}, ${p.m2Slots} x M.2`;
    case "ram":
      return `${p.memoryType}, ${p.capacityGb} GB, ${p.speedMts} MT/s`;
    case "gpu":
      return `${p.vramGb} GB VRAM, ~${p.powerW} W, ${p.lengthMm} mm long`;
    case "storage":
      return `${p.kind}, ${p.interface}, ${p.capacityGb} GB`;
    case "psu":
      return `${p.wattage} W, ${p.efficiency}`;
    case "case":
      return `fits ${p.formFactors.join("/")}, GPU up to ${p.maxGpuLengthMm} mm, cooler up to ${p.maxCoolerHeightMm} mm${p.supports240Radiator ? ", 240 mm radiator OK" : ""}`;
    case "cooler":
      return `${p.kind}, ${p.sockets.join("/")}, ${p.heightMm} mm tall`;
  }
}

export interface SearchFilters {
  category: Category;
  maxPrice?: number;
  socket?: Socket;
  memoryType?: MemoryType;
  formFactor?: FormFactor;
}

export interface SearchResult {
  category: Category;
  count: number;
  parts: { id: string; name: string; price: number; specs: string }[];
}

const MAX_RESULTS = 12;

/** Filter the catalogue. Filters only apply to categories where they make sense. */
export function searchParts(filters: SearchFilters): SearchResult {
  const matches = CATALOG.filter((p) => {
    if (p.category !== filters.category) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    if (filters.socket) {
      if ((p.category === "cpu" || p.category === "motherboard") && p.socket !== filters.socket) return false;
      if (p.category === "cooler" && !p.sockets.includes(filters.socket)) return false;
    }
    if (filters.memoryType) {
      if ((p.category === "motherboard" || p.category === "ram") && p.memoryType !== filters.memoryType) return false;
    }
    if (filters.formFactor) {
      if (p.category === "motherboard" && p.formFactor !== filters.formFactor) return false;
      if (p.category === "case" && !p.formFactors.includes(filters.formFactor)) return false;
    }
    return true;
  })
    .slice()
    .sort((a, b) => a.price - b.price)
    .slice(0, MAX_RESULTS);

  return {
    category: filters.category,
    count: matches.length,
    parts: matches.map((p) => ({ id: p.id, name: p.name, price: p.price, specs: describePart(p) })),
  };
}
