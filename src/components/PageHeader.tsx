import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  const styles = useThemedStyles((c, t) => ({
    root: {
      gap: 16,
    },
    textBlock: {
      gap: 4,
    },
    title: {
      fontFamily: fonts.headingBold,
      fontSize: 30,
      color: t.primary,
      lineHeight: 36,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: c.slate300,
      marginTop: 4,
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
