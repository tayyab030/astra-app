import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { ROUTES } from '@/constants/routes';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { AUTH, publicApi } from '@/lib/api';
import { formatCountdown } from './authErrors';
import { GlassCard } from './GlassCard';
import { InvalidToken } from './InvalidToken';

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

const OTP_LENGTH = 6;

function paramValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function VerifyOtpForm() {
  const { tokens, colors } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
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
    fontSize: 24,
    color: colors.cyan100,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  otpInput: {
    width: 44,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 20,
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: colors.cyan400,
  },
  timerBlock: {
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  timerAccent: {
    color: colors.cyan400,
  },
  expired: {
    fontFamily: fonts.regular,
    fontSize: 13,
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
    fontSize: 15,
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan400,
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
  const params = useLocalSearchParams<{ otp_token?: string | string[] }>();
  const [token, setToken] = useState(paramValue(params.otp_token));
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(300);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    setToken(paramValue(params.otp_token));
  }, [params.otp_token]);

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ type, message });
  };

  const checkOtpStatus = async () => {
    if (!token) {
      setIsInvalidToken(true);
      return null;
    }

    try {
      const response = await publicApi.get(AUTH.OTP_STATUS(token));
      setIsInvalidToken(false);
      setTimeLeft(response.data.remaining_time_seconds ?? 0);
      return response.data as { user_id?: string; remaining_time_seconds?: number };
    } catch (error) {
      setIsInvalidToken(true);
      console.error(error);
      return null;
    }
  };

  const { data: status, refetch: refetchOtpStatus, isLoading } = useQuery({
    queryKey: ['otp-status', token],
    queryFn: checkOtpStatus,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const applyOtpValue = (raw: string, index: number) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    if (digits.length > 1) {
      const next = [...otp];
      for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i += 1) {
        next[index + i] = digits[i];
      }
      setOtp(next);
      const focusAt = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusAt]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = digits;
    setOtp(next);
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      showToast('error', 'Please enter all 6 digits');
      return;
    }
    if (!status?.user_id) {
      showToast('error', 'User not found');
      return;
    }

    try {
      await publicApi.post(AUTH.VERIFY_OTP, {
        user_id: status.user_id,
        otp_code: otpCode,
      });
      showToast('success', 'OTP verified successfully');
      router.replace(ROUTES.AUTH.LOGIN);
    } catch (error: unknown) {
      console.error(error);
      const errorData = axios.isAxiosError(error) ? error.response?.data : undefined;
      if (!errorData || typeof errorData !== 'object') {
        showToast('error', 'Failed to verify OTP');
        return;
      }

      const otpMsg = errorData.otp_code?.[0];
      const attemptsUsed = errorData.attempts_used?.[0];
      const maxAttempts = errorData.max_attempts?.[0];
      const remaining = errorData.remaining_attempts?.[0];
      const errorType = errorData.error_type?.[0];

      if (errorType === 'invalid_code') {
        showToast(
          'error',
          otpMsg ||
            `Invalid OTP. You have used ${attemptsUsed}/${maxAttempts} attempts. ${remaining} left.`,
        );
        refetchOtpStatus();
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        showToast('error', 'Unknown error occurred.');
      }
    }
  };

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useMutation({
    mutationFn: handleVerify,
  });

  const handleResend = async () => {
    if (!status?.user_id) {
      showToast('error', 'User not found');
      return;
    }

    try {
      const response = await publicApi.post(AUTH.RESEND_OTP, {
        user_id: status.user_id,
      });
      const nextToken = response?.data?.otp?.token;
      if (nextToken) {
        setToken(String(nextToken));
        router.setParams({ otp_token: String(nextToken) });
      }
      showToast('success', 'New verification code sent!');
      setOtp(Array(OTP_LENGTH).fill(''));
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to resend verification code');
    }
  };

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: handleResend,
  });

  if (!token || isInvalidToken) {
    return (
      <InvalidToken
        tokenType="Authentication"
        message="This verification link is invalid or has expired."
        redirectPath={ROUTES.AUTH.SIGNUP}
      />
    );
  }

  if (isLoading && !status) {
    return (
      <GlassCard>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.cyan400} />
          <Text style={styles.loadingText}>Checking verification status...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>Neural Verification</Text>
        <Text style={styles.description}>
          Enter the 6-digit code sent to your neural interface
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

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={`otp-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={digit}
              onChangeText={(value) => applyOtpValue(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              selectionColor={colors.cyan400}
              underlineColorAndroid="transparent"
              style={[
                styles.otpInput,
                focusedIndex === index && styles.inputFocused,
              ]}
            />
          ))}
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerText}>
            Code expires in:{' '}
            <Text style={styles.timerAccent}>{formatCountdown(timeLeft)}</Text>
          </Text>
          {timeLeft === 0 ? (
            <Text style={styles.expired}>Verification code expired</Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => verifyOtp()}
          disabled={
            isVerifyingOtp || otp.join('').length !== OTP_LENGTH || timeLeft === 0
          }
          style={({ pressed }) => [
            styles.submitWrap,
            pressed && styles.pressed,
            (isVerifyingOtp ||
              otp.join('').length !== OTP_LENGTH ||
              timeLeft === 0) &&
              styles.disabled,
          ]}
        >
          <LinearGradient
            colors={tokens.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submit}
          >
            {isVerifyingOtp ? (
              <View style={styles.row}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.submitText}>Verifying Neural Link...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Activate Neural Connection</Text>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Pressable
            onPress={() => resendOtp()}
            disabled={timeLeft > 0 || isResending}
            style={({ pressed }) => [
              pressed && styles.pressed,
              (timeLeft > 0 || isResending) && styles.disabled,
            ]}
          >
            <Text style={styles.link}>
              {timeLeft > 0
                ? `Resend available in ${formatCountdown(timeLeft)}`
                : isResending
                  ? 'Sending...'
                  : 'Resend verification code'}
            </Text>
          </Pressable>
          <Text style={styles.footerText}>
            Wrong neural interface?{' '}
            <Link href={ROUTES.AUTH.SIGNUP} asChild>
              <Text style={styles.link}>Update profile</Text>
            </Link>
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
