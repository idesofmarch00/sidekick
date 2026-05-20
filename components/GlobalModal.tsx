import React from 'react';
import Modal from 'react-native-modal';
import {View, StyleSheet, Dimensions} from 'react-native';

// store
import {useGlobalStore} from '@/globalStore';

const GlobalModal: React.FC = () => {
  const {isModalOpen, ModalComponent, ModalCloseButton} = useGlobalStore();

  return (
    <Modal
      isVisible={isModalOpen}
      coverScreen={true}
      statusBarTranslucent
      deviceHeight={Dimensions.get('screen').height}
      style={{zIndex: 9999, flex: 1}}
      backdropOpacity={0.5}
      useNativeDriver // Add this
      hideModalContentWhileAnimating // Add this
      avoidKeyboard // Helps with Android keyboard
      renderToHardwareTextureAndroid
      animationIn="slideInUp"
      animationInTiming={350}
      animationOutTiming={100}
      backdropTransitionOutTiming={100}
      backdropTransitionInTiming={300}
      animationOut="slideOutDown"
      onBackdropPress={() => null}>
      <View style={styles.modalContainer}>
        {ModalCloseButton && <ModalCloseButton />}
        {ModalComponent && <ModalComponent />}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    maxHeight: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86A0CA',
    borderStyle: 'solid',
    position: 'relative',
    zIndex: 99,
    elevation: 24, // Android
  },
});

export default GlobalModal;
