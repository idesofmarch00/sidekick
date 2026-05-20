import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useGlobalStore, useThemeStore, useWalletStore} from '@/globalStore';
import ButtonText from '@/components/ButtonText';
import {Divider, H2, P2} from '@/components';
import TickMark from '@/assets/tick-mark-curly.svg';
import {useNavigation} from '@react-navigation/native';

const PaymentSuccess = () => {
  const navigation = useNavigation();
  const {closeModal} = useGlobalStore();
  const {rechargeAmount} = useWalletStore();
  const {
    theme: {colors},
  } = useThemeStore();

  // Handle continue to ride
  const handleContinueToRide = () => {
    // Close modal first
    closeModal();
    navigation.goBack();
  };

  // Handle check wallet
  const handleCheckWallet = () => {
    // Close modal
    closeModal();
    // Call the callback if provided
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Success icon */}
      <View style={[styles.iconContainer, {backgroundColor: colors.highlight}]}>
        <TickMark />
      </View>

      {/* Success message */}
      <Divider height={16} />
      <H2>₹ {rechargeAmount} Added to Wallet</H2>
      <Divider height={3.2} />
      <P2 textColor="textSecondary">Please pick any option to continue</P2>

      {/* Action buttons */}
      <Divider height={16} />
      <View style={styles.buttonContainer}>
        <ButtonText variant="primary" onPress={handleContinueToRide}>
          Continue to Ride
        </ButtonText>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonText variant="secondary" onPress={handleCheckWallet}>
          Check Wallet
        </ButtonText>
      </View>
    </View>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: 280,
    marginBottom: 12,
  },
});
