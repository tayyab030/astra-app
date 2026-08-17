import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fonts, lineHeights, type } from '@/constants/theme';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  const styles = useThemedStyles((c, t) => ({
    root: {
      gap: 12,
    },
    textBlock: {
      gap: 2,
    },
    title: {
      fontFamily: fonts.headingBold,
      fontSize: type.title,
      color: t.primary,
      lineHeight: lineHeights.title,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: type.md,
      lineHeight: lineHeights.md,
      color: c.slate300,
      marginTop: 2,
    },
  }));

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
