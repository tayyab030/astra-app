import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { FormModal } from '@/features/wealth/FormModal';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';

import { useHealthContext } from '../context/HealthProvider';
import type { SleepSession } from '../types/health.types';

function formatLocalClock(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatElapsed(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function SleepScheduleCard() {
  const {
    today,
    sleepSessions,
    toggleSleep,
    createSleepSession,
    updateSleepSession,
    deleteSleepSession,
    isSaving,
  } = useHealthContext();

  const [now, setNow] = useState(() => Date.now());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SleepSession | null>(null);
  const [startTime, setStartTime] = useState('23:00');
  const [endTime, setEndTime] = useState('07:00');

  const activeSession = useMemo(
    () => sleepSessions.find((session) => session.isActive) ?? null,
    [sleepSessions],
  );
  const completedSessions = useMemo(
    () => sleepSessions.filter((session) => !session.isActive),
    [sleepSessions],
  );

  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [activeSession]);

  const elapsedLabel = activeSession
    ? formatElapsed(now - new Date(activeSession.startedAt).getTime())
    : null;

  const openCreate = () => {
    setEditingSession(null);
    setStartTime('23:00');
    setEndTime('07:00');
    setDialogOpen(true);
  };

  const openEdit = (session: SleepSession) => {
    setEditingSession(session);
    setStartTime(formatLocalClock(session.startedAt));
    setEndTime(session.endedAt ? formatLocalClock(session.endedAt) : '07:00');
    setDialogOpen(true);
  };

  const handleSaveManual = async () => {
    if (!startTime || !endTime || startTime === endTime) return;
    if (editingSession) {
      await updateSleepSession(editingSession.id, { startTime, endTime });
    } else {
      await createSleepSession(startTime, endTime);
    }
    setDialogOpen(false);
    setEditingSession(null);
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete sleep session?', 'Total sleep hours will recalculate.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteSleepSession(id);
        },
      },
    ]);
  };

  return (
    <>
      <DashboardCard>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="moon-outline" size={16} color={colors.cyan300} />
            <Text style={styles.title}>Sleep</Text>
          </View>
          <Pressable onPress={openCreate} style={styles.addBtn} disabled={isSaving}>
            <Ionicons name="add" size={16} color={colors.slate200} />
            <Text style={styles.addLabel}>Add sleep</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => void toggleSleep()} disabled={isSaving}>
          <LinearGradient
            colors={
              activeSession
                ? ['#f59e0b', '#ea580c']
                : [colors.blue500, colors.blue600]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.toggleBtn}
          >
            <Ionicons
              name={activeSession ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.white}
            />
            <Text style={styles.toggleLabel}>
              {activeSession ? "I'm awake" : 'Goodnight'}
            </Text>
          </LinearGradient>
        </Pressable>

        {activeSession ? (
          <View style={styles.activeWrap}>
            <Text style={styles.activeText}>
              Sleeping since {formatLocalClock(activeSession.startedAt)} · {elapsedLabel} so far
            </Text>
            <Pressable onPress={() => confirmDelete(activeSession.id)} disabled={isSaving}>
              <Text style={styles.cancelText}>Cancel sleep</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.hint}>
            Tap Goodnight when you go to bed, or add a sleep section manually.
          </Text>
        )}

        {completedSessions.map((session) => (
          <View key={session.id} style={styles.sessionRow}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTime}>
                {formatLocalClock(session.startedAt)} →{' '}
                {session.endedAt ? formatLocalClock(session.endedAt) : '—'}
              </Text>
              <Text style={styles.sessionHours}>{session.hours ?? 0}h</Text>
            </View>
            <View style={styles.sessionActions}>
              <Pressable onPress={() => openEdit(session)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={16} color={colors.slate400} />
              </Pressable>
              <Pressable onPress={() => confirmDelete(session.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color={colors.slate400} />
              </Pressable>
            </View>
          </View>
        ))}

        <Text style={styles.total}>
          Total today: {today.sleepHours}h
          {completedSessions.length > 0
            ? ` from ${completedSessions.length} session${completedSessions.length === 1 ? '' : 's'}`
            : ''}
        </Text>
      </DashboardCard>

      <FormModal
        visible={dialogOpen}
        title={editingSession ? 'Edit sleep section' : 'Add sleep section'}
        description="Overnight sleep is fine — end time can be after midnight. Use HH:mm."
        onClose={() => {
          setDialogOpen(false);
          setEditingSession(null);
        }}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Fell asleep</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="23:00"
            placeholderTextColor={colors.slate500}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Woke up</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="07:00"
            placeholderTextColor={colors.slate500}
          />
        </View>
        <PrimaryButton
          label={editingSession ? 'Save changes' : 'Add section'}
          onPress={() => {
            void handleSaveManual();
          }}
          loading={isSaving}
          disabled={!startTime || !endTime || startTime === endTime}
        />
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan300,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate200,
  },
  toggleBtn: {
    minHeight: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.white,
  },
  activeWrap: {
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  activeText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#fcd34d',
    textAlign: 'center',
  },
  cancelText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    textAlign: 'center',
    marginTop: 12,
  },
  sessionRow: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionTime: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
  },
  sessionHours: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  total: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
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
});
