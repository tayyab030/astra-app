import { Text } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

export function FormFieldError({ message }: { message?: string }) {
  const styles = useThemedStyles((colors, tokens) => ({
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.red400,
  },
}));

  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

