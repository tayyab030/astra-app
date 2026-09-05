import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PageHeader } from '@/components/PageHeader';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { AnalysisPanel } from './components/AnalysisPanel';
import { TimesPanel } from './components/TimesPanel';
import { TrackPanel } from './components/TrackPanel';
import { PRAYER_TABS, type PrayerTabId } from './constants';
import { usePrayer } from './hooks/usePrayer';

function isPrayerTab(value: string | undefined): value is PrayerTabId {
  return PRAYER_TABS.some((tab) => tab.id === value);
}

export function PrayerScreen() {
  const { colors, tokens } = useAppTheme();
  const prayer = usePrayer();
  const params = useLocalSearchParams<{ tab?: string }>();
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const [currentView, setCurrentView] = useState<PrayerTabId>(() =>
    isPrayerTab(tabParam) ? tabParam : 'times',
  );

  useEffect(() => {
    if (isPrayerTab(tabParam)) setCurrentView(tabParam);
  }, [tabParam]);

  const styles = useThemedStyles((c, t) => ({
    root: { flex: 1 },
    scroll: {
      padding: 24,
      paddingBottom: 40,
      gap: 20,
    },
    centered: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: 24,
      gap: 12,
    },
    loadingText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: t.mutedForeground,
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
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    tabActive: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: c.white,
    },
    tabInactive: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.slate400,
    },
  }));

  if (prayer.isBootstrapping) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={tokens.primary} />
        <Text style={styles.loadingText}>Loading prayer settings…</Text>
      </View>
    );
  }

  const subtitle =
    currentView === 'times'
      ? prayer.timings?.date.readable
        ? `${prayer.timings.date.readable}${
            prayer.timings.date.hijri
              ? ` · ${prayer.timings.date.hijri} AH`
              : ''
          }`
        : "Today's salah schedule"
      : currentView === 'track'
        ? 'Mark salah completed by day'
        : 'Completion trends';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Prayer" subtitle={subtitle} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {PRAYER_TABS.map((tab) => {
            const active = currentView === tab.id;
            if (active) {
              return (
                <Pressable key={tab.id} onPress={() => setCurrentView(tab.id)}>
                  <LinearGradient
                    colors={tokens.accentGradient}
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

        {currentView === 'times' ? <TimesPanel prayer={prayer} /> : null}
        {currentView === 'track' ? <TrackPanel prayer={prayer} /> : null}
        {currentView === 'analysis' ? <AnalysisPanel /> : null}
      </ScrollView>
    </View>
  );
}
