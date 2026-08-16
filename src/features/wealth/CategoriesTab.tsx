import { Text, View } from 'react-native';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useCurrency } from '@/hooks/useCurrency';
import type { WealthCategoryTotal } from '@/lib/api/wealth';

import { WealthEmptyState } from './WealthEmptyState';

type CategoriesTabProps = {
  categoryTotals: WealthCategoryTotal[];
  isLoading?: boolean;
};

export function CategoriesTab({ categoryTotals, isLoading }: CategoriesTabProps) {
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 16,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.slate200,
  },
  cardTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.slate200,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    marginTop: 4,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  skeleton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
    flex: 1,
    paddingRight: 12,
  },
  amount: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  waste: {
    color: '#fb923c',
  },
  expense: {
    color: colors.red400,
  },
}));

  const { formatCurrency } = useCurrency();
  const hasCategoryData = categoryTotals.some((category) => category.total !== 0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Categories</Text>
      <DashboardCard>
        <Text style={styles.cardTitle}>Spending by Category</Text>
        <Text style={styles.cardDescription}>Totals calculated from your transactions</Text>
        {isLoading ? (
          <View style={styles.list}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View key={index} style={styles.skeleton} />
            ))}
          </View>
        ) : !hasCategoryData ? (
          <WealthEmptyState
            icon="pricetags-outline"
            title="No category data yet"
            description="Add transactions with categories to see how your spending breaks down for this period."
          />
        ) : (
          <View style={styles.list}>
            {categoryTotals.map((cat) => (
              <View key={cat.value} style={styles.row}>
                <Text style={styles.label}>{cat.label}</Text>
                <Text style={[styles.amount, cat.value === 'waste' ? styles.waste : styles.expense]}>
                  {formatCurrency(cat.total)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </DashboardCard>
    </View>
  );
}

