import React, {ReactNode} from 'react';
import {ViewStyle, TextStyle} from 'react-native';
import {Button} from 'react-native-paper';
import {useThemeStore} from '@/theme/store';

type Props = {
  children: ReactNode;
  onPress: () => void;
  variant: 'primary' | 'secondary';
  IconComponent?: React.FC;
};

type ContainerStyles = {
  primary: ViewStyle;
  secondary: ViewStyle;
};

type TextStyles = {
  primary: TextStyle;
  secondary: TextStyle;
};

const ButtonWithIcon: React.FC<Props> = ({
  children,
  onPress,
  variant,
  IconComponent,
}) => {
  const {colors} = useThemeStore(state => state.theme);

  const containerStyles: ContainerStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: 30,
      width: 220,
      height: 60,
    },
    secondary: {
      backgroundColor: colors.white,
      borderRadius: 30,
      width: 220,
      height: 60,
    },
  };

  const textStyles: TextStyles = {
    primary: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 16,
    },
    secondary: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 16,
    },
  };

  return (
    <Button
      mode="contained"
      onPress={onPress}
      contentStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        gap: 5,
      }}
      style={containerStyles[variant]}
      labelStyle={textStyles[variant]}
      icon={IconComponent ? () => <IconComponent /> : undefined}>
      {children}
    </Button>
  );
};

export default ButtonWithIcon;
