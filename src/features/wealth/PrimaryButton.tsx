import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function PrimaryButton({ label, onPress, disabled, loading, icon }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={disabled && styles.disabled}>
      <LinearGradient
        colors={[colors.cyan500, colors.blue600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={16} color={colors.white} /> : null}
            <Text style={styles.label}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40,
    borderRadius: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
