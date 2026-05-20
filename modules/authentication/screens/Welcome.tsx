// dependencies
import {Dimensions, ImageBackground, View} from 'react-native';
import React, {useCallback, useRef} from 'react';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {ScaledSheet} from 'react-native-size-matters';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

// components
import {ButtonTextBottomSheet, Divider, H1, P1} from '@/components';
import {useAuthStore} from '@/globalStore';

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const authBottomSheetRef = useRef<BottomSheet>(null);

  const {stopLoading} = useAuthStore();

  const onPressHandler = (route: string) => {
    // @ts-ignore
    navigation.navigate(route);
  };

  useFocusEffect(
    useCallback(() => {
      stopLoading('auth-confirmation');
      stopLoading('otp-verification');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <>
      <View style={{flex: 1}}>
        <ImageBackground
          source={require('../assets/Map.png')} // Path to your background image
          style={[styles.background, {width, height}]} // Set width and height dynamically
        />
      </View>
      <BottomSheet
        key="authBottomSheet"
        ref={authBottomSheetRef}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        handleComponent={() => null}
        style={{flex: 1}}
        keyboardBehavior="interactive"
        enableContentPanningGesture={false}
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"
        index={1}
        snapPoints={['45%']}>
        <BottomSheetView>
          <View style={styles.contentContainer}>
            <H1>Welcome!</H1>
            <Divider height={9.6} />
            <P1>Please Sign In to Continue</P1>
            <Divider height={26} />
            <View style={{width: '100%', rowGap: 12}}>
              <ButtonTextBottomSheet
                onPress={() => {
                  onPressHandler('new');
                }}
                variant="primary">
                New User
              </ButtonTextBottomSheet>
              <ButtonTextBottomSheet
                onPress={() => {
                  onPressHandler('existing');
                }}
                variant="secondary">
                Already a User
              </ButtonTextBottomSheet>
              <ButtonTextBottomSheet
                onPress={() => {
                  onPressHandler('employee');
                }}
                variant="secondary">
                Employee
              </ButtonTextBottomSheet>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default WelcomeScreen;

const styles = ScaledSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white', // Optional: Adds a dark overlay for text readability
    borderRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
  },
});
