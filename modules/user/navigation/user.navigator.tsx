// dependencies
import {Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// screens
import {
  EditProfile,
  TNC as TNCScreen,
  UserDetails,
  PrivacyPolicy,
} from '../screens';

// components
import {BackArrowButton} from '@/components';

const UserNavigator = createNativeStackNavigator({
  initialRouteName: 'UserDetails',
  screenOptions: {
    presentation: Platform.OS === 'android' ? 'transparentModal' : 'card',
  },
  screens: {
    UserDetails: {
      screen: UserDetails,
      options: {
        title: 'User Details',
        headerShadowVisible: false,
      },
    },
    EditProfile: {
      screen: EditProfile,
      options: {
        title: '',
        headerLeft: () => <BackArrowButton title="Edit Profile" />,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    tnc: {
      screen: TNCScreen,
      options: {
        title: '',
        headerShadowVisible: false,
        headerLeft: () => <BackArrowButton title="Terms & Conditions" />,
      },
    },
    privacy: {
      screen: PrivacyPolicy,
      options: {
        title: '',
        headerShadowVisible: false,
        headerLeft: () => <BackArrowButton title="Privacy Policy" />,
      },
    },
  },
});

export default UserNavigator;
