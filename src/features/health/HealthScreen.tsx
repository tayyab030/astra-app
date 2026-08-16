import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PageHeader } from '@/components/PageHeader';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';

import { ExerciseTab } from './components/ExerciseTab';
import { OverviewTab } from './components/OverviewTab';
import { TodaySummaryRow } from './components/TodaySummaryRow';
import { TrackingTab } from './components/TrackingTab';
import { WeightTab } from './components/WeightTab';
import { WellnessTab } from './components/WellnessTab';
import { HEALTH_TABS } from './constants';
import { HealthProvider, useHealthContext } from './context/HealthProvider';
import type { HealthTabId } from './types/health.types';

function isHealthTab(value: string | undefined): value is HealthTabId {
  return HEALTH_TABS.some((tab) => tab.id === value);
}

function HealthScreenInner() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; action?: string }>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const actionParam = Array.isArray(params.action) ? params.action[0] : params.action;

  const { healthScore, isLoading, isError, refetch } = useHealthContext();
  const [currentView, setCurrentView] = useState<HealthTabId>(() =>
    isHealthTab(tabParam) ? tabParam : 'overview',
  );
  const [openLogWorkout, setOpenLogWorkout] = useState(false);

  useEffect(() => {
    if (isHealthTab(tabParam)) setCurrentView(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (actionParam === 'log-workout') {
      setCurrentView('exercise');
      setOpenLogWorkout(true);
      router.setParams({ action: undefined });
    }
  }, [actionParam, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.cyan400} size="large" />
        <Text style={styles.loadingText}>Loading health…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Health"
          subtitle={format(new Date(), 'EEEE, MMMM d, yyyy')}
          right={
            <View style={styles.scoreBadge}>
              <Ionicons name="heart" size={16} color={colors.cyan300} />
              <Text style={styles.scoreText}>Health Score: {healthScore}</Text>
            </View>
          }
        />

        {isError ? (
          <DashboardCard borderColor="rgba(248, 113, 113, 0.35)">
            <Text style={styles.errorTitle}>Couldn’t load health data</Text>
            <Text style={styles.errorBody}>Check your connection and try again.</Text>
            <PrimaryButton
              label="Retry"
              onPress={() => {
                void refetch();
              }}
            />
          </DashboardCard>
        ) : null}

        <TodaySummaryRow />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {HEALTH_TABS.map((tab) => {
            const active = currentView === tab.id;
            if (active) {
              return (
                <Pressable key={tab.id} onPress={() => setCurrentView(tab.id)}>
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tab}
                  >
                    <Ionicons name={tab.icon} size={14} color={colors.white} />
                    <Text style={styles.tabActive}>{tab.label}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={tab.id}
                onPress={() => setCurrentView(tab.id)}
                style={styles.tab}
              >
                <Ionicons name={tab.icon} size={14} color={colors.slate400} />
                <Text style={styles.tabInactive}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {currentView === 'overview' ? <OverviewTab /> : null}
        {currentView === 'weight' ? <WeightTab /> : null}
        {currentView === 'tracking' ? <TrackingTab /> : null}
        {currentView === 'exercise' ? (
          <ExerciseTab
            openLogWorkout={openLogWorkout}
            onOpenLogWorkoutConsumed={() => setOpenLogWorkout(false)}
          />
        ) : null}
        {currentView === 'wellness' ? <WellnessTab /> : null}
      </ScrollView>
    </View>
  );
}

export function HealthScreen() {
  return (
    <HealthProvider>
      <HealthScreenInner />
    </HealthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  scoreText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.cyan300,
  },
  errorTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.red300,
    marginBottom: 8,
  },
  errorBody: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate300,
    marginBottom: 16,
  },
  tabs: {
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabActive: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.white,
  },
  tabInactive: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
});
