import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type DetailHeaderProps = {
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  starred?: boolean;
};

export function DetailHeader({
  title,
  subtitle,
  iconColor,
  iconName = 'folder-outline',
  starred,
}: DetailHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((c) => ({
    wrap: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      marginBottom: 8,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: 'rgba(51, 65, 85, 0.45)',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    copy: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    titleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    title: {
      flexShrink: 1,
      fontFamily: fonts.heading,
      fontSize: 18,
      color: c.white,
    },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: c.slate400,
    },
  }));

  const resolvedIconColor = iconColor ?? colors.cyan500;
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => router.push(ROUTES.APP.TASKS as never)}
        hitSlop={8}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={18} color={colors.slate300} />
      </Pressable>

      <View style={[styles.iconWrap, { backgroundColor: `${resolvedIconColor}33` }]}>
        <Ionicons name={iconName} size={18} color={resolvedIconColor} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {starred ? <Ionicons name="star" size={14} color="#facc15" /> : null}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
