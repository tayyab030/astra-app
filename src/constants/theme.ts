/** Neon fallback palette for rare module-level StyleSheets. Prefer `useAppTheme().colors`. */
export const colors = {
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  cyan100: '#cffafe',
  cyan200: '#a5f3fc',
  cyan300: '#67e8f9',
  cyan400: '#22d3ee',
  cyan500: '#06b6d4',
  cyan600: '#0891b2',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue900: '#1e3a8a',
  cyan900: '#164e63',
  purple500: '#a855f7',
  pink500: '#ec4899',
  emerald500: '#10b981',
  teal500: '#14b8a6',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber200: '#fde68a',
  red300: '#fca5a5',
  red400: '#f87171',
  red600: '#dc2626',
  red700: '#b91c1c',
  white: '#ffffff',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heading: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
};

/**
 * Mobile-first type scale (pt). Tuned for phone density — smaller than web
 * `text-3xl` page titles, readable body, compact meta.
 */
export const type = {
  /** Badges, tiny captions */
  xs: 11,
  /** Hints, timestamps, meta */
  sm: 12,
  /** Field labels, tab labels, secondary UI */
  md: 13,
  /** Default body / buttons */
  body: 15,
  /** Emphasized body, list titles */
  bodyLg: 16,
  /** Section / card titles */
  titleSm: 17,
  /** In-page section headers */
  titleMd: 18,
  /** Screen page titles (PageHeader) */
  title: 22,
  /** Auth / hero titles */
  titleLg: 24,
  /** Large stats (life score, big metrics) */
  display: 36,
  displaySm: 28,
} as const;

export const lineHeights = {
  xs: 14,
  sm: 16,
  md: 18,
  body: 22,
  bodyLg: 24,
  titleSm: 22,
  titleMd: 24,
  title: 28,
  titleLg: 30,
  display: 40,
  displaySm: 34,
} as const;
