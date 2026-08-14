import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';

export function AppPlaceholder({ title }: { title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <DashboardCard>
        <Text style={styles.body}>This module is coming next.</Text>
      </DashboardCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 30,
    color: colors.cyan300,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate300,
  },
});
