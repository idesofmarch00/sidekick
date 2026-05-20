// dependencies
import {Pressable, View} from 'react-native';
import React, {useCallback} from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';

// components
import ChevronLeft from '@/assets/chevron-left.svg';

const BackArrowButton: React.FC = () => {
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    navigation.goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{justifyContent: 'flex-start'}}>
      <Pressable onPress={goBack} style={styles.container}>
        <ChevronLeft />
      </Pressable>
    </View>
  );
};

export default BackArrowButton;

const styles = ScaledSheet.create({
  container: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
    backgroundColor: 'white',
  },
});
