import { View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(() => ({
    track: {
      height: 8,
      borderRadius: 999,
      backgroundColor: 'rgba(51, 65, 85, 0.6)',
      overflow: 'hidden' as const,
    },
    fill: {
      height: '100%' as const,
      borderRadius: 999,
    },
  }));
  const resolvedColor = color ?? colors.cyan400;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View
        style={[styles.fill, { width: `${clamped}%`, backgroundColor: resolvedColor }]}
      />
    </View>
  );
}
