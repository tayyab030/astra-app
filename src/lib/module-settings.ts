export const MODULE_WEIGHT_KEYS = [
  "productivity",
  "health",
  "wealth",
  "knowledge",
] as const

export type ModuleWeightKey = (typeof MODULE_WEIGHT_KEYS)[number]

export const MODULE_TOGGLE_KEYS = [
  "tasks",
  "wealth",
  "health",
  "notes",
  "analytics",
] as const

export type ModuleToggleKey = (typeof MODULE_TOGGLE_KEYS)[number]

export type ModuleWeights = Record<ModuleWeightKey, number>
export type ModuleEnabled = Record<ModuleToggleKey, boolean>

export type ModuleSettings = {
  weights: ModuleWeights
  enabled: ModuleEnabled
}

export const DEFAULT_MODULE_WEIGHTS: ModuleWeights = {
  productivity: 25,
  health: 25,
  wealth: 25,
  knowledge: 25,
}

export const DEFAULT_MODULE_ENABLED: ModuleEnabled = {
  tasks: true,
  wealth: true,
  health: true,
  notes: true,
  analytics: true,
}

export const DEFAULT_MODULE_SETTINGS: ModuleSettings = {
  weights: { ...DEFAULT_MODULE_WEIGHTS },
  enabled: { ...DEFAULT_MODULE_ENABLED },
}

export const MODULE_WEIGHT_LABELS: Record<ModuleWeightKey, string> = {
  productivity: "Productivity",
  health: "Health",
  wealth: "Wealth",
  knowledge: "Knowledge",
}

export const MODULE_TOGGLE_LABELS: Record<ModuleToggleKey, string> = {
  tasks: "Tasks",
  wealth: "Wealth",
  health: "Health",
  notes: "Notes",
  analytics: "Analytics",
}

/** Sidebar nav id → module toggle key (only toggleable modules). */
export const SIDEBAR_MODULE_TOGGLE: Partial<Record<string, ModuleToggleKey>> = {
  tasks: "tasks",
  wealth: "wealth",
  health: "health",
  notes: "notes",
  analytics: "analytics",
}

function clampWeight(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  const stepped = Math.round(value / 5) * 5
  return Math.min(50, Math.max(0, stepped))
}

export function normalizeModuleWeights(
  input?: Partial<ModuleWeights> | null
): ModuleWeights {
  const raw: ModuleWeights = { ...DEFAULT_MODULE_WEIGHTS }
  for (const key of MODULE_WEIGHT_KEYS) {
    const clamped = clampWeight(input?.[key])
    if (clamped !== null) raw[key] = clamped
  }

  const sum = MODULE_WEIGHT_KEYS.reduce((total, key) => total + raw[key], 0)
  if (sum === 100) return raw
  if (sum <= 0) return { ...DEFAULT_MODULE_WEIGHTS }

  const scaled = MODULE_WEIGHT_KEYS.map((key) => ({
    key,
    value: (raw[key] / sum) * 100,
  }))

  const rounded = scaled.map((item) => ({
    key: item.key,
    value: Math.round(item.value / 5) * 5,
  }))

  let roundedSum = rounded.reduce((total, item) => total + item.value, 0)
  let guard = 0
  while (roundedSum !== 100 && guard < 40) {
    const idx = guard % rounded.length
    if (roundedSum > 100 && rounded[idx].value >= 5) {
      rounded[idx].value -= 5
      roundedSum -= 5
    } else if (roundedSum < 100 && rounded[idx].value <= 45) {
      rounded[idx].value += 5
      roundedSum += 5
    }
    guard += 1
  }

  const result = { ...DEFAULT_MODULE_WEIGHTS }
  for (const item of rounded) {
    result[item.key] = item.value
  }
  return result
}

export function normalizeModuleEnabled(
  input?: Partial<ModuleEnabled> | null
): ModuleEnabled {
  const result = { ...DEFAULT_MODULE_ENABLED }
  for (const key of MODULE_TOGGLE_KEYS) {
    if (typeof input?.[key] === "boolean") {
      result[key] = input[key]!
    }
  }
  return result
}

export function normalizeModuleSettings(
  input?: Partial<ModuleSettings> | null
): ModuleSettings {
  return {
    weights: normalizeModuleWeights(input?.weights),
    enabled: normalizeModuleEnabled(input?.enabled),
  }
}

export function moduleWeightsTotal(weights: ModuleWeights) {
  return MODULE_WEIGHT_KEYS.reduce((total, key) => total + weights[key], 0)
}
