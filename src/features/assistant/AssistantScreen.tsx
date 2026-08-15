import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

import { colors, fonts } from "@/constants/theme";
import { ConversationDrawer } from "./ConversationDrawer";
import { MessageList } from "./MessageBubble";
import { useAssistantChat } from "./useAssistantChat";
import { useVoiceInput } from "./useVoiceInput";
import { VoiceWaveform } from "./VoiceWaveform";

export function AssistantScreen() {
  const listRef = useRef<ScrollView>(null);
  const textMode = useRef(new Animated.Value(1)).current;
  const voiceMode = useRef(new Animated.Value(0)).current;
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    messages,
    conversations,
    activeConversationId,
    activeTitle,
    input,
    setInput,
    busy,
    speaking,
    historyBusy,
    error,
    setError,
    speakReplies,
    setSpeakReplies,
    sendMessage,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    stopSpeech,
    configured,
  } = useAssistantChat();

  const {
    isRecording,
    meteringLevel,
    transcribing,
    startRecording,
    stopRecordingAndTranscribe,
  } = useVoiceInput({
    disabled: busy || speaking || !configured,
    onTranscript: (text) => sendMessage(text),
    onError: setError,
  });

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.parallel([
      Animated.timing(textMode, {
        toValue: isRecording ? 0 : 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(voiceMode, {
        toValue: isRecording ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isRecording, textMode, voiceMode]);

  const statusLabel = isRecording
    ? "Listening… tap send to finish"
    : transcribing
      ? "Transcribing with Whisper…"
      : busy
        ? "Astra is thinking…"
        : speaking
          ? "Astra is speaking…"
          : null;

  const sendDisabled = transcribing || busy || (!isRecording && !input.trim());

  const onSendPress = () => {
    if (isRecording) {
      void stopRecordingAndTranscribe();
      return;
    }
    void sendMessage();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => setHistoryOpen(true)}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Ionicons name="menu-outline" size={18} color={colors.slate300} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTitle || "Assistant"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              void createNewChat();
            }}
            style={styles.iconBtn}
            disabled={busy || historyBusy}
          >
            <Ionicons name="create-outline" size={16} color={colors.slate300} />
          </Pressable>
          <Pressable
            onPress={() => setSpeakReplies((value) => !value)}
            style={[styles.iconBtn, speakReplies && styles.iconBtnActive]}
          >
            <Ionicons
              name={speakReplies ? "volume-high" : "volume-mute"}
              size={18}
              color={speakReplies ? colors.white : colors.slate300}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              void stopSpeech();
            }}
            style={styles.iconBtn}
            disabled={!speaking}
          >
            <Ionicons name="stop" size={16} color={colors.slate300} />
          </Pressable>
        </View>
      </View>

      <ConversationDrawer
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        busy={historyBusy || busy}
        onNewChat={() => {
          void createNewChat();
        }}
        onSelect={(id) => {
          void selectConversation(id);
        }}
        onRename={(id, title) => {
          void renameConversation(id, title);
        }}
        onDelete={(id) => {
          void deleteConversation(id);
        }}
      />

      {!configured ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Loading assistant…</Text>
        </View>
      ) : null}

      <MessageList messages={messages} listRef={listRef} />

      {statusLabel ? (
        <View style={styles.thinking}>
          <ActivityIndicator
            color={isRecording ? colors.cyan400 : colors.cyan400}
            size="small"
          />
          <Text style={styles.thinkingText}>{statusLabel}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.composer}>
        {!isRecording ? (
          <Animated.View
            style={[
              styles.micSlot,
              {
                opacity: textMode,
              },
            ]}
          >
            <Pressable
              disabled={busy || speaking || !configured || transcribing}
              onPress={() => {
                void startRecording();
              }}
              style={[
                styles.micBtn,
                (busy || speaking || !configured || transcribing) &&
                  styles.micDisabled,
              ]}
            >
              {transcribing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Ionicons name="mic" size={18} color={colors.white} />
              )}
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={styles.middle}>
          {isRecording ? (
            <Animated.View style={[styles.voiceSlot, { opacity: voiceMode }]}>
              <VoiceWaveform active={isRecording} level={meteringLevel} />
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: textMode }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Astra anything…"
                placeholderTextColor={colors.slate500}
                style={styles.input}
                multiline
                editable={!busy && !transcribing}
                onSubmitEditing={() => {
                  void sendMessage();
                }}
              />
            </Animated.View>
          )}
        </View>

        <Pressable disabled={sendDisabled} onPress={onSendPress}>
          <LinearGradient
            colors={
              sendDisabled
                ? [colors.slate700, colors.slate600]
                : [colors.cyan500, colors.blue600]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.sendBtn, isRecording && styles.sendBtnListening]}
          >
            {busy || transcribing ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={16} color={colors.white} />
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.cyan300,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.6)",
  },
  iconBtnActive: {
    backgroundColor: "rgba(6, 182, 212, 0.35)",
    borderColor: "rgba(34, 211, 238, 0.45)",
  },
  banner: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: "rgba(185, 28, 28, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.35)",
  },
  bannerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.red300,
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thinkingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.slate400,
  },
  error: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.red400,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  micSlot: {
    height: 44,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.blue600,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.35)",
  },
  micDisabled: {
    opacity: 0.5,
  },
  middle: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  voiceSlot: {
    flex: 1,
    minHeight: 44,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.7)",
    color: colors.slate200,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnListening: {
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.55)",
  },
});
