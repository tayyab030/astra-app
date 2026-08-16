import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

export type AuthSelectOption = {
  value: string;
  label: string;
};

type AuthSelectProps = {
  value: string;
  placeholder?: string;
  options: AuthSelectOption[];
  onChange: (value: string) => void;
  searchable?: boolean;
  focused?: boolean;
  onFocusChange?: (focused: boolean) => void;
};

export function AuthSelect({
  value,
  placeholder = 'Select...',
  options,
  onChange,
  searchable = false,
  focused,
  onFocusChange,
}: AuthSelectProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((c) => ({
    trigger: {
      height: 40,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      backgroundColor: 'rgba(51, 65, 85, 0.5)',
      paddingHorizontal: 12,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      gap: 8,
    },
    triggerFocused: {
      borderColor: c.cyan400,
    },
    triggerText: {
      flex: 1,
      fontFamily: fonts.regular,
      fontSize: 14,
      color: c.white,
    },
    placeholder: {
      color: c.slate400,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(2, 6, 23, 0.65)',
      justifyContent: 'center' as const,
      padding: 24,
    },
    sheet: {
      maxHeight: 420,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      backgroundColor: c.slate800,
      overflow: 'hidden' as const,
    },
    search: {
      height: 40,
      margin: 12,
      marginBottom: 0,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(6, 182, 212, 0.3)',
      backgroundColor: 'rgba(51, 65, 85, 0.5)',
      color: c.white,
      fontFamily: fonts.regular,
      fontSize: 14,
      paddingHorizontal: 12,
    },
    list: {
      maxHeight: 360,
    },
    option: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    optionActive: {
      backgroundColor: 'rgba(6, 182, 212, 0.15)',
    },
    optionText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: c.slate200,
    },
    optionTextActive: {
      color: c.cyan300,
    },
    empty: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: c.slate400,
      textAlign: 'center' as const,
      padding: 24,
    },
  }));

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const needle = query.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  const close = () => {
    setOpen(false);
    setQuery('');
    onFocusChange?.(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          setOpen(true);
          onFocusChange?.(true);
        }}
        style={[styles.trigger, focused && styles.triggerFocused]}
      >
        <Text
          style={[styles.triggerText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={focused ? colors.cyan400 : colors.slate400}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {searchable ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor={colors.slate400}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={colors.cyan400}
                style={styles.search}
              />
            ) : null}
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    close();
                  }}
                  style={[
                    styles.option,
                    option.value === value && styles.optionActive,
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
              {filtered.length === 0 ? (
                <Text style={styles.empty}>No matches</Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
