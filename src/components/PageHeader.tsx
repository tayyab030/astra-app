import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <View style={styles.root}>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  textBlock: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 30,
    color: colors.cyan300,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate300,
    marginTop: 4,
  },
});
