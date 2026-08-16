import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts } from '@/constants/theme';
import { DashboardCard } from '@/features/dashboard/DashboardCard';
import { PrimaryButton } from '@/features/wealth/PrimaryButton';

type QuickNoteCaptureProps = {
  onSave: (content: string) => Promise<void>;
  loading?: boolean;
};

export function QuickNoteCapture({ onSave, loading }: QuickNoteCaptureProps) {
  const [content, setContent] = useState('');

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    await onSave(trimmed);
    setContent('');
  };

  return (
    <DashboardCard borderColor="rgba(6, 182, 212, 0.25)">
      <View style={styles.header}>
        <Ionicons name="flash" size={18} color="#facc15" />
        <Text style={styles.title}>Quick Capture</Text>
      </View>
      <TextInput
        placeholder="Jot something down..."
        placeholderTextColor={colors.slate500}
        style={styles.input}
        multiline
        value={content}
        onChangeText={setContent}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>First line becomes the title</Text>
        <PrimaryButton
          label="Save Quick Note"
          icon="flash-outline"
          loading={loading}
          disabled={!content.trim()}
          onPress={() => {
            void handleSave();
          }}
        />
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.cyan300,
  },
  input: {
    minHeight: 100,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 12,
    gap: 10,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.slate500,
  },
});
