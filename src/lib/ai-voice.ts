/** Orpheus English + Arabic Saudi voices used by Astra speech. */
export const AI_VOICES = [
  "austin",
  "daniel",
  "troy",
  "autumn",
  "diana",
  "hannah",
  "abdullah",
  "fahad",
  "sultan",
  "lulwa",
  "noura",
  "aisha",
] as const

export type AiVoice = (typeof AI_VOICES)[number]

export const DEFAULT_AI_VOICE: AiVoice = "austin"

export const AI_VOICE_OPTIONS: { value: AiVoice; label: string }[] = [
  { value: "austin", label: "Austin (English)" },
  { value: "daniel", label: "Daniel (English)" },
  { value: "troy", label: "Troy (English)" },
  { value: "autumn", label: "Autumn (English)" },
  { value: "diana", label: "Diana (English)" },
  { value: "hannah", label: "Hannah (English)" },
  { value: "abdullah", label: "Abdullah (Arabic)" },
  { value: "fahad", label: "Fahad (Arabic)" },
  { value: "sultan", label: "Sultan (Arabic)" },
  { value: "lulwa", label: "Lulwa (Arabic)" },
  { value: "noura", label: "Noura (Arabic)" },
  { value: "aisha", label: "Aisha (Arabic)" },
]

export function isAiVoice(value: string | null | undefined): value is AiVoice {
  return !!value && (AI_VOICES as readonly string[]).includes(value)
}
