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
  labelColor?: ColorSelector;
  customStyles?: TextStyle;
};

const {theme} = useThemeStore.getState();

const LabelsPrimary: React.FC<Props> = ({
  children,
  labelColor = 'textPrimary',
  customStyles,
}) => {
  return (
    <Text
      style={[
        styles.label,
        {color: theme.colors[labelColor], ...customStyles},
      ]}>
      {children}
    </Text>
  );
};

const styles = ScaledSheet.create({
  label: {
    ...theme.typography.skLabel,
  },
});

export default LabelsPrimary;
