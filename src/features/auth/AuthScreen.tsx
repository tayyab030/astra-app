import { useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginBackground } from '@/features/auth/LoginBackground';
import { BlurTargetContext } from '@/features/auth/GlassCard';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type AuthScreenProps = {
  children: ReactNode;
};

export function AuthScreen({ children }: AuthScreenProps) {
  const blurTargetRef = useRef<View | null>(null);
  const { tokens } = useAppTheme();
  const styles = useThemedStyles((_c, t) => ({
    root: {
      flex: 1,
      backgroundColor: t.background,
      overflow: 'hidden' as const,
    },
    safe: {
      flex: 1,
    },
  }));

  return (
    <BlurTargetContext.Provider value={blurTargetRef}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={tokens.pageGradient}
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
