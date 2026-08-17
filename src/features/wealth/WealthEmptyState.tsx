import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type WealthEmptyStateProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
};

export function WealthEmptyState({ icon, title, description }: WealthEmptyStateProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  iconWrap: {
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 999,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.slate200,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
    maxWidth: 360,
  },
}));

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color={colors.slate400} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

