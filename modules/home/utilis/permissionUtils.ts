import {Platform, Alert, Linking} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {request, PERMISSIONS} from 'react-native-permissions';

export const requestPermissions = async () => {
  let locationGranted = false;
  let cameraGranted = false;

  try {
    locationGranted = await requestLocationPermission();
  } catch (err) {
    console.error('Location permission error:', err);
  }

  try {
    cameraGranted = await requestCameraPermission();
  } catch (err) {
    console.error('Camera permission error:', err);
  }

  return {locationGranted, cameraGranted};
};

const requestLocationPermission = async () => {
  const permission = Platform.OS === 'android'
    ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    : await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

  const granted = Platform.OS === 'android' 
    ? permission === PermissionsAndroid.RESULTS.GRANTED
    : permission === 'granted';

  if (!granted) {
    Alert.alert(
      'Location Required',
      'Please enable location services to use this app',
      [
        {text: 'Cancel'},
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  return granted;
};

const requestCameraPermission = async () => {
  const permission = Platform.OS === 'android'
    ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
    : await request(PERMISSIONS.IOS.CAMERA);

  const granted = Platform.OS === 'android'
    ? permission === PermissionsAndroid.RESULTS.GRANTED
    : permission === 'granted';

  if (!granted) {
    Alert.alert(
      'Camera Required',
      'Please enable camera access to scan QR codes',
      [
        {text: 'Cancel'},
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  return granted;
};