import { useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginBackground } from '@/features/auth/LoginBackground';
import { BlurTargetContext } from '@/features/auth/GlassCard';
import { colors } from '@/constants/theme';

type AuthScreenProps = {
  children: ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  const blurTargetRef = useRef<View | null>(null);

  return (
    <BlurTargetContext.Provider value={blurTargetRef}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={[colors.slate900, colors.slate800, colors.slate900]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LoginBackground />
        </BlurTargetView>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {children}
        </SafeAreaView>
      </View>
    </BlurTargetContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.slate900,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
});
