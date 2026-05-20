// dependencies
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Platform} from 'react-native';

// navigators
import HomeNavigator from '@/modules/home/navigation/home.navigator';
import UserNavigator from '@/modules/user/navigation/user.navigator';
import WalletNavigator from '@/modules/wallet/navigation/wallet.navigator';
import RideNavigator from '@/modules/ride/navigation/ride.navigator';

const ProtectedNavigator = createNativeStackNavigator({
  initialRouteName: 'home',
  screenOptions: {
    headerShown: false,
    presentation: Platform.OS === 'android' ? 'transparentModal' : 'card',
  },
  screens: {
    home: {
      screen: HomeNavigator,
    },
    user: {
      screen: UserNavigator,
    },
    walletNavigator: {
      screen: WalletNavigator,
    },
    rideNavigator: {
      screen: RideNavigator,
    },
  },
});

export default ProtectedNavigator;
