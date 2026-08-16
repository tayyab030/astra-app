import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = colors.cyan400 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
