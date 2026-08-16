import { useEffect, useMemo, useRef, useState } from 'react';
import { useThemedStyles } from '@/features/theme/AppThemeProvider';
import { View } from 'react-native';

const BAR_COUNT = 36;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 28;

/** Map recorder metering (dBFS, typically ~-160..0) to 0..1. */
export function normalizeMetering(db: number | undefined | null): number {
  if (db == null || Number.isNaN(db)) return 0.06;
  return Math.min(1, Math.max(0, (db + 55) / 55));
}

type VoiceWaveformProps = {
  active: boolean;
  /** Current mic level 0..1 (from expo-audio metering). */
  level: number;
};

/**
 * ChatGPT-style live voice bars driven by mic metering.
 */
export function VoiceWaveform({ active, level }: VoiceWaveformProps) {
  const styles = useThemedStyles((colors, tokens) => ({
  wrap: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: MAX_HEIGHT + 4,
    width: '100%',
  },
  bar: {
    flex: 1,
    maxWidth: 4,
    borderRadius: 999,
    backgroundColor: colors.cyan400,
  },
}));

  const [bars, setBars] = useState<number[]>(() => Array.from({ length: BAR_COUNT }, () => 0.08));
  const historyRef = useRef<number[]>(Array.from({ length: BAR_COUNT }, () => 0.08));
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!active) {
      historyRef.current = Array.from({ length: BAR_COUNT }, () => 0.08);
      setBars(historyRef.current);
      return;
    }

    const id = setInterval(() => {
      phaseRef.current += 0.35;
      const phase = phaseRef.current;
      const next = historyRef.current.map((_, index) => {
        const center = (BAR_COUNT - 1) / 2;
        const distance = Math.abs(index - center) / center;
        const wave = 0.55 + 0.45 * Math.sin(phase + index * 0.45);
        const envelope = 1 - distance * 0.45;
        const value = Math.min(1, Math.max(0.05, level * wave * envelope + 0.04));
        const prev = historyRef.current[index] ?? 0.08;
        return prev * 0.45 + value * 0.55;
      });
      historyRef.current = next;
      setBars(next);
    }, 40);

    return () => clearInterval(id);
  }, [active, level]);

  const barViews = useMemo(
    () =>
      bars.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: MIN_HEIGHT + value * (MAX_HEIGHT - MIN_HEIGHT),
              opacity: 0.45 + value * 0.55,
            },
          ]}
        />
      )),
    [bars]
  );

  return (
    <View style={styles.wrap} accessibilityLabel="Voice level">
      <View style={styles.row}>{barViews}</View>
    </View>
  );
}

