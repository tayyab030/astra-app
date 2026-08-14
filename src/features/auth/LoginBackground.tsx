import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';

function GridOverlay() {
  const { width, height } = useWindowDimensions();
  const pulse = useRef(new Animated.Value(0.2)).current;
  const cols = Math.ceil(width / 50) + 1;
  const rows = Math.ceil(height / 50) + 1;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.2,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: pulse }]}>
      {Array.from({ length: cols }, (_, i) => (
        <View key={`v-${i}`} style={[styles.gridV, { left: i * 50 }]} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View key={`h-${i}`} style={[styles.gridH, { top: i * 50 }]} />
      ))}
    </Animated.View>
  );
}

function Orb({
  size,
  delay = 0,
  style,
  glow,
}: {
  size: number;
  delay?: number;
  style: ViewStyle;
  glow: string;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          opacity,
          experimental_backgroundImage: glow,
        } as ViewStyle,
        style,
      ]}
    />
  );
}

function Ring({
  size,
  color,
  duration,
  reverse = false,
  style,
}: {
  size: number;
  color: string;
  duration: number;
  reverse?: boolean;
  style: ViewStyle;
}) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [duration, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    />
  );
}

function Particle({
  left,
  top,
  delay,
  duration,
}: {
  left: number;
  top: number;
  delay: number;
  duration: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 10,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, duration, opacity, translateX, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: `${left}%`,
          top: `${top}%`,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

export function LoginBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: (i * 37 + 11) % 100,
        top: (i * 53 + 7) % 100,
        delay: (i * 250) % 5000,
        duration: 3000 + (i % 5) * 800,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <GridOverlay />

      <Orb
        size={176}
        style={{ top: 56, left: 56 }}
        glow="radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 45%, transparent 70%)"
      />
      <Orb
        size={208}
        delay={1000}
        style={{ bottom: 48, right: 48 }}
        glow="radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 45%, transparent 70%)"
      />
      <Orb
        size={144}
        delay={2000}
        style={{ top: '42%', left: 16 }}
        glow="radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.2) 45%, transparent 70%)"
      />

      <Ring
        size={256}
        color="rgba(6, 182, 212, 0.3)"
        duration={20000}
        style={styles.ringTopRight}
      />
      <Ring
        size={192}
        color="rgba(59, 130, 246, 0.3)"
        duration={25000}
        reverse
        style={styles.ringBottomLeft}
      />

      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  ringTopRight: {
    top: '18%',
    right: '12%',
  },
  ringBottomLeft: {
    bottom: '18%',
    left: '12%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(34, 211, 238, 0.6)',
  },
});
