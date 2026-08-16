import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@expo/vector-icons/Ionicons';

import { OverflowMenu } from '@/components/OverflowMenu';
import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { useCurrency } from '@/hooks/useCurrency';
import type {
  CreateTransactionPayload,
  UpdateTransactionPayload,
  WealthCategoryValue,
  WealthTransaction,
} from '@/lib/api/wealth';

import { WEALTH_EXPENSE_CATEGORIES, WEALTH_INCOME_CATEGORIES, getCategoryLabel } from './constants';
import { FormFieldError } from './FormFieldError';
import { FormModal } from './FormModal';
import { PrimaryButton } from './PrimaryButton';
import { SelectField } from './SelectField';
import { WealthEmptyState } from './WealthEmptyState';
import {
  formatTransactionDate,
  getTodayDateValue,
  parseTransactionDateForInput,
} from './utils';
import {
  transactionDefaultValues,
  transactionSchema,
  type TransactionFormValues,
} from './wealth.schema';

type DialogMode = 'add' | 'edit';

type TransactionsTabProps = {
  transactions: WealthTransaction[];
  isLoading?: boolean;
  onCreateTransaction: (payload: CreateTransactionPayload) => Promise<unknown>;
  onUpdateTransaction: (payload: { id: string; data: UpdateTransactionPayload }) => Promise<unknown>;
  onDeleteTransaction: (id: string) => Promise<unknown>;
  isCreatingTransaction?: boolean;
  isUpdatingTransaction?: boolean;
  isDeletingTransaction?: boolean;
  openAdd?: boolean;
  onOpenAddConsumed?: () => void;
};

export function TransactionsTab({
  transactions,
  isLoading,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  isCreatingTransaction,
  isUpdatingTransaction,
  openAdd = false,
  onOpenAddConsumed,
}: TransactionsTabProps) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  row: {
    flexDirection: 'column',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  expenseIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.slate200,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    marginTop: 2,
  },
  amount: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    paddingLeft: 42,
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
  inputError: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
}));

  const { formatCurrency } = useCurrency();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      ...transactionDefaultValues,
      date: getTodayDateValue(),
    },
  });

  const category = watch('category');
  const date = watch('date');
  const description = watch('description');
  const amount = watch('amount');

  const resetForm = () => {
    reset({
      description: '',
      amount: '' as unknown as number,
      category: '',
      date: getTodayDateValue(),
    });
    setEditingId(null);
    setDialogMode('add');
  };

  const openAddDialog = () => {
    resetForm();
    setDialogMode('add');
    setShowDialog(true);
  };

  useEffect(() => {
    if (!openAdd) return;
    openAddDialog();
    onOpenAddConsumed?.();
  }, [openAdd]);

  const openEditDialog = (transaction: WealthTransaction) => {
    setDialogMode('edit');
    setEditingId(transaction.id);
    reset({
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      category: transaction.category as WealthCategoryValue,
      date: parseTransactionDateForInput(transaction.date),
    });
    setShowDialog(true);
  };

  const confirmDelete = (transaction: WealthTransaction) => {
    Alert.alert(
      'Delete transaction?',
      `This will permanently delete "${transaction.description}". This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void onDeleteTransaction(transaction.id);
          },
        },
      ],
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    const payload: CreateTransactionPayload = {
      description: data.description.trim(),
      amount: Number(data.amount),
      category: data.category as WealthCategoryValue,
      date: data.date,
    };

    try {
      if (dialogMode === 'edit' && editingId !== null) {
        await onUpdateTransaction({ id: editingId, data: payload });
      } else {
        await onCreateTransaction(payload);
      }

      resetForm();
      setShowDialog(false);
    } catch {
      // Errors are surfaced via mutation toasts
    }
  });

  const isSaving = isCreatingTransaction || isUpdatingTransaction;
  const categoryOptions = [
    ...WEALTH_EXPENSE_CATEGORIES.map((cat) => ({
      value: cat.value,
      label: cat.label,
      group: 'Expenses',
    })),
    ...WEALTH_INCOME_CATEGORIES.map((cat) => ({
      value: cat.value,
      label: cat.label,
      group: 'Income',
    })),
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.heading}>Transactions</Text>
        <PrimaryButton
          label="Add Transaction"
          icon="add"
          onPress={openAddDialog}
          disabled={isCreatingTransaction}
        />
      </View>

      <DashboardCard>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        <Text style={styles.cardDescription}>Your latest financial activity</Text>
        {isLoading ? (
          <View style={styles.list}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.skeleton} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <WealthEmptyState
            icon="receipt-outline"
            title="No transactions yet"
            description="Add your first income or expense to start tracking your financial activity for this period."
          />
        ) : (
          <View style={styles.list}>
            {transactions.map((transaction) => (
              <View key={transaction.id} style={styles.row}>
                <View style={styles.rowTop}>
                  <View style={styles.rowBody}>
                    <View
                      style={[
                        styles.icon,
                        transaction.amount > 0 ? styles.incomeIcon : styles.expenseIcon,
                      ]}
                    >
                      <Ionicons
                        name={
                          transaction.amount > 0
                            ? 'trending-up-outline'
                            : 'trending-down-outline'
                        }
                        size={16}
                        color={transaction.amount > 0 ? '#4ade80' : colors.red400}
                      />
                    </View>
                    <View style={styles.copy}>
                      <Text style={styles.description} numberOfLines={2}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        {getCategoryLabel(transaction.category)} ·{' '}
                        {formatTransactionDate(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <OverflowMenu
                    iconSize={18}
                    accessibilityLabel="Transaction actions"
                    items={[
                      {
                        key: 'edit',
                        label: 'Edit',
                        icon: 'create-outline',
                        onPress: () => openEditDialog(transaction),
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        icon: 'trash-outline',
                        destructive: true,
                        onPress: () => confirmDelete(transaction),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: transaction.amount > 0 ? '#4ade80' : colors.red400 },
                  ]}
                  numberOfLines={1}
                >
                  {formatCurrency(transaction.amount, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    showSign: transaction.amount > 0,
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </DashboardCard>

      <FormModal
        visible={showDialog}
        title={dialogMode === 'edit' ? 'Edit Transaction' : 'Add New Transaction'}
        description={
          dialogMode === 'edit' ? 'Update this transaction' : 'Record your income or expense'
        }
        onClose={() => {
          setShowDialog(false);
          resetForm();
        }}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Amount</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.slate500}
            style={[styles.input, errors.amount && styles.inputError]}
            value={amount === undefined || amount === ('' as unknown as number) ? '' : String(amount)}
            onChangeText={(value) =>
              setValue('amount', value as unknown as number, { shouldValidate: true })
            }
          />
          <FormFieldError message={errors.amount?.message} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            placeholder="Transaction description"
            placeholderTextColor={colors.slate500}
            style={[styles.input, errors.description && styles.inputError]}
            value={description}
            onChangeText={(value) => setValue('description', value, { shouldValidate: true })}
          />
          <FormFieldError message={errors.description?.message} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <SelectField
            value={category}
            placeholder="Select category"
            options={categoryOptions}
            onChange={(value) =>
              setValue('category', value as WealthCategoryValue, { shouldValidate: true })
            }
            error={Boolean(errors.category)}
          />
          <FormFieldError message={errors.category?.message} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Date</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.slate500}
            style={[styles.input, errors.date && styles.inputError]}
            value={date}
            onChangeText={(value) => setValue('date', value, { shouldValidate: true })}
          />
          <FormFieldError message={errors.date?.message} />
        </View>

        <PrimaryButton
          label={dialogMode === 'edit' ? 'Save Changes' : 'Add Transaction'}
          loading={isSaving}
          onPress={() => {
            void onSubmit();
          }}
        />
      </FormModal>
    </View>
  );
}

