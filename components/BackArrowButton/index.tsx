// dependencies
import {Pressable} from 'react-native';
import React, {useCallback} from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';

// components
import ChevronLeft from '@/assets/chevron-left.svg';
import H2 from '../Typography/H2';

type Props = {
  title: string;
};

const BackArrowButton: React.FC<Props> = ({title}) => {
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    navigation.goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable style={styles.container} onPress={goBack}>
      <ChevronLeft />
      <H2>{title}</H2>
    </Pressable>
  );
};

export default BackArrowButton;

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    alignItems: 'center',
    columnGap: '28@ms',
    paddingLeft: '12@s',
  },
});
