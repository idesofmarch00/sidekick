// dependencies
import {TextInput, TextInputProps, TextStyle} from 'react-native';
import React from 'react';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore} from '@/theme/store';

interface CommonTextInputProps extends TextInputProps {
  placeholder: string; // Customizable placeholder
  customStyle?: TextStyle;
  secureTextEntry?: boolean; // Option to toggle password input
}

const {theme} = useThemeStore.getState();

const CommonTextInput: React.FC<CommonTextInputProps> = ({
  placeholder,
  secureTextEntry = false,
  customStyle,
  ...rest
}) => {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      secureTextEntry={secureTextEntry}
      style={[styles.input, customStyle]}
      {...rest}
    />
  );
};

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
    color: theme.colors.textSecondary,
  },
});

export default CommonTextInput;
