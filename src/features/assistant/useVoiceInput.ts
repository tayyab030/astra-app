import { useCallback, useEffect, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import {
  getAssistantErrorMessage,
  transcribeAssistantAudioBase64,
} from '@/lib/api/assistant';

import { stopAssistantSpeech } from './speakAssistant';
import { normalizeMetering } from './VoiceWaveform';

const recordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

type UseVoiceInputOptions = {
  onTranscript: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function useVoiceInput({ onTranscript, onError, disabled }: UseVoiceInputOptions) {
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, 50);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    void (async () => {
      const permission = await requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);
      if (permission.granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || transcribing) return;

    if (!permissionGranted) {
      const permission = await requestRecordingPermissionsAsync();
      setPermissionGranted(permission.granted);
      if (!permission.granted) {
        onError?.('Microphone permission is required for voice input.');
        return;
      }
    }

    try {
      await stopAssistantSpeech();
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await recorder.prepareToRecordAsync(recordingOptions);
      recorder.record();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Could not start recording.');
    }
  }, [disabled, onError, permissionGranted, recorder, transcribing]);

  const stopRecordingAndTranscribe = useCallback(async () => {
    if (!recorderState.isRecording) return;

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        onError?.('No audio was captured. Try again.');
        return;
      }

      setTranscribing(true);
      const mimeType =
        Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const text = await transcribeAssistantAudioBase64({
        audioBase64: base64,
        mimeType,
      });
      await onTranscript(text);
    } catch (error) {
      onError?.(getAssistantErrorMessage(error, 'Voice transcription failed.'));
    } finally {
      setTranscribing(false);
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    }
  }, [onError, onTranscript, recorder, recorderState.isRecording]);

  return {
    isRecording: recorderState.isRecording,
    meteringLevel: normalizeMetering(recorderState.metering),
    transcribing,
    startRecording,
    stopRecordingAndTranscribe,
    permissionGranted,
  };
}
