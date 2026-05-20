import React from 'react';
import {View} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore, useWalletStore} from '@/globalStore';

// components
import {ButtonTextSm, B2} from '@/components';
interface SecurityDepositBarProps {
  /**
   * Function to call when withdraw button is pressed
   */
  onWithdraw: () => void;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Bar displaying security deposit and withdraw button
 */
const {colors} = useThemeStore.getState().theme;

const SecurityDepositBar: React.FC<SecurityDepositBarProps> = ({
  onWithdraw,
  testID = 'security-deposit-bar',
}) => {
  const {userWallet} = useWalletStore();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container]} testID={testID}>
        <View style={styles.depositContainer}>
          <B2>Security Deposit</B2>
          <B2>₹{userWallet?.security_deposit}</B2>
        </View>
      </View>
      <View style={{width: '27%'}}>
        <ButtonTextSm onPress={onWithdraw} variant="highlight">
          Withdraw
        </ButtonTextSm>
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
  },
  depositContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: '6.7@ms',
    paddingHorizontal: '15@ms',
    borderRadius: 12,
    backgroundColor: colors.lightGray,
  },
  label: {
    marginRight: 8,
  },
  amount: {
    fontWeight: '600',
  },
  buttonWrapper: {
    width: 120, // Adjust width as needed
  },
});

export default SecurityDepositBar;
