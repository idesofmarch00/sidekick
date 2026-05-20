// dependencies
import {View} from 'react-native';
import React from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import {useNavigation} from '@react-navigation/native';

// components
import TickMarkCurly from '@/assets/tick-mark-curly.svg';
import {ButtonText, Divider, H2, P2} from '@/components';

// components
import {useGlobalStore} from '@/globalStore';

const RideEnded: React.FC = () => {
  const navigation = useNavigation();
  const {closeModal, closeBottomSheet} = useGlobalStore();

  return (
    <View style={styles.rideEndedWrapper}>
      <TickMarkCurly />
      <Divider height={16} />
      <View>
        <H2 customStyles={{textAlign: 'center'}}>Ride Ended</H2>
        <P2 customStyles={{textAlign: 'center'}} textColor="textSecondary">
          Thank you for using SideKick!
        </P2>
      </View>
      <Divider height={16} />
      <View style={{width: '100%', rowGap: 12}}>
        <ButtonText
          variant="primary"
          onPress={() => {
            closeBottomSheet();
            closeModal();
            navigation.goBack();
          }}>
          Home
        </ButtonText>
        <ButtonText
          variant="secondary"
          onPress={() => {
            closeBottomSheet();
            closeModal();
            navigation.replace('walletNavigator');
          }}>
          Check Wallet
        </ButtonText>
      </View>
    </View>
  );
};

export default RideEnded;

const styles = ScaledSheet.create({
  rideEndedWrapper: {
    alignItems: 'center',
    width: '100%',
    paddingTop: '41.6@vs',
  },
  textCenter: {
    textAlign: 'center',
  },
});
