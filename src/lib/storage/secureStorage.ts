import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

async function canUseSecureStore() {
  if (Platform.OS === 'web') {
    return false;
  }
  return SecureStore.isAvailableAsync();
}

export async function setSecureItem(key: string, value: string) {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export async function getSecureItem(key: string) {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }

  return null;
}

export async function deleteSecureItem(key: string) {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}
