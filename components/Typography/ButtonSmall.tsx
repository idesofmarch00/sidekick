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

// Static typography metrics (don't change between themes)
const {theme: initialTheme} = useThemeStore.getState();

const ButtonSmall: React.FC<Props> = ({
  children,
  textColor = 'textPrimary',
  customStyles,
}) => {
  const {colors} = useThemeStore(state => state.theme);

  return (
    <Text
      style={[
        styles.textStyle,
        {color: colors[textColor]},
        customStyles,
      ]}>
      {children}
    </Text>
  );
};

export default ButtonSmall;

const styles = ScaledSheet.create({
  textStyle: {
    ...initialTheme.typography.skButtonSmall,
  },
});
