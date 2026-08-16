import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ROUTES } from '@/constants/routes';
import { colors, fonts } from '@/constants/theme';
import { PageHeader } from '@/components/PageHeader';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { AlertsSettingsPanel } from '@/features/notifications/AlertsSettingsPanel';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';
import {
  AI_DATA_SCOPE_OPTIONS,
  AI_PERSONALITY_OPTIONS,
  DEFAULT_AI_DATA_SCOPE,
  DEFAULT_AI_INSIGHTS,
  DEFAULT_AI_PERSONALITY,
  DEFAULT_AI_VOICE_MODE,
  isAiDataScope,
  isAiPersonality,
  type AiDataScope,
  type AiPersonality,
} from '@/lib/ai-settings';
import { AI_LANGUAGE_OPTIONS, DEFAULT_AI_LANGUAGE, isAiLanguage, type AiLanguage } from '@/lib/ai-language';
import { AI_VOICE_OPTIONS, DEFAULT_AI_VOICE, isAiVoice, type AiVoice } from '@/lib/ai-voice';
import {
  DEFAULT_THEME,
  THEME_OPTIONS,
  isAppTheme,
  type AppTheme,
} from '@/lib/app-theme';
import {
  fetchCurrentUser,
  getUserErrorMessage,
  requestAccountDeletion,
  requestPasswordResetForCurrentUser,
  updateCurrentUser,
} from '@/lib/api/user';
import {
  clientTypeLabel,
  fetchAuthSessions,
  formatSessionWhen,
  revokeAllAuthSessions,
  revokeAuthSession,
  type AuthSessionApi,
} from '@/lib/api/sessions';
import { getAuthSessionId, logoutSession, updateStoredUser } from '@/lib/auth/tokenManager';
import {
  DEFAULT_MODULE_ENABLED,
  DEFAULT_MODULE_WEIGHTS,
  MODULE_TOGGLE_KEYS,
  MODULE_TOGGLE_LABELS,
  MODULE_WEIGHT_KEYS,
  MODULE_WEIGHT_LABELS,
  moduleWeightsTotal,
  normalizeModuleSettings,
  type ModuleEnabled,
  type ModuleWeights,
} from '@/lib/module-settings';
import { CURRENCY_OPTIONS } from '@/lib/settings/currencies';
import { TIMEZONE_OPTIONS } from '@/lib/settings/timezones';
import { showToast } from '@/lib/ui/toastStore';

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person-outline' as const },
  { id: 'theme', label: 'Theme', icon: 'color-palette-outline' as const },
  { id: 'modules', label: 'Modules', icon: 'grid-outline' as const },
  { id: 'notifications', label: 'Alerts', icon: 'notifications-outline' as const },
  { id: 'ai', label: 'AI', icon: 'hardware-chip-outline' as const },
  { id: 'security', label: 'Security', icon: 'shield-outline' as const },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();

  const initialTab = useMemo((): TabId => {
    const raw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
    if (TABS.some((t) => t.id === raw)) return raw as TabId;
    return 'profile';
  }, [params.tab]);

  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [themePreference, setThemePreference] = useState<AppTheme>(DEFAULT_THEME);
  const [aiVoice, setAiVoice] = useState<AiVoice>(DEFAULT_AI_VOICE);
  const [aiVoiceMode, setAiVoiceMode] = useState(DEFAULT_AI_VOICE_MODE);
  const [aiPersonality, setAiPersonality] = useState<AiPersonality>(DEFAULT_AI_PERSONALITY);
  const [aiInsights, setAiInsights] = useState(DEFAULT_AI_INSIGHTS);
  const [aiDataScope, setAiDataScope] = useState<AiDataScope>(DEFAULT_AI_DATA_SCOPE);
  const [aiLanguage, setAiLanguage] = useState<AiLanguage>(DEFAULT_AI_LANGUAGE);
  const [moduleWeights, setModuleWeights] = useState<ModuleWeights>({ ...DEFAULT_MODULE_WEIGHTS });
  const [moduleEnabled, setModuleEnabled] = useState<ModuleEnabled>({ ...DEFAULT_MODULE_ENABLED });
  const [showSessions, setShowSessions] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isSigningOutEverywhere, setIsSigningOutEverywhere] = useState(false);

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
  });

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: fetchAuthSessions,
    enabled: Boolean(profile?.id) && (showSessions || tab === 'security'),
    staleTime: 30_000,
  });

  const currentAuthSessionId = getAuthSessionId();
  const remoteSessions = sessionsData?.sessions ?? [];
  const sessionCount = sessionsData?.count ?? remoteSessions.length;

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? '');
    setLastName(profile.last_name ?? '');
    setEmail(profile.email ?? '');
    setUsername(profile.username ?? '');
    setCurrency(profile.currency || 'USD');
    setTimezone(profile.timezone || 'UTC');
    setThemePreference(isAppTheme(profile.theme) ? profile.theme : DEFAULT_THEME);
    setAiVoice(isAiVoice(profile.ai_voice) ? profile.ai_voice : DEFAULT_AI_VOICE);
    setAiVoiceMode(
      typeof profile.ai_voice_mode === 'boolean' ? profile.ai_voice_mode : DEFAULT_AI_VOICE_MODE,
    );
    setAiPersonality(
      isAiPersonality(profile.ai_personality) ? profile.ai_personality : DEFAULT_AI_PERSONALITY,
    );
    setAiInsights(
      typeof profile.ai_insights === 'boolean' ? profile.ai_insights : DEFAULT_AI_INSIGHTS,
    );
    setAiDataScope(
      isAiDataScope(profile.ai_data_scope) ? profile.ai_data_scope : DEFAULT_AI_DATA_SCOPE,
    );
    setAiLanguage(isAiLanguage(profile.ai_language) ? profile.ai_language : DEFAULT_AI_LANGUAGE);
    const modules = normalizeModuleSettings(profile.module_settings);
    setModuleWeights(modules.weights);
    setModuleEnabled(modules.enabled);
    void updateStoredUser(profile);
  }, [profile]);

  const syncUser = async (user: typeof profile) => {
    if (!user) return;
    queryClient.setQueryData(['auth', 'me'], user);
    await updateStoredUser(user);
  };

  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: async (user) => {
      await syncUser(user);
      showToast('success', 'Profile updated');
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Failed to update profile'));
    },
  });

  const { mutate: saveTheme, isPending: isSavingTheme } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: async (user) => {
      await syncUser(user);
      if (isAppTheme(user.theme)) setThemePreference(user.theme);
      showToast('success', 'Theme updated');
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Theme sync failed'));
    },
  });

  const { mutate: saveAiSettings, isPending: isSavingAi } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: async (user) => {
      await syncUser(user);
      setAiVoice(isAiVoice(user.ai_voice) ? user.ai_voice : DEFAULT_AI_VOICE);
      setAiVoiceMode(
        typeof user.ai_voice_mode === 'boolean' ? user.ai_voice_mode : DEFAULT_AI_VOICE_MODE,
      );
      setAiPersonality(
        isAiPersonality(user.ai_personality) ? user.ai_personality : DEFAULT_AI_PERSONALITY,
      );
      setAiInsights(
        typeof user.ai_insights === 'boolean' ? user.ai_insights : DEFAULT_AI_INSIGHTS,
      );
      setAiDataScope(
        isAiDataScope(user.ai_data_scope) ? user.ai_data_scope : DEFAULT_AI_DATA_SCOPE,
      );
      setAiLanguage(isAiLanguage(user.ai_language) ? user.ai_language : DEFAULT_AI_LANGUAGE);
      void queryClient.invalidateQueries({ queryKey: ['daily-quote'] });
      void queryClient.invalidateQueries({ queryKey: ['goals-quote'] });
      void queryClient.invalidateQueries({ queryKey: ['ai-insight'] });
      showToast('success', 'AI settings updated');
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Failed to update AI settings'));
    },
  });

  const { mutate: saveModules, isPending: isSavingModules } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: async (user) => {
      await syncUser(user);
      const modules = normalizeModuleSettings(user.module_settings);
      setModuleWeights(modules.weights);
      setModuleEnabled(modules.enabled);
      showToast('success', 'Module settings updated');
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Failed to update modules'));
    },
  });

  const { mutate: requestDelete, isPending: isRequestingDelete } = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: (data) => {
      showToast('success', data.message || 'Confirmation email sent');
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Failed to start account deletion'));
    },
  });

  const { mutate: requestPasswordReset, isPending: isRequestingPassword } = useMutation({
    mutationFn: requestPasswordResetForCurrentUser,
    onSuccess: (data) => {
      if (typeof data.reset_token === 'string' && data.reset_token.length > 0) {
        showToast('success', data.message || 'Continue to set a new password.');
        router.push(
          `${ROUTES.AUTH.RESET_PASSWORD}?token=${encodeURIComponent(data.reset_token)}` as never,
        );
        return;
      }
      showToast(
        'success',
        data.message ||
          (data.sent
            ? 'We sent a password reset link to your email.'
            : 'A recovery link is still valid. Check your inbox.'),
      );
    },
    onError: (error) => {
      showToast('error', getUserErrorMessage(error, 'Failed to start password reset'));
    },
  });

  const initials = useMemo(() => {
    const first = firstName.trim().charAt(0);
    const last = lastName.trim().charAt(0);
    return `${first}${last}`.toUpperCase() || 'U';
  }, [firstName, lastName]);

  const currencyOptions = useMemo(() => {
    if (CURRENCY_OPTIONS.some((option) => option.value === currency)) {
      return CURRENCY_OPTIONS;
    }
    return [{ value: currency, label: currency }, ...CURRENCY_OPTIONS];
  }, [currency]);

  const timezoneOptions = useMemo(() => {
    if (TIMEZONE_OPTIONS.some((option) => option.value === timezone)) {
      return TIMEZONE_OPTIONS;
    }
    return [{ value: timezone, label: timezone }, ...TIMEZONE_OPTIONS];
  }, [timezone]);

  const languageOptions = useMemo(
    () => AI_LANGUAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );

  const weightsTotal = moduleWeightsTotal(moduleWeights);

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('error', 'First name and last name are required');
      return;
    }
    saveProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      currency,
      timezone,
    });
  };

  const handleThemeChange = (next: AppTheme) => {
    if (next === themePreference || isSavingTheme) return;
    setThemePreference(next);
    saveTheme({ theme: next });
  };

  const handleRevokeSession = async (session: AuthSessionApi) => {
    const isCurrent =
      session.is_current === true || currentAuthSessionId === String(session.id);
    setRevokingSessionId(session.id);
    try {
      await revokeAuthSession(session.id);
      if (isCurrent) {
        showToast('success', 'Signed out this device');
        await logoutSession('manual');
        router.replace(ROUTES.AUTH.LOGIN);
        return;
      }
      showToast('success', 'Session revoked');
      await refetchSessions();
    } catch (error) {
      showToast('error', getUserErrorMessage(error, 'Failed to revoke session'));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAll = async () => {
    setIsSigningOutEverywhere(true);
    try {
      await revokeAllAuthSessions();
      showToast('success', 'Signed out of all devices');
      await logoutSession('manual');
      router.replace(ROUTES.AUTH.LOGIN);
    } catch (error) {
      showToast('error', getUserErrorMessage(error, 'Failed to sign out everywhere'));
      setIsSigningOutEverywhere(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.cyan400} size="large" />
        <Text style={styles.loadingText}>Loading settings…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Settings"
          subtitle="Your ASTRA control center — personalize your Life OS"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <Pressable key={item.id} onPress={() => setTab(item.id)}>
                {active ? (
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActive}
                  >
                    <Ionicons name={item.icon} size={14} color={colors.white} />
                    <Text style={styles.tabActiveLabel}>{item.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tab}>
                    <Ionicons name={item.icon} size={14} color={colors.slate400} />
                    <Text style={styles.tabLabel}>{item.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {isError ? (
          <DashboardCard borderColor="rgba(239, 68, 68, 0.35)">
            <Text style={styles.errorText}>Could not load your profile. Pull to refresh later.</Text>
          </DashboardCard>
        ) : null}

        {tab === 'profile' ? (
          <DashboardCard>
            <Text style={styles.sectionTitle}>Profile & account</Text>
            <Text style={styles.sectionDesc}>Manage personal information saved to your account</Text>

            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.username}>@{username || 'user'}</Text>
                <Text style={styles.hint}>Email cannot be changed here.</Text>
              </View>
            </View>

            <FieldLabel>First name</FieldLabel>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.slate500}
              style={styles.input}
            />

            <FieldLabel>Last name</FieldLabel>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.slate500}
              style={styles.input}
            />

            <FieldLabel>Email</FieldLabel>
            <TextInput
              value={email}
              editable={false}
              style={[styles.input, styles.inputDisabled]}
            />

            <FieldLabel>Timezone</FieldLabel>
            <SelectField value={timezone} options={timezoneOptions} onChange={setTimezone} />

            <FieldLabel>Currency</FieldLabel>
            <SelectField value={currency} options={currencyOptions} onChange={setCurrency} />
            <Text style={styles.hint}>Saved to your account. Amounts update across the app.</Text>

            <View style={styles.saveWrap}>
              <PrimaryButton
                label={isSavingProfile ? 'Saving…' : 'Save profile'}
                loading={isSavingProfile}
                onPress={handleSaveProfile}
              />
            </View>
          </DashboardCard>
        ) : null}

        {tab === 'theme' ? (
          <DashboardCard>
            <Text style={styles.sectionTitle}>Theme preference</Text>
            <Text style={styles.sectionDesc}>Pick a look for ASTRA. Saved to your profile.</Text>
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((option) => {
                const active = themePreference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    disabled={isSavingTheme}
                    onPress={() => handleThemeChange(option.value)}
                    style={[styles.themeCard, active && styles.themeCardActive]}
                  >
                    <LinearGradient
                      colors={option.swatchColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.swatch, { borderColor: option.borderColor }]}
                    />
                    <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>
                      {option.label}
                    </Text>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </DashboardCard>
        ) : null}

        {tab === 'modules' ? (
          <DashboardCard>
            <Text style={styles.sectionTitle}>Modules</Text>
            <Text style={styles.sectionDesc}>
              Weights affect Life Score. Toggles enable or hide modules.
            </Text>
            <View style={styles.weightsHeader}>
              <Text style={styles.fieldLabel}>Module weights</Text>
              <Text style={[styles.weightTotal, weightsTotal !== 100 && styles.weightTotalBad]}>
                Total {weightsTotal}%
              </Text>
            </View>
            {MODULE_WEIGHT_KEYS.map((key) => (
              <View key={key} style={styles.weightRow}>
                <View style={styles.weightMeta}>
                  <Text style={styles.fieldLabel}>{MODULE_WEIGHT_LABELS[key]}</Text>
                  <Text style={styles.hint}>{moduleWeights[key]}%</Text>
                </View>
                <View style={styles.weightButtons}>
                  <Pressable
                    style={styles.stepBtn}
                    disabled={isSavingModules}
                    onPress={() =>
                      setModuleWeights((prev) => ({
                        ...prev,
                        [key]: Math.max(0, prev[key] - 5),
                      }))
                    }
                  >
                    <Text style={styles.stepBtnText}>−</Text>
                  </Pressable>
                  <Pressable
                    style={styles.stepBtn}
                    disabled={isSavingModules}
                    onPress={() =>
                      setModuleWeights((prev) => ({
                        ...prev,
                        [key]: Math.min(50, prev[key] + 5),
                      }))
                    }
                  >
                    <Text style={styles.stepBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <PrimaryButton
              label={isSavingModules ? 'Saving…' : 'Save weights'}
              loading={isSavingModules}
              disabled={weightsTotal !== 100}
              onPress={() =>
                saveModules({
                  module_settings: { weights: moduleWeights, enabled: moduleEnabled },
                })
              }
            />

            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>Enable modules</Text>
            {MODULE_TOGGLE_KEYS.map((key) => (
              <View key={key} style={styles.switchRow}>
                <View style={styles.switchMeta}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: moduleEnabled[key] ? colors.emerald500 : colors.slate600 },
                    ]}
                  />
                  <Text style={styles.switchLabel}>{MODULE_TOGGLE_LABELS[key]}</Text>
                </View>
                <Switch
                  value={moduleEnabled[key]}
                  disabled={isSavingModules}
                  onValueChange={(checked) => {
                    const next = { ...moduleEnabled, [key]: checked };
                    setModuleEnabled(next);
                    saveModules({
                      module_settings: { weights: moduleWeights, enabled: next },
                    });
                  }}
                  trackColor={{ false: colors.slate700, true: colors.cyan600 }}
                  thumbColor={colors.white}
                />
              </View>
            ))}
          </DashboardCard>
        ) : null}

        {tab === 'notifications' ? <AlertsSettingsPanel /> : null}

        {tab === 'ai' ? (
          <DashboardCard>
            <Text style={styles.sectionTitle}>AI & assistant</Text>
            <Text style={styles.sectionDesc}>
              Applied to chat, quotes, insights, and future AI surfaces.
            </Text>

            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                These settings are mandatory for Astra AI features.
              </Text>
            </View>

            <FieldLabel>AI speaker</FieldLabel>
            <SelectField
              value={aiVoice}
              options={AI_VOICE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={(value) => {
                if (!isAiVoice(value) || value === aiVoice || isSavingAi) return;
                setAiVoice(value);
                saveAiSettings({ ai_voice: value });
              }}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchMetaCol}>
                <Text style={styles.switchLabel}>Voice mode</Text>
                <Text style={styles.hint}>Voice input and spoken replies</Text>
              </View>
              <Switch
                value={aiVoiceMode}
                disabled={isSavingAi}
                onValueChange={(checked) => {
                  if (checked === aiVoiceMode || isSavingAi) return;
                  setAiVoiceMode(checked);
                  saveAiSettings({ ai_voice_mode: checked });
                }}
                trackColor={{ false: colors.slate700, true: colors.cyan600 }}
                thumbColor={colors.white}
              />
            </View>

            <FieldLabel>AI personality</FieldLabel>
            <SelectField
              value={aiPersonality}
              options={AI_PERSONALITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={(value) => {
                if (!isAiPersonality(value) || value === aiPersonality || isSavingAi) return;
                setAiPersonality(value);
                saveAiSettings({ ai_personality: value });
              }}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchMetaCol}>
                <Text style={styles.switchLabel}>Smart insights</Text>
                <Text style={styles.hint}>When off, insight panels stay quiet</Text>
              </View>
              <Switch
                value={aiInsights}
                disabled={isSavingAi}
                onValueChange={(checked) => {
                  if (checked === aiInsights || isSavingAi) return;
                  setAiInsights(checked);
                  saveAiSettings({ ai_insights: checked });
                }}
                trackColor={{ false: colors.slate700, true: colors.cyan600 }}
                thumbColor={colors.white}
              />
            </View>

            <FieldLabel>Data analysis scope</FieldLabel>
            <SelectField
              value={aiDataScope}
              options={AI_DATA_SCOPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={(value) => {
                if (!isAiDataScope(value) || value === aiDataScope || isSavingAi) return;
                setAiDataScope(value);
                saveAiSettings({ ai_data_scope: value });
              }}
            />

            <FieldLabel>AI language</FieldLabel>
            <SelectField
              value={aiLanguage}
              options={languageOptions}
              onChange={(value) => {
                if (!isAiLanguage(value) || value === aiLanguage || isSavingAi) return;
                setAiLanguage(value);
                saveAiSettings({ ai_language: value });
              }}
            />
          </DashboardCard>
        ) : null}

        {tab === 'security' ? (
          <View style={styles.securityStack}>
            <DashboardCard borderColor="rgba(239, 68, 68, 0.25)">
              <Text style={styles.sectionTitle}>Password</Text>
              <Text style={styles.sectionDesc}>Start a password reset for your account</Text>
              <PrimaryButton
                label={isRequestingPassword ? 'Starting…' : 'Change password'}
                loading={isRequestingPassword}
                onPress={() => {
                  Alert.alert(
                    'Change your password?',
                    `We'll start a password reset for ${email || 'your account'}.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Continue', onPress: () => requestPasswordReset() },
                    ],
                  );
                }}
              />
            </DashboardCard>

            <DashboardCard borderColor="rgba(239, 68, 68, 0.25)">
              <Text style={styles.sectionTitle}>Active sessions</Text>
              <Text style={styles.sectionDesc}>
                {isSessionsLoading
                  ? 'Loading devices…'
                  : isSessionsError
                    ? 'Could not load devices'
                    : `${sessionCount} active device${sessionCount === 1 ? '' : 's'}`}
              </Text>
              <PrimaryButton
                label="Manage devices"
                icon="phone-portrait-outline"
                onPress={() => {
                  void refetchSessions();
                  setShowSessions(true);
                }}
              />
            </DashboardCard>

            <DashboardCard borderColor="rgba(239, 68, 68, 0.25)">
              <Text style={styles.sectionTitle}>Sign out</Text>
              <Text style={styles.sectionDesc}>End this device session locally</Text>
              <Pressable
                style={styles.dangerOutline}
                onPress={() => {
                  Alert.alert('Log out?', 'You will need to sign in again.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Log out',
                      style: 'destructive',
                      onPress: async () => {
                        await logoutSession('manual');
                        router.replace(ROUTES.AUTH.LOGIN);
                      },
                    },
                  ]);
                }}
              >
                <Ionicons name="log-out-outline" size={16} color={colors.red400} />
                <Text style={styles.dangerOutlineText}>Log out</Text>
              </Pressable>
            </DashboardCard>

            <DashboardCard borderColor="rgba(239, 68, 68, 0.35)">
              <Text style={[styles.sectionTitle, { color: colors.red300 }]}>Delete account</Text>
              <Text style={styles.sectionDesc}>
                Sends a confirmation link to your email. Permanent and irreversible.
              </Text>
              <Pressable
                style={styles.dangerFill}
                disabled={isRequestingDelete}
                onPress={() => {
                  Alert.alert(
                    'Delete your account?',
                    `We'll send a confirmation link to ${email || 'your inbox'}.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Send confirmation',
                        style: 'destructive',
                        onPress: () => requestDelete(),
                      },
                    ],
                  );
                }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.white} />
                <Text style={styles.dangerFillText}>
                  {isRequestingDelete ? 'Sending…' : 'Delete'}
                </Text>
              </Pressable>
            </DashboardCard>
          </View>
        ) : null}
      </ScrollView>

      <FormModal
        visible={showSessions}
        title="Where you're signed in"
        description="Mobile can stay signed in on multiple devices. Signing out everywhere ends every session."
        onClose={() => setShowSessions(false)}
      >
        {isSessionsLoading ? (
          <ActivityIndicator color={colors.cyan400} />
        ) : isSessionsError ? (
          <Text style={styles.hint}>Could not load sessions from the server.</Text>
        ) : remoteSessions.length === 0 ? (
          <Text style={styles.hint}>No active sessions found.</Text>
        ) : (
          remoteSessions.map((session) => {
            const isCurrent =
              session.is_current === true || currentAuthSessionId === String(session.id);
            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionTitle}>
                    {session.device_label || clientTypeLabel(session.client_type)}
                  </Text>
                  <Text style={styles.hint}>
                    {clientTypeLabel(session.client_type)}
                    {session.platform ? ` · ${session.platform}` : ''}
                  </Text>
                  <Text style={styles.hint}>Signed in {formatSessionWhen(session.created_at)}</Text>
                  <Text style={styles.hint}>
                    Last active {formatSessionWhen(session.last_seen_at)}
                  </Text>
                  {isCurrent ? <Text style={styles.currentBadge}>This device</Text> : null}
                </View>
                <Pressable
                  style={isCurrent ? styles.dangerOutline : styles.revokeBtn}
                  disabled={revokingSessionId === session.id || isSigningOutEverywhere}
                  onPress={() => void handleRevokeSession(session)}
                >
                  <Text style={isCurrent ? styles.dangerOutlineText : styles.revokeBtnText}>
                    {revokingSessionId === session.id ? '…' : isCurrent ? 'Sign out' : 'Revoke'}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}

        <Pressable
          style={styles.dangerOutline}
          disabled={isSigningOutEverywhere || remoteSessions.length === 0}
          onPress={() => void handleRevokeAll()}
        >
          <Text style={styles.dangerOutlineText}>
            {isSigningOutEverywhere ? 'Signing out…' : 'Sign out everywhere'}
          </Text>
        </Pressable>
      </FormModal>
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontFamily: fonts.regular, fontSize: 14, color: colors.slate400 },
  tabs: { gap: 8, paddingVertical: 4 },
  tab: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  tabActive: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.slate400 },
  tabActiveLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.white },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    marginBottom: 4,
  },
  sectionDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    marginBottom: 16,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cyan600,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  avatarText: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white },
  avatarMeta: { flex: 1, gap: 2 },
  username: { fontFamily: fonts.medium, fontSize: 15, color: colors.slate200 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.slate500, marginTop: 6 },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.slate400,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  inputDisabled: { opacity: 0.6 },
  saveWrap: { marginTop: 16 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    width: '47%',
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
  },
  themeCardActive: { borderColor: colors.cyan400 },
  swatch: { width: 36, height: 36, borderRadius: 8, borderWidth: 1 },
  themeLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.slate400 },
  themeLabelActive: { color: colors.cyan300 },
  check: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontFamily: fonts.headingBold,
    fontSize: 12,
    color: colors.cyan300,
  },
  weightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightTotal: { fontFamily: fonts.medium, fontSize: 13, color: colors.slate400 },
  weightTotalBad: { color: colors.red400 },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weightMeta: { flex: 1 },
  weightButtons: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  stepBtnText: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.slate200 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(71, 85, 105, 0.45)',
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  switchMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  switchMetaCol: { flex: 1, gap: 2 },
  switchLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate200 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    padding: 12,
    marginBottom: 8,
  },
  bannerText: { fontFamily: fonts.regular, fontSize: 13, color: colors.slate200 },
  securityStack: { gap: 16 },
  dangerOutline: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerOutlineText: { fontFamily: fonts.medium, fontSize: 14, color: colors.red400 },
  dangerFill: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: colors.red600,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerFillText: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
  sessionCard: {
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  sessionMeta: { gap: 2 },
  sessionTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.slate200 },
  currentBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.cyan300,
  },
  revokeBtn: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  revokeBtnText: { fontFamily: fonts.medium, fontSize: 13, color: colors.slate300 },
  errorText: { fontFamily: fonts.regular, fontSize: 14, color: colors.red300 },
});
