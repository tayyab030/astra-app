import { Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { WealthEmptyState } from '@/features/wealth/WealthEmptyState';

import { MOOD_OPTIONS } from '../constants';
import { useHealthContext } from '../context/HealthProvider';
import type { MoodValue } from '../types/health.types';

const MOOD_ICONS: Record<MoodValue, keyof typeof Ionicons.glyphMap> = {
  great: 'happy-outline',
  good: 'happy-outline',
  okay: 'remove-outline',
  bad: 'sad-outline',
  terrible: 'sad-outline',
};

export function WellnessTab() {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
    marginBottom: 12,
  },
  question: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
    marginBottom: 10,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodBtn: {
    width: '18%',
    minWidth: 58,
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  moodBtnActive: {
    backgroundColor: colors.cyan500,
    borderColor: colors.cyan500,
  },
  moodLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.slate300,
  },
  moodLabelActive: {
    color: colors.white,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
    marginBottom: 6,
  },
  notes: {
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  history: {
    gap: 10,
  },
  historyRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 12,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  historyMood: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate200,
    textTransform: 'capitalize',
  },
  historyDate: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  historyNotes: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
}));

  const {
    moodToday,
    moodNotes,
    setMoodToday,
    setMoodNotes,
    saveMood,
    moodEntries,
    isSaving,
  } = useHealthContext();

  const handleSaveMood = async () => {
    if (!moodToday) return;
    await saveMood(moodToday as MoodValue, moodNotes || undefined);
  };

  return (
    <View style={styles.wrap}>
      <DashboardCard>
        <View style={styles.titleRow}>
          <Ionicons name="happy-outline" size={18} color={colors.blue400} />
          <Text style={styles.title}>Mood & Mental Wellness</Text>
        </View>

        <Text style={styles.question}>How are you feeling today?</Text>
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => {
            const active = moodToday === mood.value;
            return (
              <Pressable
                key={mood.value}
                onPress={() => setMoodToday(mood.value)}
                style={[styles.moodBtn, active && styles.moodBtnActive]}
              >
                <Ionicons
                  name={MOOD_ICONS[mood.value]}
                  size={18}
                  color={active ? colors.white : mood.color}
                />
                <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>
                  {mood.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notes}
          multiline
          value={moodNotes}
          onChangeText={setMoodNotes}
          placeholder="How was your day? Any thoughts or feelings to record..."
          placeholderTextColor={colors.slate500}
        />

        <PrimaryButton
          label="Save Mood Check-in"
          onPress={() => {
            void handleSaveMood();
          }}
          loading={isSaving}
          disabled={!moodToday}
        />
      </DashboardCard>

      <DashboardCard>
        <Text style={styles.title}>Mood History</Text>
        {moodEntries.length === 0 ? (
          <WealthEmptyState
            icon="happy-outline"
            title="No mood history yet"
            description="Your mood check-ins will appear here once you start logging how you feel each day."
          />
        ) : (
          <View style={styles.history}>
            {moodEntries.map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyMood}>{entry.mood}</Text>
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                {entry.notes ? <Text style={styles.historyNotes}>{entry.notes}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </DashboardCard>
    </View>
  );
}

