import {MMKV} from 'react-native-mmkv';

// Initialize MMKV
const onboardingStorage = new MMKV({
  id: 'onboarding-storage',
  encryptionKey: 'your-secure-key',
});

export default onboardingStorage;
