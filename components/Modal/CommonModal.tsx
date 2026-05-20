import React, {ReactNode} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {useThemeStore} from '@/theme/store';
import Cross from '@/assets/cross.svg';

interface CommonModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  /**
   * Content to display inside the modal
   */
  children: ReactNode;
  /**
   * Function to call when the modal is closed
   */
  onClose: () => void;
  /**
   * Function to call when primary action is triggered
   */
  onPress?: () => void;
  /**
   * Function to call when secondary/cancel action is triggered
   */
  onCancel?: () => void;
  /**
   * Whether to close the modal when clicking outside
   */
  closeOnBackdropPress?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A reusable modal component that can be used throughout the app
 */
const {colors, shadows} = useThemeStore.getState().theme;

const CommonModal: React.FC<CommonModalProps> = ({
  visible,
  children,
  onClose,
  closeOnBackdropPress = true,
  testID = 'common-modal',
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      testID={testID}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.white,
                  // borderRadius: borderRadius.lg,
                  ...shadows.md,
                },
              ]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
                testID={`${testID}-close-button`}>
                <Cross />
              </TouchableOpacity>

              <View style={styles.content}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: '99%',
    padding: 24,
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  content: {
    width: '100%',
  },
});

export default CommonModal;
