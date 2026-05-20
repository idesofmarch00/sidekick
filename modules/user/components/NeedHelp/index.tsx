// dependencies
import React from 'react';
import {View, StyleSheet, Linking} from 'react-native';

// components
import {H2, P2, Divider, ButtonText} from '@/components';

/**
 * Modal for contacting support via email
 */
const NeedHelp: React.FC = () => {
  const handleContactSupport = async () => {
    const emailUrl = `mailto:help@sidekick.com?subject=${encodeURIComponent(
      'Support Request from Sidekick App',
    )}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        
      }
    } catch (error) {
      console.error('Error opening email client:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <H2>Sorry for the inconvenience!</H2>

      {/* Message */}
      <Divider height={5} />
      <P2 textColor="textSecondary">
        Please drop us an email and we'll get back to you
      </P2>

      {/* Button */}
      <Divider height={16} />
      <View style={{width: '100%'}}>
        <ButtonText variant="primary" onPress={handleContactSupport}>
          Drop an Email
        </ButtonText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    width: '100%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default NeedHelp;
