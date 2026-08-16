import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';

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
  iconColor = colors.cyan500,
  iconName = 'folder-outline',
  starred,
}: DetailHeaderProps) {
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

      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}33` }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
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

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.45)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
});
