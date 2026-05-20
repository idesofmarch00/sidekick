// dependencies
import {Text, TextStyle} from 'react-native';
import React, {ReactNode} from 'react';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore} from '@/theme/store';

// types
import {ColorSelector} from '@/theme/colors';

type Props = {
  children: ReactNode;
  textColor?: ColorSelector;
  weight?: TextStyle['fontWeight'];
  customStyles?: TextStyle;
};

const {theme} = useThemeStore.getState();

const P1: React.FC<Props> = ({
  children,
  textColor = 'textPrimary',
  customStyles,
  weight = '500',
}) => {
  return (
    <Text
      style={[
        styles.textBase,
        {
          color: theme.colors[textColor],
          fontWeight: weight,
        },
        customStyles,
      ]}>
      {children}
    </Text>
  );
};

const styles = ScaledSheet.create({
  textBase: {
    ...theme.typography.skP1,
  },
});

export default P1;
