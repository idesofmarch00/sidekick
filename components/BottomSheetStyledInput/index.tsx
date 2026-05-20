// dependencies
import React from 'react';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore} from '@/theme/store';

// types
import {TextInputProps, TextStyle} from 'react-native';

interface BottomSheetStyledInputProps extends TextInputProps {
  placeholder: string; // Customizable placeholder
  customStyle?: TextStyle;
  secureTextEntry?: boolean; // Option to toggle password input
}

const {theme} = useThemeStore.getState();

const BottomSheetStyledInput: React.FC<BottomSheetStyledInputProps> = ({
  placeholder,
  secureTextEntry = false,
  customStyle,
  ...rest
}) => {
  return (
    <BottomSheetTextInput
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      secureTextEntry={secureTextEntry}
      style={[styles.input, customStyle]}
      {...rest}
    />
  );
};

export default BottomSheetStyledInput;

const styles = ScaledSheet.create({
  input: {
    borderWidth: 2,
    width: '100%',
    height: '48@vs',
    borderColor: theme.colors.textSecondary,
    borderRadius: 20,
    paddingLeft: '18@s',
    fontWeight: '600',
    fontSize: '15.2@ms',
    color: theme.colors.textPrimary,
  },
});
