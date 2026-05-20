import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';

const requestLocationPermission = async () => {
  try {
    let permission;
    if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    } else if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    }

    if (permission) {
      const status = await request(permission);
      if (status === 'granted') {
      } else {
      }
    }
  } catch (err) {
    console.warn('Error requesting location permission:', err);
  }
};

export default requestLocationPermission;
