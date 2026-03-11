export interface Capability {
  id: string;                           // e.g. "T1_01"
  tier: 1 | 2 | 3 | 4 | 5;
  firstAvailable: string;               // ISO format: "2022-06"
  en: string;                           // Capability name (English)
  de: string;                           // Capability name (German)
  examples: { en: string; de: string }; // Tool examples shown below the name (for recognition, NOT scoring)
}

export const TIER_CONFIG = {
  1: { weight: 1.0, en: "Table Stakes",            de: "Grundlagen",                era: "2022–2023" },
  2: { weight: 1.2, en: "Productive Usage",         de: "Produktive Nutzung",        era: "2023–2024" },
  3: { weight: 1.5, en: "Integrated Workflows",     de: "Integrierte Workflows",     era: "2024" },
  4: { weight: 2.0, en: "Advanced Configuration",   de: "Erweiterte Konfiguration",  era: "2025" },
  5: { weight: 2.5, en: "Frontier",                 de: "Frontier",                  era: "2026" },
} as const;

// 4-point response scale (replaces the 3-point scale)
export const RESPONSE_SCALE = {
  0: { en: "Unaware",    de: "Unbekannt",    color: "#ef4444", description: { en: "Don't know this exists", de: "Kenne ich nicht" } },
  1: { en: "Aware",      de: "Bekannt",      color: "#f97316", description: { en: "Know it, haven't tried", de: "Kenne ich, noch nicht ausprobiert" } },
  2: { en: "Tried",      de: "Ausprobiert",  color: "#eab308", description: { en: "Used at least once",     de: "Mindestens einmal genutzt" } },
  3: { en: "Integrated", de: "Integriert",   color: "#22c55e", description: { en: "Part of regular workflow", de: "Teil des täglichen Workflows" } },
} as const;
