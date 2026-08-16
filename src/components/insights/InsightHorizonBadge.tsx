import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { horizonLabel, type InsightHorizon } from '@/lib/api/insights';

export function InsightHorizonBadge({
  horizon,
}: {
  horizon?: InsightHorizon | string | null;
}) {
  const label = horizonLabel(horizon);
  if (!label) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.6)',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.slate400,
  },
});
