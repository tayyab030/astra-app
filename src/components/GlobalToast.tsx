import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts } from '@/constants/theme';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';
import {
  getToastSnapshot,
  subscribeToast,
  type AppToast,
} from '@/lib/ui/toastStore';

export function GlobalToast() {
    const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000,
  },
  toast: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  success: {
    backgroundColor: 'rgba(6, 95, 70, 0.96)',
    borderColor: 'rgba(52, 211, 153, 0.45)',
  },
  warning: {
    backgroundColor: 'rgba(120, 53, 15, 0.96)',
    borderColor: 'rgba(251, 191, 36, 0.45)',
  },
  error: {
    backgroundColor: 'rgba(127, 29, 29, 0.96)',
    borderColor: 'rgba(248, 113, 113, 0.45)',
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
    textAlign: 'center',
  },
}));

  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<AppToast | null>(getToastSnapshot);

  useEffect(() => subscribeToast(setToast), []);

  if (!toast) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { top: Math.max(insets.top, 12) + 8 }]}
    >
      <View
        style={[
          styles.toast,
          toast.type === 'success'
            ? styles.success
            : toast.type === 'warning'
              ? styles.warning
              : styles.error,
        ]}
      >
        <Text style={styles.text}>{toast.message}</Text>
      </View>
    </View>
  );
}
