import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { SelectField } from '@/features/wealth/SelectField';

import { ACTIVITY_BAR_OPTIONS } from '../constants/tabs';
import type { UseTimeTrackReturn } from '../hooks/useTimeTrackPageData';

type SettingsTabProps = {
  timeTrack: UseTimeTrackReturn;
};

export function SettingsTab({ timeTrack }: SettingsTabProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  root: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    marginBottom: 12,
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
    marginBottom: 12,
  },
}));

  const { settings, updateWeeklyTarget, updateActivityBarVisible, updateSettingsMutation } =
    timeTrack;

  const [hoursDraft, setHoursDraft] = useState(String(settings.hoursPerWeek));

  useEffect(() => {
    setHoursDraft(String(settings.hoursPerWeek));
  }, [settings.hoursPerWeek]);

  const saveHours = () => {
    const parsed = Number(hoursDraft);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 168) {
      updateWeeklyTarget(parsed);
    } else {
      setHoursDraft(String(settings.hoursPerWeek));
    }
  };

  return (
    <View style={styles.root}>
      <DashboardCard>
        <Text style={styles.sectionTitle}>Hours per week</Text>
        <Text style={styles.description}>
          Weekly target used for progress on the Weekly tab.
        </Text>
        <TextInput
          keyboardType="number-pad"
          value={hoursDraft}
          onChangeText={setHoursDraft}
          onBlur={saveHours}
          placeholder="40"
          placeholderTextColor={colors.slate500}
          style={styles.input}
        />
        <PrimaryButton
          label="Save hours"
          loading={updateSettingsMutation.isPending}
          onPress={saveHours}
        />
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.sectionTitle}>Activity bar</Text>
        <Text style={styles.description}>
          Prefer showing a compact timer bar when browsing other areas of the app.
        </Text>
        <SelectField
          value={settings.activityBarVisible ? 'visible' : 'hidden'}
          options={ACTIVITY_BAR_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => updateActivityBarVisible(value === 'visible')}
        />
      </DashboardCard>
    </View>
  );
}

