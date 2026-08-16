import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

type AstraLogoProps = {
  style?: StyleProp<ImageStyle>;
  /** Slightly smaller for tight headers. */
  compact?: boolean;
};

export function AstraLogo({ style, compact = false }: AstraLogoProps) {
  return (
    <Image
      source={require('@/assets/images/navbar-logo.png')}
      accessibilityLabel="ASTRA"
      resizeMode="contain"
      style={[compact ? styles.compact : styles.logo, style]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 132,
    height: 38,
  },
  compact: {
    width: 112,
    height: 32,
  },
});
