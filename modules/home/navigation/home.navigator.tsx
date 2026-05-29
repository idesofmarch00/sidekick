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

// theme store
import {useThemeStore} from '@/globalStore';

const ProfileTabBar = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? <ProfileIconFilled stroke={color} /> : <ProfileIcon stroke={color} />;
};

const WalletTabBar = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? <WalletIconFilled stroke={color} /> : <WalletIcon stroke={color} />;
};

const RentTabBar = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? <RentScooterIconFilled stroke={color} /> : <RentScooterIcon stroke={color} />;
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
  screenOptions: () => {
    const {colors} = useThemeStore(state => state.theme);
    return {
      headerShown: false,
      tabBarStyle: [
        styles.tabBar,
        {
          backgroundColor: colors.white,
          borderTopColor: colors.lightGray,
          borderTopWidth: 1,
        },
      ],
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    };
  },
  screens: {
    wallet: {
      screen: WalletScreen,
      options: {
        tabBarIcon: ({focused, color}) => <WalletTabBar focused={focused} color={color} />,
        tabBarLabel: 'Wallet',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
    rent: {
      screen: RentScreen,
      options: {
        tabBarIcon: ({focused, color}) => <RentTabBar focused={focused} color={color} />,
        tabBarLabel: 'Rent',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
    profile: {
      screen: UserDetails,
      options: {
        tabBarIcon: ({focused, color}) => <ProfileTabBar focused={focused} color={color} />,
        tabBarLabel: 'Profile',
        tabBarButton: props => (
          <Pressable {...props} android_ripple={{color: 'transparent'}} />
        ),
      },
    },
  },
});

export default HomeNavigator;
