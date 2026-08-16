import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { OverflowMenu } from '@/components/OverflowMenu';
import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useCurrency } from '@/hooks/useCurrency';
import type {
  CreateCategoryBudgetPayload,
  WealthCategoryBudget,
  WealthDashboard,
  WealthExpenseCategoryValue,
} from '@/lib/api/wealth';

import { BUDGET_CATEGORY_STYLES, MONTHS, WEALTH_EXPENSE_CATEGORIES } from './constants';
import { FormFieldError } from './FormFieldError';
import { FormModal } from './FormModal';
import { PrimaryButton } from './PrimaryButton';
import { SelectField } from './SelectField';
import { WealthEmptyState } from './WealthEmptyState';
import { formatBudgetPeriod, getBudgetStatus } from './utils';
import {
  budgetDefaultValues,
  budgetLimitSchema,
  budgetSchema,
  type BudgetFormValues,
  type BudgetLimitFormValues,
} from './wealth.schema';

function getDefaultBudgetValues(filter: WealthDashboard['filter']): BudgetFormValues {
  if (filter.mode === 'month') {
    return {
      ...budgetDefaultValues,
      period_type: 'month',
      year: filter.year,
      month: filter.month,
    };
  }

  return {
    ...budgetDefaultValues,
    period_type: 'year',
    year: filter.start_year,
    month: undefined,
  };
}

type BudgetTabProps = {
  categoryBudgets: WealthCategoryBudget[];
  filter: WealthDashboard['filter'];
  isLoading?: boolean;
  onCreateBudget: (payload: CreateCategoryBudgetPayload) => Promise<unknown>;
  onUpdateBudget: (payload: { id: string; data: { amount: number } }) => Promise<unknown>;
  onDeleteBudget: (id: string) => Promise<unknown>;
  isCreatingBudget?: boolean;
  isUpdatingBudget?: boolean;
  isDeletingBudget?: boolean;
  openSetLimit?: boolean;
  onOpenSetLimitConsumed?: () => void;
};

export function BudgetTab({
  categoryBudgets,
  filter,
  isLoading,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  isCreatingBudget,
  isUpdatingBudget,
  openSetLimit = false,
  onOpenSetLimitConsumed,
}: BudgetTabProps) {
  const { formatCurrency } = useCurrency();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<WealthCategoryBudget | null>(null);

  useEffect(() => {
    if (!openSetLimit) return;
    setShowAddDialog(true);
    onOpenSetLimitConsumed?.();
  }, [openSetLimit]);

  const addForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: getDefaultBudgetValues(filter),
  });

  const editForm = useForm<BudgetLimitFormValues>({
    resolver: zodResolver(budgetLimitSchema),
    defaultValues: { amount: '' as unknown as number },
  });

  const watchedPeriodType = addForm.watch('period_type');
  const watchedAmount = addForm.watch('amount');
  const watchedYear = addForm.watch('year');
  const editAmount = editForm.watch('amount');

  const resetAddForm = () => {
    addForm.reset(getDefaultBudgetValues(filter));
  };

  const openEdit = (budget: WealthCategoryBudget) => {
    setEditingBudget(budget);
    editForm.reset({ amount: budget.limit });
    setShowEditDialog(true);
  };

  const handleAddSubmit = addForm.handleSubmit(async (data) => {
    const payload: CreateCategoryBudgetPayload = {
      category: data.category as WealthExpenseCategoryValue,
      amount: Number(data.amount),
      period_type: data.period_type,
      year: Number(data.year),
      ...(data.period_type === 'month' ? { month: Number(data.month) } : {}),
    };

    try {
      await onCreateBudget(payload);
      setShowAddDialog(false);
      resetAddForm();
    } catch {
      // Errors are surfaced via mutation toasts
    }
  });

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingBudget) return;

    try {
      await onUpdateBudget({ id: editingBudget.id, data: { amount: Number(data.amount) } });
      setShowEditDialog(false);
      setEditingBudget(null);
    } catch {
      // Errors are surfaced via mutation toasts
    }
  });

  const confirmDelete = (budget: WealthCategoryBudget) => {
    Alert.alert(
      'Delete budget limit?',
      `This will remove the ${budget.label} limit of ${formatCurrency(budget.limit)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void onDeleteBudget(budget.id);
          },
        },
      ],
    );
  };

  const filterLabel =
    filter.mode === 'month'
      ? formatBudgetPeriod('month', filter.year, filter.month)
      : filter.start_year === filter.end_year
        ? String(filter.start_year)
        : `${filter.start_year}–${filter.end_year}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Category Budgets</Text>
          <Text style={styles.subheading}>
            Limits for {filterLabel} · spending calculated from transactions
          </Text>
        </View>
        <PrimaryButton
          label="Set Limit"
          icon="add"
          onPress={() => {
            resetAddForm();
            setShowAddDialog(true);
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.skeleton} />
          ))}
        </View>
      ) : categoryBudgets.length === 0 ? (
        <WealthEmptyState
          icon="wallet-outline"
          title="No budget limits set"
          description={`Add monthly or yearly limits for expense categories in ${filterLabel}.`}
        />
      ) : (
        <View style={styles.list}>
          {categoryBudgets.map((budget) => {
            const style = BUDGET_CATEGORY_STYLES[budget.category] ?? BUDGET_CATEGORY_STYLES.other;
            const percentage = budget.percentage;
            const status = getBudgetStatus(budget.spent, budget.limit);
            const periodLabel = formatBudgetPeriod(budget.period_type, budget.year, budget.month);

            return (
              <DashboardCard key={budget.id}>
                <View style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetMeta}>
                      <LinearGradient colors={style.colors} style={styles.icon}>
                        <Ionicons name={style.icon} size={20} color={colors.white} />
                      </LinearGradient>
                      <View style={styles.budgetCopy}>
                        <Text style={styles.budgetTitle} numberOfLines={2}>
                          {budget.label}
                        </Text>
                        <Text style={styles.budgetPeriod} numberOfLines={1}>
                          {budget.period_type === 'month' ? 'Monthly' : 'Yearly'} · {periodLabel}
                        </Text>
                      </View>
                    </View>
                    <OverflowMenu
                      iconSize={18}
                      accessibilityLabel="Budget actions"
                      items={[
                        {
                          key: 'edit',
                          label: 'Edit Limit',
                          icon: 'create-outline',
                          onPress: () => openEdit(budget),
                        },
                        {
                          key: 'delete',
                          label: 'Delete',
                          icon: 'trash-outline',
                          destructive: true,
                          onPress: () => confirmDelete(budget),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.budgetSpend} numberOfLines={1}>
                    {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(percentage, 100)}%` as `${number}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressHint}>{percentage.toFixed(1)}% used</Text>
                  <Text
                    style={[
                      styles.progressHint,
                      budget.remaining < 0 ? { color: colors.red400 } : null,
                    ]}
                  >
                    {budget.remaining < 0
                      ? `${formatCurrency(Math.abs(budget.remaining))} over`
                      : `${formatCurrency(budget.remaining)} remaining`}
                  </Text>
                </View>
              </DashboardCard>
            );
          })}
        </View>
      )}

      <FormModal
        visible={showAddDialog}
        title="Set Category Limit"
        description="Set a monthly or yearly spending limit for an expense category."
        onClose={() => {
          setShowAddDialog(false);
          resetAddForm();
        }}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <SelectField
            value={addForm.watch('category')}
            placeholder="Select category"
            options={WEALTH_EXPENSE_CATEGORIES.map((category) => ({
              value: category.value,
              label: category.label,
            }))}
            onChange={(value) => addForm.setValue('category', value, { shouldValidate: true })}
            error={Boolean(addForm.formState.errors.category)}
          />
          <FormFieldError message={addForm.formState.errors.category?.message} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Limit Amount</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.slate500}
            style={styles.input}
            value={
              watchedAmount === undefined || watchedAmount === ('' as unknown as number)
                ? ''
                : String(watchedAmount)
            }
            onChangeText={(value) =>
              addForm.setValue('amount', value as unknown as number, { shouldValidate: true })
            }
          />
          <FormFieldError message={addForm.formState.errors.amount?.message} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Period Type</Text>
          <SelectField
            value={watchedPeriodType}
            options={[
              { value: 'month', label: 'Monthly' },
              { value: 'year', label: 'Yearly' },
            ]}
            onChange={(value) => {
              addForm.setValue('period_type', value as 'month' | 'year', { shouldValidate: true });
              if (value === 'year') {
                addForm.setValue('month', undefined);
              } else if (!addForm.getValues('month')) {
                addForm.setValue('month', new Date().getMonth() + 1);
              }
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex]}>
            <Text style={styles.fieldLabel}>Year</Text>
            <TextInput
              keyboardType="number-pad"
              placeholderTextColor={colors.slate500}
              style={styles.input}
              value={watchedYear === undefined || watchedYear === null ? '' : String(watchedYear)}
              onChangeText={(value) =>
                addForm.setValue('year', Number(value) as never, { shouldValidate: true })
              }
            />
            <FormFieldError message={addForm.formState.errors.year?.message} />
          </View>
          {watchedPeriodType === 'month' ? (
            <View style={[styles.field, styles.flex]}>
              <Text style={styles.fieldLabel}>Month</Text>
              <SelectField
                value={String(addForm.watch('month') ?? '')}
                placeholder="Month"
                options={MONTHS.map((entry) => ({
                  value: String(entry.value),
                  label: entry.label,
                }))}
                onChange={(value) =>
                  addForm.setValue('month', Number(value), { shouldValidate: true })
                }
                error={Boolean(addForm.formState.errors.month)}
              />
              <FormFieldError message={addForm.formState.errors.month?.message} />
            </View>
          ) : null}
        </View>

        <PrimaryButton
          label="Save Limit"
          loading={isCreatingBudget}
          onPress={() => {
            void handleAddSubmit();
          }}
        />
      </FormModal>

      <FormModal
        visible={showEditDialog}
        title="Edit Limit"
        description={
          editingBudget
            ? `Update the ${editingBudget.label} limit for ${formatBudgetPeriod(
                editingBudget.period_type,
                editingBudget.year,
                editingBudget.month,
              )}.`
            : 'Update this budget limit.'
        }
        onClose={() => {
          setShowEditDialog(false);
          setEditingBudget(null);
        }}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Limit Amount</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.slate500}
            style={styles.input}
            value={
              editAmount === undefined || editAmount === ('' as unknown as number)
                ? ''
                : String(editAmount)
            }
            onChangeText={(value) =>
              editForm.setValue('amount', value as unknown as number, { shouldValidate: true })
            }
          />
          <FormFieldError message={editForm.formState.errors.amount?.message} />
        </View>
        <PrimaryButton
          label="Update Limit"
          loading={isUpdatingBudget}
          onPress={() => {
            void handleEditSubmit();
          }}
        />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  header: {
    gap: 12,
  },
  headerText: {
    gap: 4,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.slate200,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
  },
  list: {
    gap: 16,
  },
  skeleton: {
    height: 112,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  budgetCard: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  budgetMeta: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  budgetTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.slate200,
  },
  budgetSpend: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate400,
    paddingLeft: 48,
  },
  budgetPeriod: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  badgeRow: {
    flexDirection: 'row',
    paddingLeft: 48,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  badgeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.slate700,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.cyan500,
    borderRadius: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.cyan200,
  },
  input: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
});
