import { useMemo, type ReactNode, type RefObject } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import { formatMessageTime, groupByDay } from './chatDate';
import type { AssistantMessage } from './useAssistantChat';

type Props = {
  message: AssistantMessage;
};

export function MessageBubble({ message }: Props) {
  const { colors, tokens } = useAppTheme();
  const styles = useThemedStyles((colors, tokens) => ({
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubbleWrap: {
    maxWidth: '86%',
    flexShrink: 1,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  assistantLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.cyan400,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  userText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    lineHeight: 22,
    flexShrink: 1,
  },
  assistantText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.slate200,
    lineHeight: 22,
    flexShrink: 1,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.slate400,
    marginTop: 4,
  },
  timeUser: {
    textAlign: 'right',
  },
}));

  const isUser = message.role === 'user';
  const time = formatMessageTime(new Date(message.createdAt));

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View style={styles.bubbleWrap}>
          <LinearGradient
            colors={tokens.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.userBubble]}
          >
            <Text style={styles.userText}>{message.content}</Text>
          </LinearGradient>
          <Text style={[styles.time, styles.timeUser]}>{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={styles.bubbleWrap}>
        <View style={[styles.bubble, styles.assistantBubble]}>
          <Text style={styles.assistantLabel}>Astra</Text>
          <Text style={styles.assistantText}>{message.content}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export function MessageList({
  messages,
  listRef,
}: {
  messages: AssistantMessage[];
  listRef?: RefObject<ScrollView | null>;
}) {
  const styles = useThemedStyles((colors, tokens) => ({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  assistantLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.cyan400,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  userText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    lineHeight: 22,
  },
  assistantText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.slate200,
    lineHeight: 22,
  },
  dayDivider: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.slate400,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
}));

  const days = useMemo(
    () => groupByDay(messages, (message) => new Date(message.createdAt)),
    [messages],
  );

  // Dividers must be direct ScrollView children for stickyHeaderIndices to pin them.
  const { rows, stickyIndices } = useMemo(() => {
    const rows: ReactNode[] = [];
    const stickyIndices: number[] = [];

    for (const day of days) {
      stickyIndices.push(rows.length);
      rows.push(
        <View key={`day-${day.key}`} style={styles.dayDivider}>
          <Text style={styles.dayLabel}>{day.label}</Text>
        </View>,
      );
      for (const message of day.items) {
        rows.push(<MessageBubble key={message.id} message={message} />);
      }
    }

    return { rows, stickyIndices };
  }, [days, styles]);

  return (
    <ScrollView
      ref={listRef}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={stickyIndices}
      onContentSizeChange={() => listRef?.current?.scrollToEnd({ animated: true })}
    >
      {rows}
    </ScrollView>
  );
}

