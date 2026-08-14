import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '@/constants/theme';

export function AstraLogo() {
  const pulse = useRef(new Animated.Value(1)).current;
  const corePulse = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const reverseSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const coreLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(corePulse, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(corePulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const reverseLoop = Animated.loop(
      Animated.timing(reverseSpin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulseLoop.start();
    coreLoop.start();
    spinLoop.start();
    reverseLoop.start();

    return () => {
      pulseLoop.stop();
      coreLoop.stop();
      spinLoop.stop();
      reverseLoop.stop();
    };
  }, [corePulse, pulse, reverseSpin, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const reverseRotate = reverseSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Animated.View style={[styles.outerRing, { opacity: pulse }]}>
          <LinearGradient
            colors={[colors.cyan400, colors.blue500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.core}
          >
            <Animated.View style={[styles.dot, { opacity: corePulse }]} />
          </LinearGradient>
        </Animated.View>
        <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]} />
        <Animated.View style={[styles.innerOrbit, { transform: [{ rotate: reverseRotate }] }]} />
      </View>
      <View>
        <Text style={styles.title}>ASTRA</Text>
        <Text style={styles.subtitle}>NEURAL OS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 40,
    height: 40,
  },
  outerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cyan400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  orbit: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  innerOrbit: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: 2.4,
    color: colors.cyan300,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: -4,
    fontFamily: fonts.regular,
    fontSize: 12,
    letterSpacing: 2.4,
    color: colors.cyan300,
  },
});
