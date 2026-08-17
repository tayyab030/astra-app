import type { RefObject } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/features/theme/AppThemeProvider';
import type { AssistantMessage } from './useAssistantChat';

type Props = {
  message: AssistantMessage;
};

export function MessageBubble({ message }: Props) {
  const { colors, tokens } = useAppTheme();
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
}));

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <LinearGradient
          colors={tokens.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.userText}>{message.content}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={styles.assistantLabel}>Astra</Text>
        <Text style={styles.assistantText}>{message.content}</Text>
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
}));

  return (
    <ScrollView
      ref={listRef}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => listRef?.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </ScrollView>
  );
}

