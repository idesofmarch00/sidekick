// dependencies
import {Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// screens
import WalletScreen from '../screens/WalletScreen';
import AddFundsScreen from '../screens/AddFundsScreen';

// components
import {BackArrowButton} from '@/components';

const WalletNavigator = createNativeStackNavigator({
  initialRouteName: 'WalletScreen',
  screenOptions: {
    // this prevent flickering on android
    presentation: Platform.OS === 'android' ? 'transparentModal' : 'card',
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerShadowVisible: false,
  },
  screens: {
    WalletScreen: {
      screen: WalletScreen,
      options: {
        title: '',
        headerLeft: () => <BackArrowButton title="Wallet" />,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    AddFundsScreen: {
      screen: AddFundsScreen,
      options: {
        title: '',
        headerLeft: () => <BackArrowButton title="Add Funds" />,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

export default WalletNavigator;
