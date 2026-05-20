// dependencies
import {Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {StaticParamList} from '@react-navigation/native';

// screens
import RideScreen from '../screens';

export type RideStackNavigatorParams = {
  myride: undefined;
};

const RideStack = createNativeStackNavigator<RideStackNavigatorParams>({
  initialRouteName: 'myride',
  screenOptions: {
    headerShown: false,
    presentation: Platform.OS === 'android' ? 'transparentModal' : 'card',
  },
  screens: {
    myride: RideScreen,
  },
});

type RideStackParamList = StaticParamList<typeof RideStack>;

declare global {
  namespace ReactNavigation {
    interface AuthParamList extends RideStackParamList {}
  }
}

export default RideStack;
