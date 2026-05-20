// src/components/ToastMessage/index.ts
import React from 'react';
import Toast from 'react-native-toast-message';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessageProps {
  type?: ToastVariant;
  text1?: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  onShow?: () => void;
  onHide?: () => void;
  onPress?: () => void;
}

// Function to show toast
export const showToast = ({
  type = 'success',
  text1 = '',
  text2 = '',
  position = 'top',
  visibilityTime = 4000,
  autoHide = true,
  topOffset = 40,
  bottomOffset = 40,
  onShow,
  onHide,
  onPress,
}: ToastMessageProps) => {
  Toast.show({
    type: type,
    text1,
    text2,
    position,
    visibilityTime,
    autoHide,
    topOffset,
    bottomOffset,
    onShow,
    onHide,
    onPress,
  });
};

// Function to hide toast
export const hideToast = () => {
  Toast.hide();
};

// Toast component with custom config
const ToastMessage = () => {
  return <Toast />;
};

export default ToastMessage;
