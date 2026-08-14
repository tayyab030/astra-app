import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

export function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.red400,
  },
});
