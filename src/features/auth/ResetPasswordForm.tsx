import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { AUTH, publicApi } from '@/lib/api';
import {
  collectApiErrorMessages,
  formatCountdown,
} from './authErrors';
import { GlassCard } from './GlassCard';
import { InvalidToken } from './InvalidToken';
import {
  schema,
  type ResetPasswordType,
} from './reset-password.schema';

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = paramValue(params.token);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [focusedField, setFocusedField] = useState<'password' | 'confirmPassword' | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({
    control,
    name: 'confirmPassword',
    defaultValue: '',
  });

  const passwordsMatch =
    Boolean(password) && Boolean(confirmPassword) && password === confirmPassword;

  const passwordRules = useMemo(
    () => [
      { rule: 'At least 1 uppercase letter', test: /[A-Z]/.test(password) },
      { rule: 'At least 1 lowercase letter', test: /[a-z]/.test(password) },
      { rule: 'At least 1 number', test: /\d/.test(password) },
      {
        rule: 'At least 1 special character',
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
      { rule: 'Minimum 8 characters', test: password.length >= 8 },
    ],
    [password],
  );

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ type, message });
  };

  const checkResetStatus = async () => {
    if (!token) {
      setIsInvalidToken(true);
      return null;
    }

    try {
      const response = await publicApi.get(AUTH.PASSWORD_RESET_STATUS(token));
      setIsInvalidToken(false);
      setTimeLeft(response.data.remaining_time_seconds ?? 0);
      return response.data;
    } catch {
      setIsInvalidToken(true);
      return null;
    }
  };

  const { isLoading } = useQuery({
    queryKey: ['password-reset-status', token],
    queryFn: checkResetStatus,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (!token) setIsInvalidToken(true);
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordType) => {
      const response = await publicApi.post(AUTH.RESET_PASSWORD, {
        token,
        ...data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      showToast('success', data?.message || 'Password reset successful');
      router.replace(ROUTES.AUTH.LOGIN);
    },
    onError: (error: unknown) => {
      showToast(
        'error',
        collectApiErrorMessages(error, 'Failed to reset password. Please try again.'),
      );
    },
  });

  const onSubmit = (data: ResetPasswordType) => {
    if (!token) {
      showToast('error', 'Invalid reset link.');
      return;
    }
    mutate(data);
  };

  if (!token || isInvalidToken) {
    return (
      <InvalidToken
        tokenType="Password Reset"
        message="This password reset link is invalid or has expired."
        redirectPath={ROUTES.AUTH.FORGOT_PASSWORD}
      />
    );
  }

  if (isLoading) {
    return (
      <GlassCard>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan400} />
          <Text style={styles.loadingText}>Validating recovery link...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>Neural Recovery</Text>
        <Text style={styles.description}>Set your new neural pathway</Text>
      </View>

      <View style={styles.content}>
        {toast ? (
          <View
            style={[
              styles.toast,
              toast.type === 'error' ? styles.toastError : styles.toastSuccess,
            ]}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ) : null}

        <Text style={styles.copy}>
          Choose a new password for your ASTRA account. This link expires in{' '}
          <Text style={styles.linkInline}>{formatCountdown(timeLeft)}</Text>.
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrap}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    secureTextEntry={!showPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.slate400}
                    selectionColor={colors.cyan400}
                    underlineColorAndroid="transparent"
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
                  color={
                    focusedField === 'password' ? colors.cyan400 : colors.slate400
                  }
                />
              </Pressable>
            </View>
            {errors.password ? (
              <Text style={styles.error}>{errors.password.message}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordWrap}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.slate400}
                    selectionColor={colors.cyan400}
                    underlineColorAndroid="transparent"
                    style={[
                      styles.input,
                      styles.passwordInput,
                      focusedField === 'confirmPassword' && styles.inputFocused,
                    ]}
                  />
                )}
              />
              <Pressable
                onPress={() => setShowConfirmPassword((current) => !current)}
                hitSlop={8}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={
                    focusedField === 'confirmPassword'
                      ? colors.cyan400
                      : colors.slate400
                  }
                />
              </Pressable>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            ) : null}
            {confirmPassword ? (
              <View style={styles.ruleRow}>
                <Ionicons
                  name={passwordsMatch ? 'checkmark' : 'close'}
                  size={14}
                  color={passwordsMatch ? colors.emerald500 : colors.red400}
                />
                <Text
                  style={[
                    styles.ruleText,
                    {
                      color: passwordsMatch ? colors.emerald500 : colors.red400,
                    },
                  ]}
                >
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.rulesBox}>
            {passwordRules.map((rule) => (
              <View key={rule.rule} style={styles.ruleRow}>
                <Ionicons
                  name={rule.test ? 'checkmark' : 'close'}
                  size={14}
                  color={rule.test ? colors.emerald500 : colors.slate400}
                />
                <Text
                  style={[
                    styles.ruleText,
                    { color: rule.test ? colors.emerald500 : colors.slate400 },
                  ]}
                >
                  {rule.rule}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isPending || timeLeft <= 0 || !passwordsMatch}
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && styles.pressed,
              (isPending || timeLeft <= 0 || !passwordsMatch) && styles.disabled,
            ]}
          >
            <LinearGradient
              colors={[colors.cyan600, colors.blue600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submit}
            >
              {isPending ? (
                <View style={styles.row}>
                  <ActivityIndicator size="small" color={colors.white} />
                  <Text style={styles.submitText}>Updating...</Text>
                </View>
              ) : (
                <View style={styles.row}>
                  <Ionicons name="key-outline" size={16} color={colors.white} />
                  <Text style={styles.submitText}>Reset Password</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Link href={ROUTES.AUTH.LOGIN} asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={styles.backRow}>
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={pressed ? colors.cyan300 : colors.cyan400}
                  />
                  <Text style={[styles.link, pressed && styles.linkPressed]}>
                    Back to Login
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>
          <Text style={styles.footerText}>
            Need a new link?{' '}
            <Link href={ROUTES.AUTH.FORGOT_PASSWORD} asChild>
              <Text style={styles.link}>Request again</Text>
            </Link>
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  loading: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
  },
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
  copy: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkInline: {
    color: colors.cyan400,
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
  rulesBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 12,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontFamily: fonts.regular,
    fontSize: 12,
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
