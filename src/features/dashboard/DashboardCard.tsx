import { useContext, type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { BlurTargetContext } from '@/features/auth/GlassCard';
import { useAppTheme } from '@/features/theme/AppThemeProvider';

type DashboardCardProps = {
  children: ReactNode;
  borderColor?: string;
  shadowColor?: string;
  style?: ViewStyle;
};

export function DashboardCard({
  children,
  borderColor,
  shadowColor,
  style,
}: DashboardCardProps) {
  const blurTarget = useContext(BlurTargetContext);
  const { tokens } = useAppTheme();

  return (
    <BlurView
      intensity={40}
      tint={tokens.blurTint}
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget ?? undefined}
      style={[
        styles.card,
        {
          borderColor: borderColor ?? tokens.border,
          shadowColor: shadowColor ?? (tokens.fxOpacity > 0 ? tokens.glowPrimary : 'transparent'),
          backgroundColor: tokens.card,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[tokens.secondary, tokens.muted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: tokens.isDark ? 0.5 : 0.35 }]}
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});
