// dependencies
import React from 'react';
import {View, StyleSheet, Image} from 'react-native';

// store
import {useThemeStore, useWalletStore} from '@/globalStore';

// components
import {H1, P1, Divider} from '@/components';
import {showCredits} from '@/utils/user';

interface WalletCardProps {
  testID?: string;
}

const {colors} = useThemeStore.getState().theme;

type CurrencyProps = {
  balance: string | number;
};

const CurrencyComponent: React.FC<CurrencyProps> = ({balance}) => {
  if (showCredits()) {
    return <H1>{balance} Credits</H1>;
  } else {
    return <H1>₹{balance}</H1>;
  }
};

const WalletCard: React.FC<WalletCardProps> = ({testID = 'wallet-card'}) => {
  const {userWallet} = useWalletStore();

  return (
    <View style={[styles.container]} testID={testID}>
      <Image
        source={require('../assets/wallet-texture.png')}
        style={styles.backgroundImage}
      />
      <P1 textColor="textSecondary">Current Balance</P1>
      <Divider height={6} />
      <CurrencyComponent balance={userWallet?.balance.toFixed(1)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    height: '30%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderColor: colors.highlight,
    backgroundColor: colors.lightGray,
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    resizeMode: 'cover', // Ensures image covers width/height without stretching
  },
});

export default WalletCard;
