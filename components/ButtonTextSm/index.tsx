// src/components/PrimaryButton.tsx
import React, {ReactNode} from 'react';
import {Text, Pressable, ViewStyle} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore} from '@/theme/store';

type Props = {
  children: ReactNode;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'highlight';
  customStyles?: ViewStyle;
};

const {typography, colors} = useThemeStore.getState().theme;

const ButtonTextSm: React.FC<Props> = ({
  children,
  onPress,
  variant,
  customStyles,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pressableContainer, styles[variant], {...customStyles}]}>
      <ChildText variant={variant}>{children}</ChildText>
    </Pressable>
  );
};

type ChildTextProps = {
  children: ReactNode;
  variant: 'primary' | 'secondary' | 'highlight';
};

const ChildText: React.FC<ChildTextProps> = ({children, variant}) => {
  return (
    <Text style={[textStyles.commonTextStyle, textStyles[variant]]}>
      {children}
    </Text>
  );
};

export default ButtonTextSm;

const textStyles = ScaledSheet.create({
  commonTextStyle: {
    ...typography.skButtonSmall,
  },
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textPrimary,
  },
  highlight: {
    color: colors.white,
  },
});

const styles = ScaledSheet.create({
  pressableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '25.6@vs',
    borderRadius: 12,
  },
  commonTextStyle: {
    ...typography.skButtonSmall,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  highlight: {
    backgroundColor: colors.highlight,
  },
});
