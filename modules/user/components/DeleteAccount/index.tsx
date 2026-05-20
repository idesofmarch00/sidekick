// dependencies
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {AuthService} from '@/globalService';

// components
import {H2, P2, Divider, ButtonText} from '@/components';
import { useGlobalStore } from '@/globalStore';

/**
 * Modal for confirming account deletion.
 */
const DeleteAccount: React.FC = () => {
  const {closeModal} = useGlobalStore();

  const handleDelete = () => {
    // TODO: Implement account deletion logic
    AuthService.signOut();
    closeModal();
    console.log('Account deletion initiated');
  };

  const handleGoBack = () => {
    closeModal();
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Divider height={20} />{/* Add some space below close button */}
      <H2>Delete Account?</H2>

      {/* Message */}
      <Divider height={5} />
      <P2 textColor="textSecondary">This action cannot be undone.</P2>

      {/* Buttons */}
      <Divider height={24} />
      <View style={styles.buttonWrapper}>
        <ButtonText variant="red" onPress={handleDelete}>
          Delete Account
        </ButtonText>
      </View>
      <Divider height={12} />
      <View style={styles.buttonWrapper}>
        <ButtonText variant="error" onPress={handleGoBack}>
          Go Back
        </ButtonText>
      </View>
      <Divider height={10} />{/* Add some padding at the bottom */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 10, // Adjust as needed
    paddingHorizontal: 20, // Add horizontal padding
    width: '100%',
    position: 'relative', // Needed for absolute positioning of close button
  },
  buttonWrapper: {
    width: '100%',
  },
  // Add styles for H2 and P2 if needed, or rely on global component styles
});

export default DeleteAccount;
