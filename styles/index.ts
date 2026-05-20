// dependencies
import {TextStyle, ViewStyle} from 'react-native';
import {StackNavigationOptions} from '@react-navigation/stack';

// types
// import {SKBackground, SKBorders, SKColors} from '../theme/Theme.type';

export const commonInputStyles: ViewStyle & TextStyle = {
  borderWidth: 1,
  fontSize: 16,
  fontWeight: '500',
  paddingLeft: 10,
  borderRadius: 8,
  // borderColor: SKBorders.input,
  // backgroundColor: SKBackground.input,
  // color: SKColors.neutral,
};

/**
 * This style is to be used to style the top level container in screens having transparent header
 * This helps us keep a uniform look and feel across the app
 * @current Navigators that will this style: Settings, Address, Order
 */
export const headerTransparentContainer: any = {
  marginTop: '40@ms',
};

/**
 * This style is to be used to make screen header transparent
 * * targeted style - no shadows, no borders, only text and back button with a transparent background
 * This helps us keep a uniform look and feel across the app
 * @current Navigators that will this style: All navigators
 */
export const commonHeaderStyles: StackNavigationOptions = {
  headerTitleAlign: 'center',
  headerShown: true,
  headerTransparent: true,
  headerStyle: {
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  headerBackTitleVisible: false,
  // headerTintColor: SKColors.neutral,
};

/**
 * styles to be used in <BottomSheetView> component
 * adds uniform padding to the bottom sheet
 */
export const commonBottomSheetView: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: 20,
  flex: 1,
};
