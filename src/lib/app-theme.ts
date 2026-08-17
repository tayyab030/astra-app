export const APP_THEMES = [
  'light',
  'mist',
  'dark',
  'neon',
  'ocean',
  'forest',
  'ember',
  'aurora',
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'neon';

/** Themes that use dark surfaces (StatusBar light content). */
export const DARK_SURFACE_THEMES: readonly AppTheme[] = [
  'dark',
  'neon',
  'ocean',
  'forest',
  'ember',
  'aurora',
];

export type ThemeOption = {
  value: AppTheme;
  label: string;
  description: string;
  swatchColors: [string, string];
  borderColor: string;
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Clean light UI with blue accent',
    swatchColors: ['#ffffff', '#e2e8f0'],
    borderColor: '#cbd5e1',
  },
  {
    value: 'mist',
    label: 'Mist',
    description: 'Soft daylight with teal accent',
    swatchColors: ['#f0fdfa', '#ccfbf1'],
    borderColor: '#5eead4',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Plain dark UI with slate accent',
    swatchColors: ['#3f3f46', '#09090b'],
    borderColor: '#64748b',
  },
  {
    value: 'neon',
    label: 'Neon',
    description: 'Cyan ASTRA look with glow accents',
    swatchColors: ['#06b6d4', '#2563eb'],
    borderColor: 'rgba(34,211,238,0.6)',
  },
  {
    value: 'ocean',
    label: 'Ocean',
    description: 'Deep navy with teal accent',
    swatchColors: ['#0e7490', '#164e63'],
    borderColor: 'rgba(45,212,191,0.55)',
  },
  {
    value: 'forest',
    label: 'Forest',
    description: 'Deep green with emerald accent',
    swatchColors: ['#059669', '#14532d'],
    borderColor: 'rgba(52,211,153,0.55)',
  },
  {
    value: 'ember',
    label: 'Ember',
    description: 'Warm charcoal with amber accent',
    swatchColors: ['#f59e0b', '#431407'],
    borderColor: 'rgba(251,191,36,0.55)',
  },
  {
    value: 'aurora',
    label: 'Aurora',
    description: 'Night sky with mint glow accents',
    swatchColors: ['#34d399', '#6366f1'],
    borderColor: 'rgba(110,231,183,0.55)',
  },
];

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}
