import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import * as SystemUI from 'expo-system-ui';

import {
  getThemeTokens,
  paletteFromTokens,
  type ThemeTokens,
  type ThemedPalette,
} from '@/constants/theme-tokens';
import { useSession } from '@/hooks/useSession';
import {
  DEFAULT_THEME,
  isAppTheme,
  type AppTheme,
} from '@/lib/app-theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

type AppThemeContextValue = {
  theme: AppTheme;
  tokens: ThemeTokens;
  colors: ThemedPalette;
  setTheme: (next: AppTheme) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [theme, setThemeState] = useState<AppTheme>(() =>
    isAppTheme(user?.theme) ? user.theme : DEFAULT_THEME,
  );

  useEffect(() => {
    if (isAppTheme(user?.theme)) {
      setThemeState(user.theme);
    }
  }, [user?.theme]);

  const setTheme = useCallback((next: AppTheme) => {
    if (!isAppTheme(next)) return;
    setThemeState(next);
  }, []);

  const tokens = useMemo(() => getThemeTokens(theme), [theme]);
  const colors = useMemo(() => paletteFromTokens(tokens), [tokens]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(tokens.background);
  }, [tokens.background]);

  const value = useMemo(
    () => ({ theme, tokens, colors, setTheme }),
    [theme, tokens, colors, setTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    const tokens = getThemeTokens(DEFAULT_THEME);
    return {
      theme: DEFAULT_THEME,
      tokens,
      colors: paletteFromTokens(tokens),
      setTheme: () => {},
    };
  }
  return ctx;
}

/** Dynamic StyleSheet that rebuilds when the active theme changes. */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (colors: ThemedPalette, tokens: ThemeTokens) => T,
): T {
  const { colors, tokens } = useAppTheme();
  // Intentionally depend on colors/tokens only — factory is recreated each render.
  return useMemo(
    () => StyleSheet.create(factory(colors, tokens)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- theme identity lives in colors/tokens
    [colors, tokens],
  );
}

export function useThemedColors(): ThemedPalette {
  return useAppTheme().colors;
}
