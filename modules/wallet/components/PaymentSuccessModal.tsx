import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useThemeStore} from '@/globalStore';
import ButtonText from '@/components/ButtonText';
import CommonModal from '@/components/Modal/CommonModal';
import {Divider, H2, P2} from '@/components';
import TickMark from '@/assets/tick-mark-curly.svg';

interface PaymentSuccessModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  /**
   * Function to call when the modal is closed
   */
  onClose: () => void;
  /**
   * Amount added to wallet
   */
  amount: number;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Optional callback for "Continue to Ride" action
   */
  onContinueToRide?: () => void;
  /**
   * Optional callback for "Check Wallet" action
   */
  onCheckWallet?: () => void;
}

/**
 * Modal displayed after successful payment
 */
const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  onClose,
  amount,
  testID = 'payment-success-modal',
  onContinueToRide,
  onCheckWallet,
}) => {
  const {colors} = useThemeStore(state => state.theme);

  // Handle continue to ride
  const handleContinueToRide = () => {
    // Close modal first
    onClose();
    // Call the callback if provided
    if (onContinueToRide) {
      onContinueToRide();
    }
  };

  // Handle check wallet
  const handleCheckWallet = () => {
    // Close modal
    onClose();
    // Call the callback if provided
    if (onCheckWallet) {
      onCheckWallet();
    }
  };

  return (
    <CommonModal visible={visible} onClose={onClose} testID={testID}>
      <View style={styles.container}>
        {/* Success icon */}
        <View
          style={[styles.iconContainer, {backgroundColor: colors.highlight}]}>
          <TickMark />
        </View>

        {/* Success message */}
        <Divider height={16} />
        <H2>₹{amount.toFixed(1)} Added to Wallet</H2>
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
    </CommonModal>
  );
};

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
    width: '100%',
    marginBottom: 12,
  },
});

export default PaymentSuccessModal;
