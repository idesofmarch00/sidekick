// dependencies
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  Platform,
  Text,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale,
} from 'react-native-size-matters';
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useHeaderHeight} from '@react-navigation/elements';

// components
import {ButtonText, Divider, LabelPrimary} from '@/components';

// store
import {useAuthStore, useThemeStore} from '@/globalStore';

// services
import {AuthService} from '@/globalService';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const AlreadyUserForm: React.FC = () => {
  const {theme} = useThemeStore();
  const headerHeight = useHeaderHeight();

  const navigation = useNavigation();
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
  }>({});

  const authBottomSheetRef = useRef<BottomSheet>(null);

  const {
    existingUserPhoneNumber,
    setExistingUserPhoneNumber,
    authLoaders,
    startLoading,
    stopLoading,
  } = useAuthStore();

  const onFocus = () => {
    authBottomSheetRef?.current?.snapToPosition('70%');
  };

  const onSubmitEditing = () => {
    Keyboard.dismiss();
    authBottomSheetRef?.current?.snapToPosition('40%');
  };

  const continueHandler = async () => {
    if (!validateForm()) {
      return;
    }

    Keyboard.dismiss();
    try {
      startLoading('auth-confirmation');
      authBottomSheetRef?.current?.snapToPosition('40%');
      const response = await AuthService.sendOTP(
        `+91${existingUserPhoneNumber}`,
        false,
      );
      if (response) {
        // @ts-ignore
        navigation.navigate('otp');
      }
    } catch (err) {
      stopLoading('auth-confirmation');
      console.log('Error sending otp', err);
    }
  };

  const getSnapPoints = () => {
    if (Platform.OS === 'android') {
      return ['35%', '40%'];
    } else {
      return ['35%'];
    }
  };

  const phoneInputRef =
    useRef<React.ElementRef<typeof BottomSheetTextInput>>(null);

  const validateForm = () => {
    const newErrors: {
      phoneNumber?: string;
    } = {};
    let isValid = true;

    // Validate phone number
    if (!existingUserPhoneNumber || existingUserPhoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (
      existingUserPhoneNumber.length !== 10 ||
      !/^\d+$/.test(existingUserPhoneNumber)
    ) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

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
        topInset={headerHeight}
        ref={authBottomSheetRef}
        enablePanDownToClose={false}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        handleComponent={() => null}
        keyboardBehavior="interactive"
        enableContentPanningGesture={false}
        android_keyboardInputMode="adjustResize"
        keyboardBlurBehavior="restore"
        index={1}
        snapPoints={getSnapPoints()}>
        <BottomSheetView style={styles.contentContainer}>
          <View style={{width: '100%'}}>
            <LabelPrimary customStyles={{paddingLeft: scale(18)}}>
              Enter Your Phone Number
            </LabelPrimary>
            <Divider height={10} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                width: '100%',
                height: verticalScale(48),
                borderColor: theme.colors.textSecondary,
                borderRadius: 20,
                paddingLeft: scale(18),
                columnGap: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  columnGap: 10,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: theme.colors.highlight,
                    fontSize: 16,
                    fontFamily: 'PlusJakartaSans-Bold',
                  }}>
                  +91{' '}
                </Text>
                <View
                  style={{width: 1, height: 20, backgroundColor: 'black'}}
                />
              </View>
              {Platform.OS === 'android' ? (
                <BottomSheetTextInput
                  ref={phoneInputRef}
                  onFocus={onFocus}
                  onSubmitEditing={
                    Platform.OS === 'android' ? onSubmitEditing : () => {}
                  }
                  multiline={false}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={text => {
                    setExistingUserPhoneNumber(text);
                  }}
                  style={{
                    width: '70%',
                    color: theme.colors.textPrimary,
                    fontWeight: '600',
                    paddingVertical: 0,
                    height: 32,
                    fontSize: moderateScale(15.2),
                  }}
                />
              ) : (
                <BottomSheetTextInput
                  ref={phoneInputRef}
                  multiline={false}
                  placeholder="XXXXXXXXXX"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={10}
                  onChangeText={text => {
                    setExistingUserPhoneNumber(text);
                  }}
                  style={{
                    width: '70%',
                    color: theme.colors.textPrimary,
                    fontWeight: '600',
                    paddingVertical: 0,
                    height: 32,
                    fontSize: moderateScale(15.2),
                  }}
                />
              )}
            </View>
            {errors.phoneNumber ? (
              <Text style={[styles.errorText, {color: theme.colors.error}]}>
                {errors.phoneNumber}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              marginTop: 4,
              width: 220,
              alignSelf: 'center',
            }}>
            <ButtonText
              variant="primary"
              onPress={continueHandler}
              loading={authLoaders['auth-confirmation']}>
              Continue
            </ButtonText>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

export default AlreadyUserForm;

const styles = ScaledSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    rowGap: 16,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: '12@ms',
    marginTop: '4@vs',
    marginLeft: '18@s',
  },
});
