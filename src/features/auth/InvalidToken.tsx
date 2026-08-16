import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, type Href } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { GlassCard } from './GlassCard';

type InvalidTokenProps = {
  tokenType?: string;
  message?: string;
  redirectPath?: Href;
};

export function InvalidToken({
  tokenType = 'Authentication',
  message = 'The token you provided is invalid or has expired.',
  redirectPath = ROUTES.AUTH.LOGIN,
}: InvalidTokenProps) {
  const router = useRouter();

  return (
    <GlassCard>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="warning-outline" size={14} color={colors.red300} />
          <Text style={styles.badgeText}>{tokenType} Error</Text>
        </View>
        <Text style={styles.title}>Invalid Token</Text>
        <Text style={styles.description}>{message}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.notice}>
          <Ionicons name="shield-outline" size={18} color={colors.red400} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>Security Notice</Text>
            <Text style={styles.noticeText}>
              This can happen if your token expired, was revoked, or is malformed.
              Please try authenticating again.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.replace(redirectPath)}
          style={({ pressed }) => [styles.submitWrap, pressed && styles.pressed]}
        >
          <LinearGradient
            colors={[colors.red600, colors.red700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submit}
          >
            <View style={styles.row}>
              <Ionicons name="refresh-outline" size={16} color={colors.white} />
              <Text style={styles.submitText}>Try Again</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Link href={ROUTES.AUTH.LOGIN} asChild>
          <Pressable>
            {({ pressed }) => (
              <Text style={[styles.link, pressed && styles.linkPressed]}>
                Back to Login
              </Text>
            )}
          </Pressable>
        </Link>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.red300,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    color: colors.red300,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
    alignItems: 'center',
  },
  notice: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.25)',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: 14,
  },
  noticeCopy: {
    flex: 1,
    gap: 4,
  },
  noticeTitle: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.red300,
  },
  noticeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
    lineHeight: 18,
  },
  submitWrap: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  submit: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  link: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan400,
  },
  linkPressed: {
    color: colors.cyan300,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
