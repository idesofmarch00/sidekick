// dependencies
import {Dimensions, ImageBackground, View} from 'react-native';
import React, {useCallback, useRef} from 'react';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {ScaledSheet} from 'react-native-size-matters';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

// components
import {ButtonTextBottomSheet, Divider, H1, P1} from '@/components';
// store
import {useAuthStore, useThemeStore} from '@/globalStore';

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const authBottomSheetRef = useRef<BottomSheet>(null);
  const {colors} = useThemeStore(state => state.theme);
  const isDark = useThemeStore(state => state.isDark);

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
      <View style={{flex: 1, backgroundColor: colors.appBaseBg}}>
        <ImageBackground
          source={require('../assets/Map.png')} // Path to your background image
          style={[styles.background, {width, height}]} // Set width and height dynamically
        >
          {isDark && (
            <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(18, 20, 28, 0.65)'}} />
          )}
        </ImageBackground>
      </View>
      <BottomSheet
        key="authBottomSheet"
        ref={authBottomSheetRef}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        handleComponent={() => null}
        style={{flex: 1}}
        backgroundStyle={{backgroundColor: colors.white}}
        keyboardBehavior="interactive"
        enableContentPanningGesture={false}
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"
        index={1}
        snapPoints={['45%']}>
        <BottomSheetView style={{backgroundColor: colors.white}}>
          <View style={[styles.contentContainer, {backgroundColor: colors.white}]}>
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
