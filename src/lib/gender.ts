export const USER_GENDERS = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const

export type UserGender = (typeof USER_GENDERS)[number]

export const USER_GENDER_OPTIONS: { value: UserGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export function getGenderLabel(value?: string | null) {
  return USER_GENDER_OPTIONS.find((option) => option.value === value)?.label ?? "Not set"
}
