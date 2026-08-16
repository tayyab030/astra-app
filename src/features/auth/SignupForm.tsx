import { useMemo, useState } from 'react';
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
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { AUTH, publicApi } from '@/lib/api';
import { COUNTRIES, getCountryByCode } from '@/lib/countries';
import { USER_GENDER_OPTIONS } from '@/lib/gender';
import { collectApiErrorMessages } from './authErrors';
import { AuthSelect } from './AuthSelect';
import { GlassCard } from './GlassCard';
import { schema, type SignUpType } from './signup.schema';

type ToastState = {
  type: 'success' | 'error';
  message: string;
};

type FocusField =
  | 'first_name'
  | 'last_name'
  | 'username'
  | 'email'
  | 'gender'
  | 'country'
  | 'password'
  | 'confirmPassword'
  | null;

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpType>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      gender: '',
      country: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const confirmPassword = useWatch({
    control,
    name: 'confirmPassword',
    defaultValue: '',
  });
  const country = useWatch({ control, name: 'country', defaultValue: '' });
  const gender = useWatch({ control, name: 'gender', defaultValue: '' });
  const terms = useWatch({ control, name: 'terms', defaultValue: false });

  const selectedCountry = country ? getCountryByCode(country) : undefined;
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

  const countryOptions = useMemo(
    () => COUNTRIES.map((item) => ({ value: item.code, label: item.name })),
    [],
  );

  const showToast = (type: ToastState['type'], message: string) => {
    setToast({ type, message });
  };

  const onSubmit = async (data: SignUpType) => {
    setToast(null);
    try {
      const response = await publicApi.post(AUTH.REGISTER, data);
      showToast('success', response?.data?.message || 'Profile created successfully');
      const otpToken = response?.data?.otp_token;
      if (otpToken) {
        router.push({
          pathname: ROUTES.AUTH.VERIFY_OTP,
          params: { otp_token: String(otpToken) },
        });
      } else {
        router.replace(ROUTES.AUTH.LOGIN);
      }
    } catch (error: unknown) {
      console.error(error);
      showToast(
        'error',
        collectApiErrorMessages(error, 'Failed to create profile. Please try again.'),
      );
    }
  };

  const { mutate: handleSignup, isPending } = useMutation({
    mutationFn: onSubmit,
  });

  return (
    <GlassCard>
      <View style={styles.header}>
        <Text style={styles.title}>Join ASTRA</Text>
        <Text style={styles.description}>Initialize your neural profile</Text>
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

        <View style={styles.form}>
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First Name</Text>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('first_name')}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder="First name"
                    placeholderTextColor={colors.slate400}
                    selectionColor={colors.cyan400}
                    underlineColorAndroid="transparent"
                    style={[
                      styles.input,
                      focusedField === 'first_name' && styles.inputFocused,
                    ]}
                  />
                )}
              />
              {errors.first_name ? (
                <Text style={styles.error}>{errors.first_name.message}</Text>
              ) : null}
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Last Name</Text>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onFocus={() => setFocusedField('last_name')}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder="Last name"
                    placeholderTextColor={colors.slate400}
                    selectionColor={colors.cyan400}
                    underlineColorAndroid="transparent"
                    style={[
                      styles.input,
                      focusedField === 'last_name' && styles.inputFocused,
                    ]}
                  />
                )}
              />
              {errors.last_name ? (
                <Text style={styles.error}>{errors.last_name.message}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  placeholder="Enter your username"
                  placeholderTextColor={colors.slate400}
                  selectionColor={colors.cyan400}
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    focusedField === 'username' && styles.inputFocused,
                  ]}
                />
              )}
            />
            {errors.username ? (
              <Text style={styles.error}>{errors.username.message}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => {
                    onBlur();
                    setFocusedField(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor={colors.slate400}
                  selectionColor={colors.cyan400}
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused,
                  ]}
                />
              )}
            />
            {errors.email ? (
              <Text style={styles.error}>{errors.email.message}</Text>
            ) : null}
          </View>

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Gender</Text>
              <AuthSelect
                value={gender}
                placeholder="Select gender..."
                options={USER_GENDER_OPTIONS}
                focused={focusedField === 'gender'}
                onFocusChange={(next) => setFocusedField(next ? 'gender' : null)}
                onChange={(value) =>
                  setValue('gender', value, { shouldValidate: true })
                }
              />
              {errors.gender ? (
                <Text style={styles.error}>{errors.gender.message}</Text>
              ) : null}
            </View>

            <View style={styles.halfField}>
              <Text style={styles.label}>Country</Text>
              <AuthSelect
                value={country}
                placeholder="Select country..."
                options={countryOptions}
                searchable
                focused={focusedField === 'country'}
                onFocusChange={(next) => setFocusedField(next ? 'country' : null)}
                onChange={(value) =>
                  setValue('country', value, { shouldValidate: true })
                }
              />
              {errors.country ? (
                <Text style={styles.error}>{errors.country.message}</Text>
              ) : null}
            </View>
          </View>

          {selectedCountry ? (
            <Text style={styles.hint}>
              Default currency:{' '}
              <Text style={styles.hintAccent}>{selectedCountry.currency}</Text>
              {' · '}
              Default timezone:{' '}
              <Text style={styles.hintAccent}>{selectedCountry.timezone}</Text>
            </Text>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
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
                    placeholder="Enter your password"
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
            {password ? (
              <View style={styles.rules}>
                {passwordRules.map((rule) => (
                  <View key={rule.rule} style={styles.ruleRow}>
                    <Ionicons
                      name={rule.test ? 'checkmark' : 'close'}
                      size={14}
                      color={rule.test ? colors.emerald500 : colors.red400}
                    />
                    <Text
                      style={[
                        styles.ruleText,
                        { color: rule.test ? colors.emerald500 : colors.red400 },
                      ]}
                    >
                      {rule.rule}
                    </Text>
                  </View>
                ))}
              </View>
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
                    placeholder="Confirm your password"
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

          <Pressable
            onPress={() => setValue('terms', !terms, { shouldValidate: true })}
            style={styles.termsRow}
          >
            <Ionicons
              name={terms ? 'checkbox' : 'square-outline'}
              size={20}
              color={terms ? colors.cyan400 : colors.slate400}
            />
            <Text style={styles.termsText}>
              I accept the Neural Terms and Privacy Protocol
            </Text>
          </Pressable>
          {errors.terms ? (
            <Text style={styles.error}>{errors.terms.message}</Text>
          ) : null}

          <Pressable
            onPress={handleSubmit((data) => handleSignup(data))}
            disabled={isPending || !terms || !passwordsMatch}
            style={({ pressed }) => [
              styles.submitWrap,
              pressed && styles.pressed,
              (isPending || !terms || !passwordsMatch) && styles.disabled,
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
                  <Text style={styles.submitText}>Creating Profile...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Initialize Neural Link</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have a neural profile?{' '}
            <Link href={ROUTES.AUTH.LOGIN} asChild>
              <Text style={styles.link}>Access system</Text>
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
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
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
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: -8,
  },
  hintAccent: {
    color: colors.cyan300,
  },
  rules: {
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
    lineHeight: 18,
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
});
