import { useCallback, useEffect, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Platform } from 'react-native';

import { stopGroqSpeech, transcribeAudioFile } from '@/lib/groq';

function guessMimeType(uri: string | null): string {
  if (!uri) return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
  if (uri.endsWith('.webm')) return 'audio/webm';
  if (uri.endsWith('.wav')) return 'audio/wav';
  if (uri.endsWith('.mp3')) return 'audio/mpeg';
  if (uri.endsWith('.m4a')) return 'audio/m4a';
  return Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4';
}

type UseVoiceInputOptions = {
  onTranscript: (text: string) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function useVoiceInput({ onTranscript, onError, disabled }: UseVoiceInputOptions) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
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
      await stopGroqSpeech();
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
      await recorder.prepareToRecordAsync();
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
      const text = await transcribeAudioFile({
        uri,
        mimeType: guessMimeType(uri),
      });
      await onTranscript(text);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Voice transcription failed.');
    } finally {
      setTranscribing(false);
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    }
  }, [onError, onTranscript, recorder, recorderState.isRecording]);

  const toggleRecording = useCallback(async () => {
    if (recorderState.isRecording) {
      await stopRecordingAndTranscribe();
      return;
    }
    await startRecording();
  }, [recorderState.isRecording, startRecording, stopRecordingAndTranscribe]);

  return {
    isRecording: recorderState.isRecording,
    transcribing,
    toggleRecording,
    permissionGranted,
  };
}
