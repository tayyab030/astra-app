import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthScreen } from '@/features/auth/AuthScreen';
import { GlassCard } from '@/features/auth/GlassCard';
import { colors, fonts } from '@/constants/theme';

type AuthPlaceholderProps = {
  title: string;
  description: string;
};

export function AuthPlaceholder({ title, description }: AuthPlaceholderProps) {
  const router = useRouter();

  return (
    <AuthScreen>
      <View style={styles.wrap}>
        <GlassCard>
          <View style={styles.inner}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>Back to login</Text>
            </Pressable>
          </View>
        </GlassCard>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  inner: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    color: colors.cyan100,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
    textAlign: 'center',
  },
  backText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan400,
  },
});
