import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { useCurrency } from '@/hooks/useCurrency';
import { sendTestNotification } from '@/lib/notifications';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';
import { DashboardCard } from './DashboardCard';

export function DashboardScreen() {
  const { formatCurrency } = useCurrency();
  const [testingNotification, setTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotification(true);
    try {
      await sendTestNotification();
    } finally {
      setTestingNotification(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingRow}>
        <View style={styles.greeting}>
          <Text style={styles.title}>Good morning, Tayyab 🚀</Text>
          <Text style={styles.quote}>
            "Success is the sum of small efforts repeated day in and day out."
          </Text>
        </View>
        <LinearGradient
          colors={[colors.cyan500, colors.blue600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <Ionicons name="star" size={16} color={colors.white} />
          <Text style={styles.badgeText}>Life Score: 85</Text>
        </LinearGradient>
      </View>

      <DashboardCard borderColor="rgba(6, 182, 212, 0.3)" style={styles.notifyCard}>
        <Text style={styles.cardTitle}>Push notifications</Text>
        <Text style={styles.cardDescription}>
          Temporary test — tap to schedule a local notification in about 1 second.
        </Text>
        <PrimaryButton
          label="Test notification"
          icon="notifications-outline"
          loading={testingNotification}
          onPress={() => {
            void handleTestNotification();
          }}
        />
      </DashboardCard>

      <View style={styles.stats}>
        <DashboardCard
          borderColor="rgba(6, 182, 212, 0.3)"
          shadowColor={colors.cyan500}
        >
          <Text style={[styles.statLabel, { color: colors.cyan300 }]}>
            Tasks Due Today
          </Text>
          <Text style={[styles.statValue, { color: colors.cyan200 }]}>5</Text>
          <Text style={styles.statHint}>2 completed</Text>
        </DashboardCard>

        <DashboardCard
          borderColor="rgba(59, 130, 246, 0.3)"
          shadowColor={colors.blue500}
        >
          <Text style={[styles.statLabel, { color: colors.blue300 }]}>
            Daily Spending
          </Text>
          <Text style={[styles.statValue, { color: colors.blue200 }]}>
            {formatCurrency(47)}
          </Text>
          <Text style={styles.statHint}>Budget: {formatCurrency(80)}</Text>
        </DashboardCard>

        <DashboardCard
          borderColor="rgba(34, 211, 238, 0.3)"
          shadowColor={colors.cyan400}
        >
          <Text style={[styles.statLabel, { color: colors.cyan300 }]}>
            Health Progress
          </Text>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Water</Text>
            <Text style={styles.healthLabel}>6/8 glasses</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </DashboardCard>

        <DashboardCard
          borderColor="rgba(96, 165, 250, 0.3)"
          shadowColor={colors.blue400}
        >
          <Text style={[styles.statLabel, { color: colors.blue300 }]}>
            Focus Time
          </Text>
          <Text style={[styles.statValue, { color: colors.blue200 }]}>3.2h</Text>
          <Text style={styles.statHint}>4 Pomodoros</Text>
        </DashboardCard>
      </View>

      <View style={styles.charts}>
        <DashboardCard>
          <Text style={styles.cardTitle}>Weekly Expenses</Text>
          <Text style={styles.cardDescription}>
            Your spending vs income this week
          </Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.slate400} />
            <Text style={styles.chartLabel}>Chart visualization</Text>
          </View>
        </DashboardCard>

        <DashboardCard>
          <Text style={styles.cardTitle}>Habit Streaks</Text>
          <Text style={styles.cardDescription}>Your consistency over time</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="trending-up-outline" size={48} color={colors.slate400} />
            <Text style={styles.chartLabel}>Streak visualization</Text>
          </View>
        </DashboardCard>
      </View>

      <DashboardCard
        borderColor="rgba(6, 182, 212, 0.3)"
        style={styles.block}
      >
        <View style={styles.insightsHeader}>
          <Ionicons name="flash" size={20} color={colors.cyan400} />
          <Text style={styles.cardTitle}>Smart Insights</Text>
        </View>
        <View style={styles.insights}>
          <LinearGradient
            colors={['rgba(22, 78, 99, 0.3)', 'rgba(30, 58, 138, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.insight, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}
          >
            <Text style={styles.insightText}>
              🎉 You spent 20% less this week than last week!
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(30, 58, 138, 0.3)', 'rgba(22, 78, 99, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.insight, { borderColor: 'rgba(59, 130, 246, 0.3)' }]}
          >
            <Text style={styles.insightText}>
              🔥 You've kept a 10-day streak on workouts—keep going!
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.3)', 'rgba(51, 65, 85, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.insight, { borderColor: 'rgba(100, 116, 139, 0.3)' }]}
          >
            <Text style={styles.insightText}>
              ⚠️ 3 tasks are overdue. Suggest rescheduling?
            </Text>
          </LinearGradient>
        </View>
      </DashboardCard>

      <DashboardCard>
        <Text style={[styles.cardTitle, styles.actionsTitle]}>Quick Actions</Text>
        <View style={styles.actions}>
          <QuickAction
            icon="add"
            label="Add Task"
            borderColor="rgba(6, 182, 212, 0.3)"
            color={colors.cyan300}
          />
          <QuickAction
            icon="cash-outline"
            label="Log Expense"
            borderColor="rgba(59, 130, 246, 0.3)"
            color={colors.blue300}
          />
          <QuickAction
            icon="heart-outline"
            label="Log Habit"
            borderColor="rgba(34, 211, 238, 0.3)"
            color={colors.cyan300}
          />
          <QuickAction
            icon="document-text-outline"
            label="Quick Note"
            borderColor="rgba(96, 165, 250, 0.3)"
            color={colors.blue300}
          />
        </View>
      </DashboardCard>
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  borderColor,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  borderColor: string;
  color: string;
}) {
  return (
    <Pressable style={[styles.action, { borderColor }]}>
      <LinearGradient
        colors={['rgba(30, 41, 59, 0.5)', 'rgba(51, 65, 85, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 24,
    paddingBottom: 40,
    gap: 24,
  },
  greetingRow: {
    gap: 16,
  },
  greeting: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 30,
    color: colors.cyan300,
    lineHeight: 36,
  },
  quote: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate300,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: colors.cyan500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.white,
  },
  stats: {
    gap: 16,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
  },
  statHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate700,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.cyan500,
    borderRadius: 4,
  },
  charts: {
    gap: 24,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.cyan300,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    marginTop: 4,
  },
  chartPlaceholder: {
    height: 192,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chartLabel: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate400,
  },
  block: {
    gap: 12,
  },
  notifyCard: {
    gap: 12,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insights: {
    gap: 12,
  },
  insight: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  insightText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
  },
  actionsTitle: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  action: {
    width: '47%',
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
});
