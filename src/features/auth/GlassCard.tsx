import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '@/features/theme/AppThemeProvider';

export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function GlassCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const blurTarget = useContext(BlurTargetContext);
  const { tokens } = useAppTheme();

  return (
    <BlurView
      intensity={50}
      tint={tokens.blurTint}
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget ?? undefined}
      style={[
        styles.card,
        {
          backgroundColor: tokens.card,
          borderColor: tokens.border,
          shadowColor: tokens.glowPrimary,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 448,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    gap: 24,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 16,
  },
});
