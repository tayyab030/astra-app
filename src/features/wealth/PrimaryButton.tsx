import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fonts, type } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function PrimaryButton({ label, onPress, disabled, loading, icon }: PrimaryButtonProps) {
  const { tokens } = useAppTheme();
  const styles = useThemedStyles((_c, t) => ({
    button: {
      minHeight: 44,
      borderRadius: 8,
      paddingHorizontal: 16,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
      borderWidth: 1,
      borderColor: t.border,
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: type.body,
      color: t.primaryForeground,
    },
    disabled: {
      opacity: 0.5,
    },
  }));

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={disabled && styles.disabled}>
      <LinearGradient
        colors={tokens.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={tokens.primaryForeground} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={16} color={tokens.primaryForeground} /> : null}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}
