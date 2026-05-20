// dependencies
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  Platform,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';

// components
import {ButtonText, Divider, LabelPrimary, showToast} from '@/components';

// store
import {useAuthStore, useThemeStore} from '@/globalStore';

// services
import {AuthService} from '@/globalService';

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const EmployeeForm: React.FC = () => {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const {theme} = useThemeStore();
  const authBottomSheetRef = useRef<BottomSheet>(null);

  const [employeeId, setEmployeeId] = useState<string>('');

  const {
    existingUserPhoneNumber,
    setExistingUserPhoneNumber,
    organisations,
    setSelectedOrganisation,
    selectedOrganisation,
    startLoading,
    stopLoading,
    authLoaders,
  } = useAuthStore();

  const continueHandler = async () => {
    Keyboard.dismiss();

    try {
      startLoading('auth-confirmation');

      // check if employee exists in the org
      const employeeDetails = await AuthService.checkIfUserExistsInOrg({
        employeeId: employeeId,
        phone: `+91${existingUserPhoneNumber}`,
        orgId: selectedOrganisation?.id,
      });

      if (!employeeDetails) {
        stopLoading('auth-confirmation');
        showToast({
          type: 'error',
          text1: 'Employee not found',
          text2: 'Please enter correct employee info',
        });
        return;
      }

      authBottomSheetRef?.current?.snapToPosition('60%');

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
      console.log('Error sending otp');
      // @ts-ignore
      console.log(err?.message);
    }
  };

  const onFocus = () => {
    authBottomSheetRef?.current?.snapToPosition('100%');
  };

  const onSubmitEditing = () => {
    Keyboard.dismiss();
    if (Platform.OS === 'android') {
      authBottomSheetRef?.current?.snapToPosition('60%');
    }
  };

  const getSnapPoints = () => {
    if (Platform.OS === 'android') {
      return ['60%', '100%'];
    } else {
      return ['60%'];
    }
  };

  useEffect(() => {
    AuthService.fetchAllOrganistions();
  }, []);

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
              Select Institution
            </LabelPrimary>
            <Divider height={10} />
            <Dropdown
              style={{
                borderWidth: 2,
                width: '100%',
                height: verticalScale(48),
                borderColor: theme.colors.textSecondary,
                borderRadius: 20,
                paddingLeft: scale(18),
              }}
              searchPlaceholderTextColor={theme.colors.textSecondary}
              mode="modal"
              placeholder="XXXXXXXXXX"
              placeholderStyle={{color: theme.colors.textSecondary}}
              iconStyle={{
                right: 10,
              }}
              data={organisations.map(org => {
                return {
                  label: org.name,
                  value: org.id,
                };
              })}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              searchPlaceholder="Search..."
              value={selectedOrganisation?.id}
              onChange={item => {
                setSelectedOrganisation({
                  id: item.value,
                  name: item.label,
                });
              }}
            />
          </View>

          <View style={{width: '100%'}}>
            <LabelPrimary customStyles={{paddingLeft: scale(18)}}>
              Enter Employee ID
            </LabelPrimary>
            <Divider height={10} />
            {Platform.OS === 'android' ? (
              <BottomSheetTextInput
                autoCapitalize="characters"
                placeholder="XXXXXXXXXX"
                onSubmitEditing={onSubmitEditing}
                onFocus={onFocus}
                onChangeText={val => {
                  setEmployeeId(val);
                }}
                placeholderTextColor={theme.colors.textSecondary}
                style={{
                  borderWidth: 2,
                  width: '100%',
                  height: verticalScale(48),
                  borderColor: theme.colors.textSecondary,
                  borderRadius: 20,
                  paddingLeft: scale(18),
                  fontWeight: '600',
                  fontSize: moderateScale(15.2),
                  color: theme.colors.textPrimary,
                }}
              />
            ) : (
              <BottomSheetTextInput
                autoCapitalize="characters"
                placeholder="XXXXXXXXXX"
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={val => {
                  setEmployeeId(val);
                }}
                style={{
                  borderWidth: 2,
                  width: '100%',
                  height: verticalScale(48),
                  borderColor: theme.colors.textSecondary,
                  borderRadius: 20,
                  paddingLeft: scale(18),
                  fontWeight: '600',
                  fontSize: moderateScale(15.2),
                  color: theme.colors.textPrimary,
                }}
              />
            )}
          </View>

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
                  onSubmitEditing={onSubmitEditing}
                  onFocus={onFocus}
                  keyboardType="numeric"
                  placeholder="XXXXXXXXXX"
                  onChangeText={setExistingUserPhoneNumber}
                  placeholderTextColor={theme.colors.textSecondary}
                  style={{
                    color: theme.colors.textPrimary,
                    width: '70%',
                    fontWeight: '600',
                    paddingVertical: 0,
                    fontSize: moderateScale(15.2),
                    height: 32,
                  }}
                />
              ) : (
                <BottomSheetTextInput
                  keyboardType="numeric"
                  placeholder="XXXXXXXXXX"
                  onChangeText={setExistingUserPhoneNumber}
                  placeholderTextColor={theme.colors.textSecondary}
                  style={{
                    color: theme.colors.textPrimary,
                    width: '70%',
                    fontWeight: '600',
                    paddingVertical: 0,
                    fontSize: moderateScale(15.2),
                    height: 32,
                  }}
                />
              )}
            </View>
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

export default EmployeeForm;

const styles = ScaledSheet.create({
  background: {
    flex: 1,
  },
  contentContainer: {
    height: 200,
    rowGap: 16,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 32,
    paddingHorizontal: 24,
    zIndex: 99,
  },

  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
});
