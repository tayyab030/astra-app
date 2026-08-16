import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';
import { horizonLabel, type InsightHorizon } from '@/lib/api/insights';

export function InsightHorizonBadge({
  horizon,
}: {
  horizon?: InsightHorizon | string | null;
}) {
  const styles = useThemedStyles((colors) => ({
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
      textTransform: 'uppercase' as const,
      color: colors.slate400,
    },
  }));

  const label = horizonLabel(horizon);
  if (!label) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
