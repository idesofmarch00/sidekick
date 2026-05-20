// /dependencies
import {Pressable} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// screens
import {RentScreen, WalletScreen} from '../screens';
import {UserDetails} from '@/modules/user/screens';

// assets
import RentScooterIcon from '../assets/rentScooterIcon.svg';
import RentScooterIconFilled from '../assets/rentScooterIconFilled.svg';
import WalletIcon from '../assets/walletIcon.svg';
import WalletIconFilled from '../assets/walletIconFilled.svg';
import ProfileIcon from '../assets/profileIcon.svg';
import ProfileIconFilled from '../assets/profileIconFilled.svg';
import {ScaledSheet} from 'react-native-size-matters';
import {Platform} from 'react-native';

const ProfileTabBar = ({focused}: {focused: boolean}) => {
  return focused ? <ProfileIconFilled /> : <ProfileIcon />;
};

const WalletTabBar = ({focused}: {focused: boolean}) => {
  return focused ? <WalletIconFilled /> : <WalletIcon />;
};

const RentTabBar = ({focused}: {focused: boolean}) => {
  return focused ? <RentScooterIconFilled /> : <RentScooterIcon />;
};

const styles = ScaledSheet.create({
  tabBar: {
    height: Platform.OS === 'android' ? '65.5@vs' : '71@vs',
    paddingBottom: 0,
    zIndex: 0,
    elevation: 1,
    paddingTop: Platform.OS === 'android' ? '15@ms' : '12@ms',
  },
});

const HomeNavigator = createBottomTabNavigator({
  initialRouteName: 'rent',
  screenOptions: {
    headerShown: false,
    tabBarStyle: styles.tabBar,
  },
  screens: {
    wallet: {
      screen: WalletScreen,
      options: {
        tabBarIcon: ({focused}) => <WalletTabBar focused={focused} />,
        tabBarLabel: 'Wallet',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
    rent: {
      screen: RentScreen,
      options: {
        tabBarIcon: ({focused}) => <RentTabBar focused={focused} />,
        tabBarLabel: 'Rent',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
    profile: {
      screen: UserDetails,
      options: {
        tabBarIcon: ({focused}) => <ProfileTabBar focused={focused} />,
        tabBarLabel: 'Profile',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
  },
});

export default HomeNavigator;
