import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { AssistantConversation } from '@/lib/api/assistant';

type Props = {
  visible: boolean;
  onClose: () => void;
  conversations: AssistantConversation[];
  activeId: string | null;
  busy?: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function ConversationDrawer({
  visible,
  onClose,
  conversations,
  activeId,
  busy,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startRename = (item: AssistantConversation) => {
    setEditingId(item.id);
    setDraftTitle(item.title);
  };

  const commitRename = () => {
    if (!editingId) return;
    const title = draftTitle.trim();
    if (title) onRename(editingId, title);
    setEditingId(null);
    setDraftTitle('');
  };

  const confirmDelete = (item: AssistantConversation) => {
    Alert.alert('Delete chat', `Delete “${item.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(item.id),
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Chats</Text>
            <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.slate300} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.newChatBtn, busy && styles.disabled]}
            disabled={busy}
            onPress={() => {
              onNewChat();
              onClose();
            }}
          >
            <Ionicons name="create-outline" size={18} color={colors.cyan300} />
            <Text style={styles.newChatText}>New chat</Text>
          </Pressable>

          {busy ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.cyan400} />
            </View>
          ) : null}

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {conversations.length === 0 ? (
              <Text style={styles.empty}>No chats yet. Start a new one.</Text>
            ) : (
              conversations.map((item) => {
                const active = item.id === activeId;
                const editing = editingId === item.id;
                return (
                  <View
                    key={item.id}
                    style={[styles.row, active && styles.rowActive]}
                  >
                    {editing ? (
                      <TextInput
                        value={draftTitle}
                        onChangeText={setDraftTitle}
                        style={styles.renameInput}
                        autoFocus
                        onSubmitEditing={commitRename}
                        onBlur={commitRename}
                        placeholderTextColor={colors.slate500}
                      />
                    ) : (
                      <Pressable
                        style={styles.rowMain}
                        onPress={() => {
                          onSelect(item.id);
                          onClose();
                        }}
                      >
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={16}
                          color={active ? colors.cyan300 : colors.slate400}
                        />
                        <Text
                          style={[styles.rowTitle, active && styles.rowTitleActive]}
                          numberOfLines={1}
                        >
                          {item.title || 'New chat'}
                        </Text>
                      </Pressable>
                    )}

                    <View style={styles.rowActions}>
                      <Pressable
                        onPress={() => startRename(item)}
                        hitSlop={8}
                        style={styles.rowAction}
                      >
                        <Ionicons name="pencil-outline" size={15} color={colors.slate400} />
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDelete(item)}
                        hitSlop={8}
                        style={styles.rowAction}
                      >
                        <Ionicons name="trash-outline" size={15} color={colors.red400} />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: '82%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: colors.slate900,
    borderRightWidth: 1,
    borderRightColor: 'rgba(71, 85, 105, 0.55)',
    paddingTop: 54,
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  panelTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.cyan300,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  newChatText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.cyan200,
  },
  loading: {
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 6,
    paddingBottom: 24,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.55)',
  },
  rowActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.slate300,
  },
  rowTitleActive: {
    color: colors.cyan200,
  },
  renameInput: {
    flex: 1,
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: colors.slate200,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 2,
  },
  rowAction: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
});
