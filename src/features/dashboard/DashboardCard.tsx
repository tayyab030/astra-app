import { useContext, type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { BlurTargetContext } from '@/features/auth/GlassCard';

type DashboardCardProps = {
  children: ReactNode;
  borderColor?: string;
  shadowColor?: string;
  style?: ViewStyle;
};

export function DashboardCard({
  children,
  borderColor = 'rgba(71, 85, 105, 0.5)',
  shadowColor,
  style,
}: DashboardCardProps) {
  const blurTarget = useContext(BlurTargetContext);

  return (
    <BlurView
      intensity={40}
      tint="dark"
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget ?? undefined}
      style={[
        styles.card,
        { borderColor, shadowColor: shadowColor ?? 'transparent' },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.5)', 'rgba(51, 65, 85, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
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
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});
