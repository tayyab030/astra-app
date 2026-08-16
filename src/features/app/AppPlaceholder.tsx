import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

export function AppPlaceholder({ title }: { title: string }) {
  const styles = useThemedStyles((colors) => ({
    wrap: {
      flex: 1,
      padding: 24,
      gap: 16,
    },
    title: {
      fontFamily: fonts.headingBold,
      fontSize: 24,
      color: colors.cyan300,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: colors.slate300,
    },
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <DashboardCard>
        <Text style={styles.body}>Coming soon.</Text>
      </DashboardCard>
    </View>
  );
}
