import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '@/constants/theme';
import type { WealthFilter, WealthFilterMode } from '@/lib/api/wealth';

import { MONTHS } from './constants';
import { SelectField } from './SelectField';
import { getYearOptions } from './utils';

type WealthFiltersProps = {
  onChange?: (filter: WealthFilter) => void;
};

export function WealthFilters({ onChange }: WealthFiltersProps) {
  const yearOptions = useMemo(getYearOptions, []);
  const currentYear = yearOptions[0];
  const currentMonth = new Date().getMonth() + 1;

  const [mode, setMode] = useState<WealthFilterMode>('month');
  const [monthYear, setMonthYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [startYear, setStartYear] = useState(String(currentYear));
  const [endYear, setEndYear] = useState(String(currentYear));

  const startYearNumber = Number(startYear);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (mode === 'month') {
      onChangeRef.current?.({
        mode: 'month',
        year: Number(monthYear),
        month: Number(month),
      });
      return;
    }

    onChangeRef.current?.({
      mode: 'year',
      startYear: startYearNumber,
      endYear: Number(endYear),
    });
  }, [mode, monthYear, month, startYear, endYear, startYearNumber]);

  const handleStartYearChange = (value: string) => {
    setStartYear(value);
    if (Number(value) > Number(endYear)) {
      setEndYear(value);
    }
  };

  const yearSelectOptions = yearOptions.map((year) => ({
    value: String(year),
    label: String(year),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.toggle}>
        <ModeButton label="Month" active={mode === 'month'} onPress={() => setMode('month')} />
        <ModeButton label="Year" active={mode === 'year'} onPress={() => setMode('year')} />
      </View>

      {mode === 'month' ? (
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Year</Text>
            <SelectField value={monthYear} options={yearSelectOptions} onChange={setMonthYear} minWidth={110} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Month</Text>
            <SelectField
              value={month}
              options={MONTHS.map((entry) => ({ value: String(entry.value), label: entry.label }))}
              onChange={setMonth}
              minWidth={130}
            />
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Start Year</Text>
            <SelectField
              value={startYear}
              options={yearSelectOptions}
              onChange={handleStartYearChange}
              minWidth={110}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>End Year</Text>
            <SelectField
              value={endYear}
              options={yearSelectOptions.map((option) => ({
                ...option,
                disabled: Number(option.value) < startYearNumber,
              }))}
              onChange={setEndYear}
              minWidth={110}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={[colors.cyan500, colors.blue600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.modeButton}
        >
          <Text style={styles.modeActive}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.modeButton}>
      <Text style={styles.modeInactive}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  toggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 6,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  modeActive: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.white,
  },
  modeInactive: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate300,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    gap: 4,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
  },
});
