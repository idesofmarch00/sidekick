// dependencies
import React from 'react';
import {View, StyleSheet} from 'react-native';

// components
import ButtonText from '@/components/ButtonText';

interface AddFundsButtonProps {
  /**
   * Function to call when button is pressed
   */
  onPress: () => void;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Button for adding funds to wallet
 */
const AddFundsButton: React.FC<AddFundsButtonProps> = ({
  onPress,
  testID = 'add-funds-button',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.buttonWrapper}>
        <ButtonText variant="primary" onPress={onPress}>
          Add Funds
        </ButtonText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '60%', // Adjust width as needed
    maxWidth: 300,
  },
});

export default AddFundsButton;
