import { Platform } from 'react-native';
import Constants from 'expo-constants';

const LOCAL_API_PORT = 3001;
const LOCAL_API_PATH = '/api';
const LIVE_API_BASE_URL = 'https://astra-backend-48lg.onrender.com/api';

function isLocalMode() {
  const mode = process.env.EXPO_PUBLIC_MODE?.toLowerCase();
  return mode === 'local' || mode === 'localhost' || mode === 'development';
}

function getDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.linkingUri ??
    '';
  const match = String(hostUri).match(/(\d{1,3}(?:\.\d{1,3}){3})/);
  return match?.[1] ?? null;
}

function getLocalApiBaseUrl() {
  if (Platform.OS === 'web') {
    return `http://localhost:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
  }

  const lanHost = getDevHost();
  if (lanHost && lanHost !== '127.0.0.1') {
    return `http://${lanHost}:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
  }

  return `http://localhost:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  return isLocalMode() ? getLocalApiBaseUrl() : LIVE_API_BASE_URL;
}
