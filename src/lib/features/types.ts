export interface Capability {
  id: string;                           // e.g. "T1_01"
  tier: 1 | 2 | 3 | 4 | 5;
  firstAvailable: string;               // ISO format: "2022-06"
  en: string;                           // Capability name (English)
  de: string;                           // Capability name (German)
  examples: { en: string; de: string }; // Tool examples shown below the name (for recognition, NOT scoring)
}

export const TIER_CONFIG = {
  1: { weight: 1.0, en: "AI Fundamentals & Understanding", de: "KI-Grundlagen & Verständnis",  era: "" },
  2: { weight: 1.2, en: "Basic Tooling",                   de: "Grundlegendes Tooling",         era: "" },
  3: { weight: 1.5, en: "Productive Usage",                de: "Produktive Nutzung",            era: "" },
  4: { weight: 2.0, en: "Automation & Workflows",          de: "Automatisierung & Workflows",   era: "" },
  5: { weight: 2.5, en: "Advanced AI Integration",          de: "Fortgeschrittene KI-Integration", era: "" },
} as const;

// 4-point response scale
export const RESPONSE_SCALE = {
  0: { en: "Not Aware",       de: "Nicht bekannt",      color: "#ef4444", description: { en: "Don't know this exists",       de: "Kenne ich nicht" } },
  1: { en: "Aware",           de: "Bekannt",            color: "#f97316", description: { en: "Know it, haven't tried",        de: "Kenne ich, noch nicht ausprobiert" } },
  2: { en: "Tried",           de: "Ausprobiert",        color: "#eab308", description: { en: "Used at least once",            de: "Mindestens einmal genutzt" } },
  3: { en: "Regularly Used",  de: "Regelmäßig genutzt", color: "#22c55e", description: { en: "Part of my regular workflow",   de: "Teil meines Arbeitsalltags" } },
} as const;
