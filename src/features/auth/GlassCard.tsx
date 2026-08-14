import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { colors } from '@/constants/theme';

export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function GlassCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const blurTarget = useContext(BlurTargetContext);

  return (
    <BlurView
      intensity={50}
      tint="dark"
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget ?? undefined}
      style={[styles.card, style]}
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    gap: 24,
    shadowColor: colors.cyan500,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 16,
  },
});
