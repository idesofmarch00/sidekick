// dependencies
import {Pressable, StyleSheet} from 'react-native';
import React from 'react';

// imports
import Close from '@/assets/cross.svg';

// store
import {useGlobalStore} from '@/globalStore';

const ModalCloseButton: React.FC = () => {
  const {closeModal} = useGlobalStore();

  return (
    <Pressable style={styles.closeButton} onPress={closeModal}>
      <Close width={24} height={24} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 99,
  },
});

export default ModalCloseButton;
