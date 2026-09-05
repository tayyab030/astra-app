import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format, isValid, parse } from 'date-fns';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type DateFieldProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: boolean;
  /** When true, empty is allowed and a clear control is shown. */
  clearable?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
};

function parseDateValue(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const parsed = parse(value.trim(), 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
}

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatDisplay(value: string): string {
  const parsed = parseDateValue(value);
  return parsed ? format(parsed, 'MMM d, yyyy') : value;
}

export function DateField({
  value,
  onChange,
  placeholder = 'Select date',
  error,
  clearable = false,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles((colors) => ({
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
    triggerMain: {
      flex: 1,
      minHeight: 40,
      justifyContent: 'center',
    },
    triggerError: {
      borderColor: 'rgba(248, 113, 113, 0.7)',
    },
    triggerText: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.white,
    },
    placeholder: {
      color: colors.slate500,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    clearHit: {
      padding: 4,
    },
    webInput: {
      minHeight: 40,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(71, 85, 105, 0.5)',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      paddingHorizontal: 12,
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.white,
    },
    webInputError: {
      borderColor: 'rgba(248, 113, 113, 0.7)',
    },
    iosBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(2, 6, 23, 0.65)',
      justifyContent: 'flex-end',
    },
    iosSheet: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(71, 85, 105, 0.5)',
      backgroundColor: colors.slate800,
      paddingBottom: 24,
      overflow: 'hidden',
    },
    iosToolbar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(71, 85, 105, 0.4)',
    },
    iosDone: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: colors.cyan300,
    },
  }));

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseDateValue(value) ?? new Date());

  const selected = useMemo(() => parseDateValue(value), [value]);
  const pickerValue = selected ?? draft;

  const openPicker = () => {
    setDraft(selected ?? new Date());
    setOpen(true);
  };

  const commit = (next: Date) => {
    onChange(toDateString(next));
    setOpen(false);
  };

  const onNativeChange = (event: DateTimePickerEvent, next?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type !== 'set' || !next) return;
      commit(next);
      return;
    }
    if (next) setDraft(next);
  };

  if (Platform.OS === 'web') {
    return (
      <TextInput
        // @ts-expect-error RN Web supports native date input via type
        type="date"
        value={value ?? ''}
        onChangeText={(text) => onChange(text.trim() ? text : clearable ? null : text)}
        placeholder={placeholder}
        placeholderTextColor={colors.slate500}
        style={[styles.webInput, error ? styles.webInputError : null]}
      />
    );
  }

  return (
    <>
      <View style={[styles.trigger, error ? styles.triggerError : null]}>
        <Pressable onPress={openPicker} style={styles.triggerMain}>
          <Text
            style={[styles.triggerText, !selected && styles.placeholder]}
            numberOfLines={1}
          >
            {selected ? formatDisplay(toDateString(selected)) : placeholder}
          </Text>
        </Pressable>
        <View style={styles.actions}>
          {clearable && selected ? (
            <Pressable hitSlop={8} style={styles.clearHit} onPress={() => onChange(null)}>
              <Ionicons name="close-circle" size={18} color={colors.slate400} />
            </Pressable>
          ) : null}
          <Pressable onPress={openPicker} hitSlop={8}>
            <Ionicons name="calendar-outline" size={16} color={colors.slate400} />
          </Pressable>
        </View>
      </View>

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="default"
          onChange={onNativeChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.iosBackdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.iosSheet} onPress={() => {}}>
              <View style={styles.iosToolbar}>
                <Pressable onPress={() => commit(draft)}>
                  <Text style={styles.iosDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                onChange={onNativeChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="dark"
                style={{ alignSelf: 'center' }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}
