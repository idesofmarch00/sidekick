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
  customStyles?: TextStyle;
};

const {theme} = useThemeStore.getState();

const H2: React.FC<Props> = ({
  children,
  textColor = 'textPrimary',
  customStyles,
}) => {
  return (
    <Text
      style={[
        styles.textStyle,
        {color: theme.colors[textColor]},
        customStyles,
      ]}>
      {children}
    </Text>
  );
};

export default H2;

const styles = ScaledSheet.create({
  textStyle: {
    ...theme.typography.skH2,
  },
});
