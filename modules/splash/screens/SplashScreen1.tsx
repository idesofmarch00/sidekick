// dependencies
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import 'react-native-url-polyfill/auto';

// components
import ButtonText from '@/components/ButtonText';

// assets
import SideKickLogo from '../assets/sidekick_logo.svg';

// styles
import {splashStyles} from '../splashStyles';

// store
import {useThemeStore} from '@/globalStore';

const SplashScreen1: React.FC = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useThemeStore();

  return (
    <View style={[splashStyles.layoutBackground, {backgroundColor: isDark ? theme.colors.appBaseBg : theme.colors.primary}]}>
      <SideKickLogo />
      <View style={splashStyles.bottomButtonContainer}>
        <View style={{width: 220}}>
          <ButtonText
            onPress={() => {
              // @ts-ignore
              navigation.replace('splash2');
            }}
            variant="secondary">
            Get started
          </ButtonText>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen1;
