import React, {useState} from 'react';
import {View, SafeAreaView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ScaledSheet} from 'react-native-size-matters';

// store
import {useThemeStore, useUserStore} from '@/globalStore';

// components
import Input from '@/components/Input';
import ButtonText from '@/components/ButtonText';
import {UserService} from '@/globalService';
import {showToast} from '@/components';

interface EditProfileProps {
  route?: {
    params?: {
      initialName?: string;
      initialEmail?: string;
      initialPhone?: string;
    };
  };
}

const EditProfile: React.FC<EditProfileProps> = () => {
  const {user, startLoading, stopLoading, userLoaders} = useUserStore();
  const navigation = useNavigation();
  const {colors} = useThemeStore(state => state.theme);

  // Initialize form state with route params or defaults
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(
    user?.phone_number.replace(/^\+91/, '') || '',
  );

  // Form validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Handle save changes
  const handleSaveChanges = () => {
    // Reset errors
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };

    // Validate form
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      startLoading('update-user');
      // Save changes and navigate back
      UserService.updateUserDetails({
        id: user?.id,
        _set: {
          full_name: name,
          email: email,
        },
      })
        .then(response => {
          if (response) {
            UserService.fetchUserDetails();
            showToast({
              type: 'success',
              text1: 'Profile Updated',
              text2: 'Your profile has been successfully updated',
              position: 'top',
            });
            stopLoading('update-user');
            navigation.goBack();
          } else {
            showToast({
              type: 'error',
              text1: 'Update Failed',
              text2: 'Failed to update profile. Please try again.',
              position: 'top',
            });
          }
        })
        .catch(error => {
          stopLoading('update-user');
          showToast({
            type: 'error',
            text1: 'Failed to update profile',
            text2: 'An error occurred while updating your profile',
            position: 'top',
          });
          console.error('Profile update error:', error);
        });
    } else {
      stopLoading('update-user');
      showToast({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors in the form',
        position: 'top',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Form container with blue border */}
      <View style={[styles.formContainer]}>
        {/* Name input */}
        <Input
          title="Name"
          placeholder="XXXXXXXXXX"
          placeholderTextColor={colors.textSecondary}
          value={name}
          onChangeText={setName}
          error={errors.name}
          required
          inputType="text"
          testID="name-input"
          // @ts-ignore
          containerStyle={styles.inputContainer}
        />

        {/* Email input */}
        <Input
          title="Email Address"
          placeholder="XXXXXXXXXX"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          required
          inputType="email"
          testID="email-input"
          // @ts-ignore
          containerStyle={styles.inputContainer}
        />

        {/* Phone input */}
        <Input
          title="Phone"
          placeholder="XXXXXXXXXX"
          placeholderTextColor={colors.textSecondary}
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          required
          variant="phone"
          countryCode="+91"
          inputType="numeric"
          testID="phone-input"
          editable={false}
          // @ts-ignore
          containerStyle={styles.inputContainer}
        />
      </View>

      {/* Save Changes button */}
      <View style={styles.buttonContainer}>
        <ButtonText
          variant="primary"
          onPress={handleSaveChanges}
          loading={userLoaders['update-user']}>
          Save Changes
        </ButtonText>
      </View>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? '25@vs' : 0,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    flexDirection: 'column',
    gap: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 96,
    marginTop: 'auto', // Push to bottom
    marginBottom: 20,
  },
});

export default EditProfile;
