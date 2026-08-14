import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { AuthScreen } from '@/features/auth/AuthScreen';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthScreen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LoginForm />
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
