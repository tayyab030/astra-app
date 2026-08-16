import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';

export type OverflowMenuItem = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

type OverflowMenuProps = {
  items: OverflowMenuItem[];
  icon?: 'ellipsis-horizontal' | 'ellipsis-vertical';
  iconSize?: number;
  iconColor?: string;
  disabled?: boolean;
  hitSlop?: number;
  accessibilityLabel?: string;
  /** Controlled open state (e.g. open from long-press on a parent card). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Anchor = { x: number; y: number; width: number; height: number };

const MENU_WIDTH = 220;
const MENU_MAX_HEIGHT = 360;
const EDGE_PAD = 12;

export function OverflowMenu({
  items,
  icon = 'ellipsis-vertical',
  iconSize = 18,
  iconColor = colors.slate400,
  disabled = false,
  hitSlop = 10,
  accessibilityLabel = 'More actions',
  open: controlledOpen,
  onOpenChange,
}: OverflowMenuProps) {
  const triggerRef = useRef<View>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const measureAndOpen = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  }, [open]);

  const close = () => setOpen(false);

  const menuStyle = (() => {
    if (!anchor) return { top: 0, left: 0, opacity: 0 as const };

    const preferredTop = anchor.y + anchor.height + 6;
    const preferredLeft = anchor.x + anchor.width - MENU_WIDTH;

    const left = Math.min(
      Math.max(EDGE_PAD, preferredLeft),
      Math.max(EDGE_PAD, windowWidth - MENU_WIDTH - EDGE_PAD),
    );

    const estimatedHeight = Math.min(MENU_MAX_HEIGHT, 16 + items.length * 48);
    const fitsBelow = preferredTop + estimatedHeight <= windowHeight - EDGE_PAD;
    const top = fitsBelow
      ? preferredTop
      : Math.max(EDGE_PAD, anchor.y - estimatedHeight - 6);

    return { top, left, opacity: 1 as const };
  })();

  return (
    <>
      <View ref={triggerRef} collapsable={false} style={styles.trigger}>
        <Pressable
          onPress={measureAndOpen}
          hitSlop={hitSlop}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={styles.triggerHit}
        >
          <Ionicons name={icon} size={iconSize} color={iconColor} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Dismiss menu" />
          <View style={[styles.menu, menuStyle]} accessibilityRole="menu">
            <ScrollView
              style={styles.list}
              bounces={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {items.map((item, index) => (
                <Pressable
                  key={item.key}
                  disabled={item.disabled}
                  accessibilityRole="menuitem"
                  onPress={() => {
                    close();
                    // Defer so the modal can close before another modal/alert opens.
                    requestAnimationFrame(() => item.onPress());
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    index < items.length - 1 && styles.itemBorder,
                    pressed && styles.itemPressed,
                    item.disabled && styles.itemDisabled,
                  ]}
                >
                  {item.icon ? (
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.destructive ? colors.red400 : colors.slate300}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.itemLabel,
                      item.destructive && styles.itemLabelDestructive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexShrink: 0,
  },
  triggerHit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    maxHeight: MENU_MAX_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.35)',
    backgroundColor: colors.slate800,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: 'hidden',
  },
  list: {
    maxHeight: MENU_MAX_HEIGHT,
  },
  item: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(71, 85, 105, 0.55)',
  },
  itemPressed: {
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
  },
  itemDisabled: {
    opacity: 0.4,
  },
  itemLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.slate200,
  },
  itemLabelDestructive: {
    color: colors.red400,
  },
});
