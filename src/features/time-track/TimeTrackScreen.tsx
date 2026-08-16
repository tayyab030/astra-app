import { useEffect, useMemo, useState } from 'react';
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

import { colors, fonts } from '@/constants/theme';

import { TIME_TRACK_TABS, type TimeTrackTabId } from './constants/tabs';
import { useTimeTrackContext } from './context/TimeTrackProvider';
import { DashboardTab } from './components/DashboardTab';
import { PatternsTab } from './components/PatternsTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { TimerTab } from './components/TimerTab';
import { WeeklyTab } from './components/WeeklyTab';
import {
  useTimeTrackPageData,
  type UseTimeTrackReturn,
} from './hooks/useTimeTrackPageData';

function isTimeTrackTab(value: string | undefined): value is TimeTrackTabId {
  return TIME_TRACK_TABS.some((tab) => tab.id === value);
}

export function TimeTrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; action?: string }>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const actionParam = Array.isArray(params.action) ? params.action[0] : params.action;

  const [currentView, setCurrentView] = useState<TimeTrackTabId>(() =>
    isTimeTrackTab(tabParam) ? tabParam : 'timer',
  );
  const [openAddTask, setOpenAddTask] = useState(false);

  const core = useTimeTrackContext();
  const page = useTimeTrackPageData(core);

  const timeTrack = useMemo<UseTimeTrackReturn>(
    () => ({
      ...core,
      ...page,
      isLoading: core.isLoading || page.isPageLoading,
      isSaving: core.isSaving || page.isSavingPage,
    }),
    [core, page],
  );

  useEffect(() => {
    if (isTimeTrackTab(tabParam)) setCurrentView(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (actionParam === 'add-task') {
      setCurrentView('timer');
      setOpenAddTask(true);
      router.setParams({ action: undefined });
    }
  }, [actionParam, router]);

  if (timeTrack.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.cyan400} size="large" />
        <Text style={styles.loadingText}>Loading time track…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Time Track</Text>
          <Text style={styles.subtitle}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TIME_TRACK_TABS.map((tab) => {
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

        {currentView === 'timer' ? (
          <TimerTab
            timeTrack={timeTrack}
            openAddTask={openAddTask}
            onOpenAddTaskConsumed={() => setOpenAddTask(false)}
          />
        ) : null}
        {currentView === 'dashboard' ? <DashboardTab timeTrack={timeTrack} /> : null}
        {currentView === 'reports' ? <ReportsTab timeTrack={timeTrack} /> : null}
        {currentView === 'patterns' ? <PatternsTab /> : null}
        {currentView === 'weekly' ? <WeeklyTab timeTrack={timeTrack} /> : null}
        {currentView === 'settings' ? <SettingsTab timeTrack={timeTrack} /> : null}
      </ScrollView>
    </View>
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
  header: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
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

