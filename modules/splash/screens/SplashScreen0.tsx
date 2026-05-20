// dependencies
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import 'react-native-url-polyfill/auto';

// components
import ButtonText from '@/components/ButtonText';

// assets
import SideKickBackgroundLogo from '../assets/sidekick_background_logo.svg';
import SideKickName from '../assets/sidekick_name.svg';

// styles
import {splashStyles} from '../splashStyles';

// Define new styles specifically for this screen
const styles = StyleSheet.create({
  backgroundLogoContainer: {
    ...StyleSheet.absoluteFillObject, // Fill the parent view
    justifyContent: 'center', // Center the SVG vertically
    alignItems: 'center', // Center the SVG horizontally
  },
  backgroundLogo: {
    transform: [{scaleX: 1.1}, {scaleY: 1.02}],
  },
  nameLogo: {
    width: 253,
    height: 50,
    // Centered by the parent contentContainer
  },
  contentContainer: {
    flex: 1, // Take up space between header (implicitly) and bottom button
    justifyContent: 'center',
    alignItems: 'center',
  },
});


const SplashScreen0: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={splashStyles.layoutBackground}>
      {/* Background Logo Container */}
      <View style={styles.backgroundLogoContainer} pointerEvents="none">
        <SideKickBackgroundLogo style={styles.backgroundLogo} />
      </View>

      {/* Centered Content Area */}
      <View style={styles.contentContainer}>
        {/* Name Logo */}
        <SideKickName style={styles.nameLogo} />
      </View>

      {/* Bottom Button Area */}
      <View style={splashStyles.bottomButtonContainer}>
        <View style={{width: 220}}>
          <ButtonText
            onPress={() => {
              // @ts-ignore
              navigation.replace('splash2'); // Navigate to splash1
            }}
            variant="secondary">
            Get started
          </ButtonText>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen0;