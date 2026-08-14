import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useCurrency } from '@/hooks/useCurrency';
import type { WealthFilter } from '@/lib/api/wealth';

import { BudgetTab } from './BudgetTab';
import { CategoriesTab } from './CategoriesTab';
import { OverviewTab } from './OverviewTab';
import { PrimaryButton } from './PrimaryButton';
import { TransactionsTab } from './TransactionsTab';
import { WEALTH_TABS, type WealthTabValue } from './constants';
import { useWealth } from './useWealth';
import { WealthFilters } from './WealthFilters';

function getInitialFilter(): WealthFilter {
  const now = new Date();
  return {
    mode: 'month',
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function WealthScreen() {
  const { formatCurrency } = useCurrency();
  const [filter, setFilter] = useState<WealthFilter>(getInitialFilter);
  const [tab, setTab] = useState<WealthTabValue>('overview');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    dashboard,
    isLoading,
    isError,
    errorMessage,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    isCreatingTransaction,
    isUpdatingTransaction,
    isDeletingTransaction,
    isCreatingBudget,
    isUpdatingBudget,
    isDeletingBudget,
  } = useWealth(filter, (type, message) => setToast({ type, message }));

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const resolvedFilter =
    dashboard?.filter ??
    (filter.mode === 'month'
      ? { mode: 'month' as const, year: filter.year, month: filter.month }
      : {
          mode: 'year' as const,
          start_year: filter.startYear,
          end_year: filter.endYear,
        });

  const netWorth = dashboard?.net_worth ?? 0;
  const isNegativeNetWorth = netWorth < 0;

  const summaryCards = [
    {
      title: 'Net Worth',
      value: netWorth,
      subtitle: 'Total income minus expenses (all time)',
      icon: 'trending-up-outline' as const,
      titleColor: isNegativeNetWorth ? colors.red300 : '#86efac',
      valueColor: isNegativeNetWorth ? colors.red300 : '#bbf7d0',
      subtitleColor: isNegativeNetWorth ? colors.red400 : '#4ade80',
      borderColor: isNegativeNetWorth ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
      shadowColor: isNegativeNetWorth ? colors.red400 : '#22c55e',
    },
    {
      title: 'Monthly Income',
      value: dashboard?.monthly_income ?? 0,
      subtitle: 'Filtered period income',
      icon: 'cash-outline' as const,
      titleColor: colors.blue300,
      valueColor: colors.blue200,
      subtitleColor: colors.blue400,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      shadowColor: colors.blue500,
    },
    {
      title: 'Monthly Expenses',
      value: dashboard?.monthly_expenses ?? 0,
      subtitle: 'Filtered period expenses',
      icon: 'card-outline' as const,
      titleColor: '#d8b4fe',
      valueColor: '#e9d5ff',
      subtitleColor: colors.purple500,
      borderColor: 'rgba(168, 85, 247, 0.2)',
      shadowColor: colors.purple500,
    },
    {
      title: 'Waste Spending',
      value: dashboard?.waste_spending ?? 0,
      subtitle: 'Non-essential spending',
      icon: 'warning-outline' as const,
      titleColor: '#fdba74',
      valueColor: '#fed7aa',
      subtitleColor: '#fb923c',
      borderColor: 'rgba(249, 115, 22, 0.2)',
      shadowColor: '#f97316',
    },
  ];

  return (
    <View style={styles.root}>
      {toast ? (
        <View
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headingWrap}>
            <Text style={styles.title}>💰 Wealth Dashboard</Text>
            <Text style={styles.subtitle}>Your complete financial command center</Text>
          </View>
          <WealthFilters onChange={setFilter} />
        </View>

        {isError ? (
          <DashboardCard borderColor="rgba(248, 113, 113, 0.35)">
            <Text style={styles.errorTitle}>Couldn’t load wealth data</Text>
            <Text style={styles.errorBody}>
              {errorMessage ?? 'Failed to load wealth data'}
            </Text>
            <PrimaryButton label="Retry" onPress={() => { void refetch(); }} />
          </DashboardCard>
        ) : null}

        <View style={styles.summary}>
          {summaryCards.map((card) => (
            <DashboardCard
              key={card.title}
              borderColor={card.borderColor}
              shadowColor={card.shadowColor}
            >
              <View style={styles.summaryTitleRow}>
                <Ionicons name={card.icon} size={16} color={card.titleColor} />
                <Text style={[styles.summaryTitle, { color: card.titleColor }]}>{card.title}</Text>
              </View>
              {isLoading ? (
                <>
                  <View style={styles.skeletonValue} />
                  <View style={styles.skeletonHint} />
                </>
              ) : (
                <>
                  <Text style={[styles.summaryValue, { color: card.valueColor }]}>
                    {formatCurrency(card.value)}
                  </Text>
                  <Text style={[styles.summaryHint, { color: card.subtitleColor }]}>
                    {card.subtitle}
                  </Text>
                </>
              )}
            </DashboardCard>
          ))}
        </View>

        <View style={styles.tabs}>
          {WEALTH_TABS.map((item) => {
            const active = tab === item.value;
            if (active) {
              return (
                <Pressable key={item.value} onPress={() => setTab(item.value)}>
                  <LinearGradient
                    colors={[colors.cyan500, colors.blue600]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tab}
                  >
                    <Text style={styles.tabActive}>{item.label}</Text>
                  </LinearGradient>
                </Pressable>
              );
            }

            return (
              <Pressable key={item.value} onPress={() => setTab(item.value)} style={styles.tab}>
                <Text style={styles.tabInactive}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'overview' ? (
          <OverviewTab
            monthlyIncome={dashboard?.monthly_income ?? 0}
            monthlyExpenses={dashboard?.monthly_expenses ?? 0}
            periodNet={dashboard?.net_savings ?? 0}
            wasteSpending={dashboard?.waste_spending ?? 0}
            transactions={dashboard?.transactions ?? []}
            categoryTotals={dashboard?.category_totals ?? []}
            filter={resolvedFilter}
            isLoading={isLoading}
          />
        ) : null}

        {tab === 'budget' ? (
          <BudgetTab
            categoryBudgets={dashboard?.category_budgets ?? []}
            filter={resolvedFilter}
            isLoading={isLoading}
            onCreateBudget={createBudget}
            onUpdateBudget={updateBudget}
            onDeleteBudget={deleteBudget}
            isCreatingBudget={isCreatingBudget}
            isUpdatingBudget={isUpdatingBudget}
            isDeletingBudget={isDeletingBudget}
          />
        ) : null}

        {tab === 'categories' ? (
          <CategoriesTab categoryTotals={dashboard?.category_totals ?? []} isLoading={isLoading} />
        ) : null}

        {tab === 'transactions' ? (
          <TransactionsTab
            transactions={dashboard?.transactions ?? []}
            isLoading={isLoading}
            onCreateTransaction={createTransaction}
            onUpdateTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
            isCreatingTransaction={isCreatingTransaction}
            isUpdatingTransaction={isUpdatingTransaction}
            isDeletingTransaction={isDeletingTransaction}
          />
        ) : null}
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
    gap: 24,
  },
  toast: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    zIndex: 20,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toastSuccess: {
    backgroundColor: 'rgba(6, 95, 70, 0.95)',
  },
  toastError: {
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
  },
  toastText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  header: {
    gap: 16,
  },
  headingWrap: {
    gap: 4,
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
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 30,
    color: colors.cyan400,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.slate300,
  },
  summary: {
    gap: 16,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
  },
  summaryHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
  },
  skeletonValue: {
    height: 28,
    width: 112,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    marginBottom: 8,
  },
  skeletonHint: {
    height: 12,
    width: 144,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  tabs: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.white,
  },
  tabInactive: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate300,
  },
});
