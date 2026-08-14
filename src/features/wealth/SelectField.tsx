import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

type SelectFieldProps = {
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: boolean;
  minWidth?: number;
};

export function SelectField({
  value,
  placeholder = 'Select',
  options,
  onChange,
  error,
  minWidth,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const groups = useMemo(() => {
    const grouped = new Map<string, SelectOption[]>();
    options.forEach((option) => {
      const key = option.group ?? '';
      const list = grouped.get(key) ?? [];
      list.push(option);
      grouped.set(key, list);
    });
    return Array.from(grouped.entries());
  }, [options]);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          minWidth ? { minWidth } : null,
          error ? styles.triggerError : null,
        ]}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.slate400} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <ScrollView style={styles.list} nestedScrollEnabled>
              {groups.map(([group, items]) => (
                <View key={group || 'default'}>
                  {group ? <Text style={styles.group}>{group}</Text> : null}
                  {items.map((option) => (
                    <Pressable
                      key={option.value}
                      disabled={option.disabled}
                      onPress={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      style={[
                        styles.option,
                        option.value === value && styles.optionActive,
                        option.disabled && styles.optionDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          option.value === value && styles.optionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerError: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
  triggerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  placeholder: {
    color: colors.slate500,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    maxHeight: 360,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: colors.slate800,
    overflow: 'hidden',
  },
  list: {
    maxHeight: 360,
  },
  group: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate400,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.slate200,
  },
  optionTextActive: {
    color: colors.cyan300,
  },
});
