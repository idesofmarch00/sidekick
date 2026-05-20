import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// store
import {useGlobalStore} from '@/globalStore';

// components
import ButtonText from '@/components/ButtonText';
import {Divider, H2, P2} from '@/components';
import Failed from '@/assets/failed.svg';

const PaymentFailure = () => {
  const navigation = useNavigation();
  const {closeModal} = useGlobalStore();

  // Handle check wallet
  const handleCheckWallet = () => {
    // Close modal
    closeModal();
    // Call the callback if provided
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer]}>
        <Failed />
      </View>

      {/* Success message */}
      <Divider height={16} />
      <H2>Payment Failed</H2>
      <Divider height={3.2} />
      <P2 textColor="textSecondary">Please try again</P2>

      {/* Action buttons */}
      <Divider height={16} />
      <View style={styles.buttonContainer}>
        <ButtonText
          variant="primary"
          onPress={() => {
            closeModal();
          }}>
          Retry Payment
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

export default PaymentFailure;

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
