import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { AUTH, publicApi } from '@/lib/api';
import {
  collectApiErrorMessages,
  formatCountdown,
} from './authErrors';
import {
  schema,
  type ForgotPasswordType,
} from './forgot-password.schema';
import { GlassCard } from './GlassCard';

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

type ForgotResponse = {
  message?: string;
  sent?: boolean;
  reset_token?: string;
  remaining_time_seconds?: number;
};

export function ForgotPasswordForm() {
  const { tokens, colors } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
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
  successBlock: {
    alignItems: 'center',
    gap: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.cyan100,
    textAlign: 'center',
  },
  successCopy: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkInline: {
    color: colors.cyan400,
  },
  amber: {
    color: colors.amber200,
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
}));

  const router = useRouter();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [focused, setFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [linkSent, setLinkSent] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const email = useWatch({ control, name: 'email', defaultValue: '' });

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ type, message });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ForgotPasswordType) => {
      const response = await publicApi.post(AUTH.FORGOT_PASSWORD, data);
      return response.data as ForgotResponse;
    },
    onSuccess: (data) => {
      if (typeof data?.reset_token === 'string' && data.reset_token.length > 0) {
        showToast('success', data.message || 'Continue to set a new password.');
        router.push({
          pathname: ROUTES.AUTH.RESET_PASSWORD,
          params: { token: data.reset_token },
        });
        return;
      }

      setIsSubmitted(true);
      setLinkSent(data?.sent !== false);
      setRemainingSeconds(
        typeof data?.remaining_time_seconds === 'number'
          ? data.remaining_time_seconds
          : null,
      );

      if (data?.sent === false) {
        showToast(
          'success',
          data?.message || 'Your recovery link is still valid. Check your inbox.',
        );
      } else {
        showToast('success', data?.message || 'Recovery link sent');
      }
    },
    onError: (error: unknown) => {
      showToast(
        'error',
        collectApiErrorMessages(
          error,
          'Failed to send recovery link. Please try again.',
        ),
      );
    },
  });

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>Neural Recovery</Text>
        <Text style={styles.description}>
          {isSubmitted
            ? linkSent
              ? 'Recovery link transmitted'
              : 'Recovery link still active'
            : 'Reset your neural pathway'}
        </Text>
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

        {!isSubmitted ? (
          <>
            <Text style={styles.copy}>
              Enter your registered neural address and we'll send you a secure
              recovery link to restore access to your ASTRA Life OS.
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Neural Address</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => {
                        onBlur();
                        setFocused(false);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      keyboardType="email-address"
                      placeholder="neural@astra.ai"
                      placeholderTextColor={colors.slate400}
                      selectionColor={colors.cyan400}
                      underlineColorAndroid="transparent"
                      style={[styles.input, focused && styles.inputFocused]}
                    />
                  )}
                />
                {errors.email ? (
                  <Text style={styles.error}>{errors.email.message}</Text>
                ) : null}
              </View>

              <Pressable
                onPress={handleSubmit((data) => mutate(data))}
                disabled={isPending}
                style={({ pressed }) => [
                  styles.submitWrap,
                  pressed && styles.pressed,
                  isPending && styles.disabled,
                ]}
              >
                <LinearGradient
                  colors={tokens.accentGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submit}
                >
                  {isPending ? (
                    <View style={styles.row}>
                      <ActivityIndicator size="small" color={colors.white} />
                      <Text style={styles.submitText}>Transmitting...</Text>
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <Ionicons name="mail-outline" size={16} color={colors.white} />
                      <Text style={styles.submitText}>Send Recovery Link</Text>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.successBlock}>
            <LinearGradient
              colors={
                linkSent
                  ? [colors.cyan600, colors.blue600]
                  : ['#f59e0b', '#ea580c']
              }
              style={styles.successIcon}
            >
              <Ionicons
                name={linkSent ? 'mail-outline' : 'time-outline'}
                size={28}
                color={colors.white}
              />
            </LinearGradient>
            <Text style={styles.successTitle}>
              {linkSent ? 'Recovery Link Sent' : 'Recovery Link Still Valid'}
            </Text>
            <Text style={styles.successCopy}>
              {linkSent ? (
                <>
                  We've transmitted a secure recovery link to{' '}
                  <Text style={styles.linkInline}>{email}</Text>. Check your
                  neural inbox and follow the instructions to restore access.
                </>
              ) : (
                <>
                  A recovery link was already sent to{' '}
                  <Text style={styles.linkInline}>{email}</Text> and is still
                  active
                  {remainingSeconds !== null ? (
                    <>
                      {' '}
                      for{' '}
                      <Text style={styles.amber}>
                        {formatCountdown(remainingSeconds)}
                      </Text>
                    </>
                  ) : null}
                  . Check your inbox and use the existing link.
                </>
              )}
            </Text>
          </View>
        )}

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
