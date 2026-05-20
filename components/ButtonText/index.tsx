// src/components/PrimaryButton.tsx
import React, {ReactNode} from 'react';
import {Text, ViewStyle, Pressable} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {ActivityIndicator} from 'react-native-paper';

// store
import {useThemeStore} from '@/theme/store';

type Props = {
  children: ReactNode;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'highlight' | 'error' | 'red';
  customStyle?: ViewStyle;
  loading?: boolean;
};

type ContainerStyles = {
  primary: ViewStyle;
  secondary: ViewStyle;
  highlight: ViewStyle;
  error: ViewStyle;
  red: ViewStyle;
};

const {typography, colors} = useThemeStore.getState().theme;

const ButtonText: React.FC<Props> = ({
  children,
  onPress,
  variant,
  customStyle,
  loading = false,
}) => {
  const containerStyles: ContainerStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.lightGray,
    },
    highlight: {
      backgroundColor: colors.highlight,
    },
    error: {
      backgroundColor: colors.alert,
    },
    red: {
      backgroundColor: colors.error,
    },
  };

  return loading ? (
    <Pressable
      style={[
        styles.pressableContainer,
        containerStyles[variant],
        {...customStyle},
      ]}>
      <ActivityIndicator color={colors.textPrimary} />
    </Pressable>
  ) : (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[
        styles.pressableContainer,
        containerStyles[variant],
        {...customStyle},
      ]}>
      <ChildText variant={variant}>{children}</ChildText>
    </Pressable>
  );
};

type ChildTextProps = {
  children: ReactNode;
  variant: 'primary' | 'secondary' | 'highlight' | 'error' | 'red';
};

const ChildText: React.FC<ChildTextProps> = ({children, variant}) => {
  return (
    <Text style={[styles.commonTextStyle, styles[variant]]}>{children}</Text>
  );
};

export default ButtonText;

const styles = ScaledSheet.create({
  pressableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '48@vs',
    borderRadius: 30,
  },
  commonTextStyle: {
    ...typography.skButtonMedium,
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
  error: {
    color: colors.error,
  },
  red: {
    color: colors.white,
  },
});
