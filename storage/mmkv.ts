// src/storage/mmkv.ts
import {MMKV} from 'react-native-mmkv';
import {StateStorage} from 'zustand/middleware';
import {createJSONStorage} from 'zustand/middleware';

export const storage = new MMKV({
  id: 'theme-storage',
  encryptionKey: 'sidekick-theme-key',
});

// Create proper Zustand-compatible storage
export const mmkvStorage: StateStorage = {
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: name => {
    storage.delete(name);
  },
};

// Wrap with Zustand's JSON serializer
export const zustandMmkvStorage = createJSONStorage(() => mmkvStorage);
