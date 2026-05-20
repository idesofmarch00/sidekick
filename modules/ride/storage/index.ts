// dependencies
import {MMKV} from 'react-native-mmkv';

// Initialize MMKV
const rideStorage = new MMKV({
  id: 'ride-storage',
  encryptionKey: 'your-secure-key',
});

export default rideStorage;
