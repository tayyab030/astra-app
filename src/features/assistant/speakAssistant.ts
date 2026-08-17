import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

import { fetchAssistantSpeechWav } from '@/lib/api/assistant';
import { chunkForSpeech } from './chunkSpeech';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  if (typeof btoa === 'function') return btoa(binary);

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : Number.NaN;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : Number.NaN;
    const bitmap = (a << 16) | ((Number.isNaN(b) ? 0 : b) << 8) | (Number.isNaN(c) ? 0 : c);
    output +=
      chars.charAt((bitmap >> 18) & 63) +
      chars.charAt((bitmap >> 12) & 63) +
      (Number.isNaN(b) ? '=' : chars.charAt((bitmap >> 6) & 63)) +
      (Number.isNaN(c) ? '=' : chars.charAt(bitmap & 63));
  }
  return output;
}

let audioReady = false;
let stopRequested = false;
let activePlayer: ReturnType<typeof createAudioPlayer> | null = null;

async function ensureAudioMode() {
  if (audioReady) return;
  await setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: false,
  });
  audioReady = true;
}

function playFile(uri: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      activePlayer?.pause();
      activePlayer?.remove();
    } catch {
      // ignore
    }

    const player = createAudioPlayer(uri);
    activePlayer = player;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish || stopRequested) {
        subscription.remove();
        try {
          player.remove();
        } catch {
          // ignore
        }
        if (activePlayer === player) activePlayer = null;
        resolve();
      }
    });

    try {
      player.play();
    } catch (error) {
      subscription.remove();
      reject(error);
    }
  });
}

export async function stopAssistantSpeech(): Promise<void> {
  stopRequested = true;
  try {
    activePlayer?.pause();
    activePlayer?.remove();
  } catch {
    // ignore
  }
  activePlayer = null;
}

export async function speakAssistantReply(text: string): Promise<void> {
  stopRequested = false;
  await ensureAudioMode();

  const chunks = chunkForSpeech(text);
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('No cache directory available for audio playback.');
  }

  for (let i = 0; i < chunks.length; i++) {
    if (stopRequested) break;

    const wav = await fetchAssistantSpeechWav(chunks[i]);
    if (stopRequested) break;

    const path = `${cacheDir}astra-tts-${Date.now()}-${i}.wav`;
    await FileSystem.writeAsStringAsync(path, arrayBufferToBase64(wav), {
      encoding: FileSystem.EncodingType.Base64,
    });

    await playFile(path);

    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {
      // ignore
    }
  }
}
