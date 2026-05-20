// dependencies
import {View} from 'react-native';
import React from 'react';
import {BottomSheetView} from '@gorhom/bottom-sheet';
import {ScaledSheet} from 'react-native-size-matters';

// components
import {ButtonText, Divider, H1, P1} from '@/components';

// utils
import {authUtils} from '../utils';

const WelcomeForm: React.FC = () => {
  return (
    <BottomSheetView>
      <View style={styles.contentContainer}>
        <H1>Welcome!</H1>
        <Divider height={9.6} />
        <P1>Please Sign In to Continue</P1>
        <Divider height={26} />
        <View style={{width: '100%', rowGap: 12}}>
          <ButtonText
            onPress={() => {
              authUtils.setBottomSheetView('new');
            }}
            variant="primary">
            New User
          </ButtonText>
          <ButtonText 
            onPress={() => {
              authUtils.setBottomSheetView('existing');
            }} 
            variant="secondary">
            Already a User
          </ButtonText>
          <ButtonText 
            onPress={() => {
              authUtils.setBottomSheetView('employee');
            }} 
            variant="secondary">
            Employee
          </ButtonText>
        </View>
      </View>
    </BottomSheetView>
  );
};

export default WelcomeForm;

const styles = ScaledSheet.create({
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
