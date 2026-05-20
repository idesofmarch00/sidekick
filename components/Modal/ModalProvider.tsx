import React, {createContext, useState, useContext, ReactNode} from 'react';
import {View, StyleSheet} from 'react-native';

// Define the context type
interface ModalContextType {
  showModal: (modalContent: ReactNode) => void;
  hideModal: () => void;
}

// Create the context with default values
const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  hideModal: () => {},
});

// Hook to use the modal context
export const useModal = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

/**
 * Provider component that allows showing modals from anywhere in the app
 */
export const ModalProvider: React.FC<ModalProviderProps> = ({children}) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showModal = (content: ReactNode) => {
    setModalContent(content);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    // Clear content after animation completes
    setTimeout(() => {
      setModalContent(null);
    }, 300);
  };

  return (
    <ModalContext.Provider value={{showModal, hideModal}}>
      {children}
      {isVisible && modalContent && (
        <View style={StyleSheet.absoluteFill}>{modalContent}</View>
      )}
    </ModalContext.Provider>
  );
};
