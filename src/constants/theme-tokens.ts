import { APP_THEMES, type AppTheme } from '@/lib/app-theme';

/** Semantic tokens mirrored from astra-frontend `app/globals.css` (hex approximations). */
export type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  primaryMuted: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  sidebar: string;
  sidebarBorder: string;
  pageGradient: [string, string, string];
  accentGradient: [string, string];
  glowPrimary: string;
  fxOpacity: number;
  isDark: boolean;
  /** BlurView tint */
  blurTint: 'light' | 'dark';
};

const neon: ThemeTokens = {
  background: '#0f172a',
  foreground: '#e2e8f0',
  card: 'rgba(30, 41, 59, 0.72)',
  cardForeground: '#e2e8f0',
  primary: '#22d3ee',
  primaryForeground: '#0f172a',
  primaryMuted: 'rgba(34, 211, 238, 0.18)',
  secondary: '#1e293b',
  secondaryForeground: '#e2e8f0',
  muted: '#334155',
  mutedForeground: '#94a3b8',
  accent: 'rgba(34, 211, 238, 0.18)',
  accentForeground: '#67e8f9',
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',
  border: 'rgba(34, 211, 238, 0.3)',
  input: 'rgba(34, 211, 238, 0.28)',
  sidebar: 'rgba(15, 23, 42, 0.92)',
  sidebarBorder: 'rgba(34, 211, 238, 0.25)',
  pageGradient: ['#0f172a', '#1e293b', '#0f172a'],
  accentGradient: ['#06b6d4', '#2563eb'],
  glowPrimary: '#06b6d4',
  fxOpacity: 1,
  isDark: true,
  blurTint: 'dark',
};

const light: ThemeTokens = {
  background: '#f8fafc',
  foreground: '#1e293b',
  card: '#ffffff',
  cardForeground: '#1e293b',
  primary: '#3b82f6',
  primaryForeground: '#ffffff',
  primaryMuted: 'rgba(59, 130, 246, 0.12)',
  secondary: '#f1f5f9',
  secondaryForeground: '#334155',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#eff6ff',
  accentForeground: '#2563eb',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#e2e8f0',
  input: '#e2e8f0',
  sidebar: '#f8fafc',
  sidebarBorder: '#e2e8f0',
  pageGradient: ['#f8fafc', '#f1f5f9', '#f8fafc'],
  accentGradient: ['#3b82f6', '#6366f1'],
  glowPrimary: '#3b82f6',
  fxOpacity: 0,
  isDark: false,
  blurTint: 'light',
};

const mist: ThemeTokens = {
  background: '#f0fdfa',
  foreground: '#134e4a',
  card: '#ffffff',
  cardForeground: '#134e4a',
  primary: '#0d9488',
  primaryForeground: '#f0fdfa',
  primaryMuted: 'rgba(13, 148, 136, 0.12)',
  secondary: '#ccfbf1',
  secondaryForeground: '#115e59',
  muted: '#ccfbf1',
  mutedForeground: '#0f766e',
  accent: '#ccfbf1',
  accentForeground: '#0f766e',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#99f6e4',
  input: '#99f6e4',
  sidebar: '#ecfeff',
  sidebarBorder: '#99f6e4',
  pageGradient: ['#f0fdfa', '#ccfbf1', '#f0fdfa'],
  accentGradient: ['#14b8a6', '#0e7490'],
  glowPrimary: '#14b8a6',
  fxOpacity: 0,
  isDark: false,
  blurTint: 'light',
};

const dark: ThemeTokens = {
  background: '#09090b',
  foreground: '#f4f4f5',
  card: '#18181b',
  cardForeground: '#f4f4f5',
  primary: '#a1a1aa',
  primaryForeground: '#18181b',
  primaryMuted: 'rgba(161, 161, 170, 0.15)',
  secondary: '#27272a',
  secondaryForeground: '#f4f4f5',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  accent: '#3f3f46',
  accentForeground: '#d4d4d8',
  destructive: '#7f1d1d',
  destructiveForeground: '#fca5a5',
  border: '#3f3f46',
  input: '#3f3f46',
  sidebar: '#18181b',
  sidebarBorder: '#3f3f46',
  pageGradient: ['#09090b', '#18181b', '#09090b'],
  accentGradient: ['#a1a1aa', '#71717a'],
  glowPrimary: '#71717a',
  fxOpacity: 0,
  isDark: true,
  blurTint: 'dark',
};

const ocean: ThemeTokens = {
  background: '#0b1c2c',
  foreground: '#e0f2fe',
  card: 'rgba(15, 40, 60, 0.9)',
  cardForeground: '#e0f2fe',
  primary: '#2dd4bf',
  primaryForeground: '#042f2e',
  primaryMuted: 'rgba(45, 212, 191, 0.16)',
  secondary: '#164e63',
  secondaryForeground: '#e0f2fe',
  muted: '#155e75',
  mutedForeground: '#7dd3fc',
  accent: 'rgba(45, 212, 191, 0.16)',
  accentForeground: '#5eead4',
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',
  border: 'rgba(45, 212, 191, 0.28)',
  input: 'rgba(45, 212, 191, 0.24)',
  sidebar: 'rgba(11, 28, 44, 0.94)',
  sidebarBorder: 'rgba(45, 212, 191, 0.22)',
  pageGradient: ['#0b1c2c', '#0e3a4a', '#0b1c2c'],
  accentGradient: ['#2dd4bf', '#0284c7'],
  glowPrimary: '#2dd4bf',
  fxOpacity: 0.45,
  isDark: true,
  blurTint: 'dark',
};

const forest: ThemeTokens = {
  background: '#0a1f14',
  foreground: '#ecfdf5',
  card: 'rgba(16, 42, 28, 0.9)',
  cardForeground: '#ecfdf5',
  primary: '#34d399',
  primaryForeground: '#022c22',
  primaryMuted: 'rgba(52, 211, 153, 0.16)',
  secondary: '#14532d',
  secondaryForeground: '#ecfdf5',
  muted: '#166534',
  mutedForeground: '#86efac',
  accent: 'rgba(52, 211, 153, 0.16)',
  accentForeground: '#6ee7b7',
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',
  border: 'rgba(52, 211, 153, 0.28)',
  input: 'rgba(52, 211, 153, 0.24)',
  sidebar: 'rgba(10, 31, 20, 0.94)',
  sidebarBorder: 'rgba(52, 211, 153, 0.22)',
  pageGradient: ['#0a1f14', '#14532d', '#0a1f14'],
  accentGradient: ['#34d399', '#059669'],
  glowPrimary: '#34d399',
  fxOpacity: 0.4,
  isDark: true,
  blurTint: 'dark',
};

const ember: ThemeTokens = {
  background: '#1c1410',
  foreground: '#fffbeb',
  card: 'rgba(40, 28, 18, 0.92)',
  cardForeground: '#fffbeb',
  primary: '#fbbf24',
  primaryForeground: '#451a03',
  primaryMuted: 'rgba(251, 191, 36, 0.16)',
  secondary: '#431407',
  secondaryForeground: '#fffbeb',
  muted: '#78350f',
  mutedForeground: '#fcd34d',
  accent: 'rgba(251, 191, 36, 0.16)',
  accentForeground: '#fcd34d',
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',
  border: 'rgba(251, 191, 36, 0.26)',
  input: 'rgba(251, 191, 36, 0.22)',
  sidebar: 'rgba(28, 20, 16, 0.94)',
  sidebarBorder: 'rgba(251, 191, 36, 0.2)',
  pageGradient: ['#1c1410', '#431407', '#1c1410'],
  accentGradient: ['#fbbf24', '#ea580c'],
  glowPrimary: '#fbbf24',
  fxOpacity: 0.35,
  isDark: true,
  blurTint: 'dark',
};

const aurora: ThemeTokens = {
  background: '#0f0a1e',
  foreground: '#ecfdf5',
  card: 'rgba(24, 16, 48, 0.88)',
  cardForeground: '#ecfdf5',
  primary: '#6ee7b7',
  primaryForeground: '#022c22',
  primaryMuted: 'rgba(110, 231, 183, 0.16)',
  secondary: '#312e81',
  secondaryForeground: '#ecfdf5',
  muted: '#3730a3',
  mutedForeground: '#a5b4fc',
  accent: 'rgba(110, 231, 183, 0.16)',
  accentForeground: '#a7f3d0',
  destructive: '#dc2626',
  destructiveForeground: '#fef2f2',
  border: 'rgba(110, 231, 183, 0.28)',
  input: 'rgba(110, 231, 183, 0.24)',
  sidebar: 'rgba(15, 10, 30, 0.94)',
  sidebarBorder: 'rgba(110, 231, 183, 0.22)',
  pageGradient: ['#0f0a1e', '#1e1b4b', '#0f0a1e'],
  accentGradient: ['#6ee7b7', '#6366f1'],
  glowPrimary: '#6ee7b7',
  fxOpacity: 0.5,
  isDark: true,
  blurTint: 'dark',
};

export const THEME_TOKENS: Record<AppTheme, ThemeTokens> = {
  light,
  mist,
  dark,
  neon,
  ocean,
  forest,
  ember,
  aurora,
};

export function getThemeTokens(theme: AppTheme): ThemeTokens {
  return THEME_TOKENS[theme] ?? THEME_TOKENS.neon;
}

/** Stable chart / status accents (not theme-dependent). */
export const accentColors = {
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
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue900: '#1e3a8a',
  cyan100: '#cffafe',
  cyan200: '#a5f3fc',
  cyan600: '#0891b2',
  cyan900: '#164e63',
} as const;

/**
 * Compatibility map so existing `colors.slate*` / `colors.cyan*` usages
 * can follow the active theme when styles are created dynamically.
 */
export type ThemedPalette = {
  slate900: string;
  slate800: string;
  slate700: string;
  slate600: string;
  slate500: string;
  slate400: string;
  slate300: string;
  slate200: string;
  cyan100: string;
  cyan200: string;
  cyan300: string;
  cyan400: string;
  cyan500: string;
  cyan600: string;
  cyan900: string;
  blue200: string;
  blue300: string;
  blue400: string;
  blue500: string;
  blue600: string;
  blue900: string;
  purple500: string;
  pink500: string;
  emerald500: string;
  teal500: string;
  amber50: string;
  amber100: string;
  amber200: string;
  red300: string;
  red400: string;
  red600: string;
  red700: string;
  white: string;
};

export function paletteFromTokens(t: ThemeTokens): ThemedPalette {
  return {
    slate900: t.background,
    slate800: t.secondary,
    slate700: t.muted,
    slate600: t.isDark ? '#475569' : '#94a3b8',
    slate500: t.isDark ? '#64748b' : '#64748b',
    slate400: t.mutedForeground,
    slate300: t.isDark ? '#cbd5e1' : '#475569',
    slate200: t.isDark ? '#e2e8f0' : '#334155',
    cyan100: accentColors.cyan100,
    cyan200: accentColors.cyan200,
    cyan300: t.accentForeground,
    cyan400: t.primary,
    cyan500: t.glowPrimary,
    cyan600: accentColors.cyan600,
    cyan900: accentColors.cyan900,
    blue200: accentColors.blue200,
    blue300: accentColors.blue300,
    blue400: accentColors.blue400,
    blue500: accentColors.blue500,
    blue600: t.accentGradient[1],
    blue900: accentColors.blue900,
    purple500: accentColors.purple500,
    pink500: accentColors.pink500,
    emerald500: accentColors.emerald500,
    teal500: accentColors.teal500,
    amber50: accentColors.amber50,
    amber100: accentColors.amber100,
    amber200: accentColors.amber200,
    red300: accentColors.red300,
    red400: accentColors.red400,
    red600: accentColors.red600,
    red700: accentColors.red700,
    white: t.isDark ? '#ffffff' : t.foreground,
  };
}

export const DARK_SURFACE_THEMES: readonly AppTheme[] = [
  'dark',
  'neon',
  'ocean',
  'forest',
  'ember',
  'aurora',
];

export function assertAllThemesHaveTokens() {
  for (const theme of APP_THEMES) {
    if (!THEME_TOKENS[theme]) {
      throw new Error(`Missing tokens for theme: ${theme}`);
    }
  }
}
