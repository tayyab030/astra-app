import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useCurrency } from '@/hooks/useCurrency';
import type { WealthCategoryTotal, WealthDashboard, WealthTransaction } from '@/lib/api/wealth';

import { getAiInsights } from './constants';
import { ExpenseCategoriesChart } from './ExpenseCategoriesChart';
import { SpendingTrendChart } from './SpendingTrendChart';

type OverviewTabProps = {
  monthlyIncome: number;
  monthlyExpenses: number;
  periodNet: number;
  wasteSpending: number;
  transactions: WealthTransaction[];
  categoryTotals: WealthCategoryTotal[];
  filter: WealthDashboard['filter'];
  isLoading?: boolean;
};

export function OverviewTab({
  monthlyIncome,
  monthlyExpenses,
  periodNet,
  wasteSpending,
  transactions,
  categoryTotals,
  filter,
  isLoading,
}: OverviewTabProps) {
  const { formatCurrency } = useCurrency();
  const aiInsights = getAiInsights(formatCurrency);

  return (
    <View style={styles.wrap}>
      <DashboardCard>
        <View style={styles.cardTitleRow}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.slate200} />
          <Text style={styles.cardTitle}>Monthly Spending Trends</Text>
        </View>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <SpendingTrendChart transactions={transactions} filter={filter} />
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(59, 130, 246, 0.2)" shadowColor={colors.blue500}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="pie-chart-outline" size={20} color={colors.blue300} />
          <Text style={[styles.cardTitle, { color: colors.blue300 }]}>Expense Categories</Text>
        </View>
        {isLoading ? (
          <View style={styles.skeleton} />
        ) : (
          <ExpenseCategoriesChart categoryTotals={categoryTotals} />
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(34, 197, 94, 0.2)" shadowColor="#22c55e">
        <Text style={[styles.cardTitle, { color: '#86efac', marginBottom: 16 }]}>
          Monthly Financial Summary
        </Text>
        {isLoading ? (
          <View style={styles.summaryGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.skeletonSmall} />
            ))}
          </View>
        ) : (
          <View style={styles.summaryGrid}>
            <SummaryStat value={formatCurrency(monthlyIncome)} label="Total Income" color="#4ade80" />
            <SummaryStat value={formatCurrency(monthlyExpenses)} label="Total Expenses" color={colors.red400} />
            <SummaryStat value={formatCurrency(periodNet)} label="Period Net" color={colors.blue400} />
            <SummaryStat value={formatCurrency(wasteSpending)} label="Waste Spending" color="#fb923c" />
          </View>
        )}
      </DashboardCard>

      <DashboardCard borderColor="rgba(6, 182, 212, 0.2)" shadowColor={colors.cyan500}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="sparkles-outline" size={20} color={colors.cyan400} />
          <Text style={[styles.cardTitle, { color: colors.cyan300 }]}>AI Financial Insights</Text>
        </View>
        <View style={styles.insights}>
          {aiInsights.map((insight) => (
            <LinearGradient
              key={insight.message}
              colors={insightColors[insight.type]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.insight, { borderColor: insightBorders[insight.type] }]}
            >
              <Text style={styles.insightText}>{insight.message}</Text>
            </LinearGradient>
          ))}
        </View>
      </DashboardCard>
    </View>
  );
}

function SummaryStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const insightColors = {
  success: ['rgba(34, 197, 94, 0.1)', 'rgba(16, 185, 129, 0.1)'] as const,
  warning: ['rgba(249, 115, 22, 0.1)', 'rgba(239, 68, 68, 0.1)'] as const,
  tip: ['rgba(59, 130, 246, 0.1)', 'rgba(6, 182, 212, 0.1)'] as const,
  prediction: ['rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.1)'] as const,
};

const insightBorders = {
  success: 'rgba(34, 197, 94, 0.3)',
  warning: 'rgba(249, 115, 22, 0.3)',
  tip: 'rgba(59, 130, 246, 0.3)',
  prediction: 'rgba(168, 85, 247, 0.3)',
};

const styles = StyleSheet.create({
  wrap: {
    gap: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
  },
  skeleton: {
    height: 256,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  skeletonSmall: {
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    flex: 1,
    minWidth: '45%',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    width: '47%',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
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
    color: colors.slate300,
  },
});
