import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { AUTH, publicApi } from '@/lib/api';
import { setSession } from '@/lib/auth/tokenManager';
import { GlassCard } from './GlassCard';
import { schema, type LoginType } from './login.schema';

type UnverifiedState = {
  userId: string;
  otpToken: string | null;
  otpStillValid: boolean;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [unverified, setUnverified] = useState<UnverifiedState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [focusedField, setFocusedField] = useState<'login' | 'password' | null>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginType>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ type, message });
  };

  const onSubmit = async (data: LoginType) => {
    setUnverified(null);
    setToast(null);

    try {
      const response = await publicApi.post(AUTH.LOGIN, data);
      const { access, refresh, user } = response.data;

      await setSession({ access, refresh, user });
      showToast('success', 'Login successful');
      router.replace(ROUTES.APP.DASHBOARD);
    } catch (error: unknown) {
      console.error(error);
      const errorData = axios.isAxiosError(error) ? error.response?.data : undefined;

      if (errorData?.is_unverified) {
        setUnverified({
          userId: errorData.user_id,
          otpToken: errorData.otp_token ?? null,
          otpStillValid: Boolean(errorData.otp_still_valid),
        });
      }

      const nonFieldErrors = errorData?.non_field_errors;
      if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        showToast('error', nonFieldErrors.join('\n'));
      } else {
        showToast('error', 'Login failed');
      }
    }
  };

  const handleResendVerification = async () => {
    const { login, password } = getValues();

    if (!login || !password) {
      showToast('error', 'Enter your email/username and password first');
      return;
    }

    try {
      const response = await publicApi.post(AUTH.RESEND_OTP_LOGIN, {
        login,
        password,
      });

      const otpToken = response?.data?.otp?.token;
      if (!otpToken) {
        showToast('error', 'Could not start verification. Please try again.');
        return;
      }

      if (response?.data?.resent) {
        showToast('success', 'New verification code sent!');
      } else {
        showToast('success', 'Your verification code is still valid.');
      }

      router.push({
        pathname: ROUTES.AUTH.VERIFY_OTP,
        params: { otp_token: otpToken },
      });
    } catch (error: unknown) {
      console.error(error);
      const errorData = axios.isAxiosError(error) ? error.response?.data : undefined;
      const nonFieldErrors = errorData?.non_field_errors;
      if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
        showToast('error', nonFieldErrors[0]);
      } else {
        showToast('error', 'Failed to resend verification code');
      }
    }
  };

  const { mutate: handleLogin, isPending: isLoggingIn } = useMutation({
    mutationFn: onSubmit,
  });

  const { mutate: resendVerification, isPending: isResendingOtp } = useMutation({
    mutationFn: handleResendVerification,
  });

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>ASTRA Login</Text>
        <Text style={styles.description}>Access your Life OS dashboard</Text>
      </View>

      <View style={styles.content}>
        {toast && (
          <View
            style={[
              styles.toast,
              toast.type === 'error' ? styles.toastError : styles.toastSuccess,
            ]}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}

        {unverified && (
          <View style={styles.unverified}>
            <Text style={styles.unverifiedText}>
              Your account exists but your email is not verified yet.
              {unverified.otpStillValid
                ? ' You can continue with your existing code or request a new one.'
                : ' Request a new verification code to activate your account.'}
            </Text>
            <Pressable
              onPress={() => resendVerification()}
              disabled={isResendingOtp}
              style={({ pressed }) => [
                styles.unverifiedButton,
                pressed && styles.pressed,
                isResendingOtp && styles.disabled,
              ]}
            >
              {isResendingOtp ? (
                <View style={styles.row}>
                  <ActivityIndicator size="small" color={colors.amber100} />
                  <Text style={styles.unverifiedButtonText}>Sending code...</Text>
                </View>
              ) : (
                <View style={styles.row}>
                  <Ionicons name="mail-outline" size={16} color={colors.amber100} />
                  <Text style={styles.unverifiedButtonText}>
                    {unverified.otpStillValid
                      ? 'Continue verification'
                      : 'Resend verification code'}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email or Username</Text>
            <Controller
              control={control}
              name="login"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    setUnverified(null);
                  }}
                  onFocus={() => setFocusedField('login')}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  keyboardType="email-address"
                  placeholder="Enter your email or username"
                  placeholderTextColor={colors.slate400}
                  selectionColor={colors.cyan400}
                  underlineColorAndroid="transparent"
                  textAlignVertical="center"
                  style={[
                    styles.input,
                    focusedField === 'login' && styles.inputFocused,
                  ]}
                />
              )}
            />
            {errors.login && (
              <Text style={styles.error}>{errors.login.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      setUnverified(null);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.slate400}
                    selectionColor={colors.cyan400}
                    underlineColorAndroid="transparent"
                    textAlignVertical="center"
                    style={[
                      styles.input,
                      styles.passwordInput,
                      focusedField === 'password' && styles.inputFocused,
                    ]}
                  />
                )}
              />
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                hitSlop={8}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={focusedField === 'password' ? colors.cyan400 : colors.slate400}
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>

          <Pressable
            onPress={handleSubmit((data) => handleLogin(data))}
            disabled={isLoggingIn}
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && styles.pressed,
              isLoggingIn && styles.disabled,
            ]}
          >
            <LinearGradient
              colors={[colors.cyan600, colors.blue600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submit}
            >
              {isLoggingIn ? (
                <View style={styles.row}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.submitText}>Authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Initialize Session</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Link href={ROUTES.AUTH.FORGOT_PASSWORD} asChild>
            <Pressable>
              {({ pressed }) => (
                <Text style={[styles.link, pressed && styles.linkPressed]}>
                  Forgot neural pathway?
                </Text>
              )}
            </Pressable>
          </Link>
          <Text style={styles.footerText}>
            New to ASTRA?{' '}
            <Link href={ROUTES.AUTH.SIGNUP} asChild>
              <Text style={styles.link}>Create neural profile</Text>
            </Link>
          </Text>
        </View>
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
  title: {
    fontFamily: fonts.semibold,
    fontSize: 30,
    color: colors.cyan100,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 24,
  },
  toast: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  toastError: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  toastSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  toastText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.white,
  },
  unverified: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    gap: 12,
  },
  unverifiedText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.amber200,
    lineHeight: 20,
  },
  unverifiedButton: {
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 6,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unverifiedButtonText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.amber100,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan200,
  },
  input: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: colors.cyan400,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 40,
    justifyContent: 'center',
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.red400,
  },
  submitWrap: {
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: colors.cyan500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
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
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  link: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan400,
  },
  linkPressed: {
    color: colors.cyan300,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
