// dependencies
import {View} from 'react-native';
import React from 'react';
import {ScaledSheet} from 'react-native-size-matters';
import SwipeButton from 'rn-swipe-button';
import {DateTime} from 'luxon';

// components
import TickMarkRounded from '@/assets/tick-mark-rounded.svg';
import {Divider, H2, H3, P2} from '@/components';
import SwipeBtn from '@/assets/swipe-btn-img.svg';
import RideEnded from '../components/RideEnded';

// store
import {useGlobalStore, useRideStore} from '@/globalStore';
import {useThemeStore} from '@/theme/store';
import {RideService, WalletService} from '@/globalService';
import rideStorage from '../storage';
import {Ride_Step_Enum} from '@/generated/graphql';

const ReachedHub: React.FC = () => {
  const {setModalComponent, setModalCloseButton} = useGlobalStore();
  const {
    interval,
    setTimerInterval,
    setIsPaused,
    setSelectedHub,
    totalCost,
    secondsElapsed,
    terminateRideTracking,
  } = useRideStore();
  const {colors} = useThemeStore(state => state.theme);

  const onSwipeSuccess = async () => {
    setIsPaused(true);
    if (interval) {
      clearInterval(interval);
      setTimerInterval(null);
    }
    await endRide();
    setSelectedHub(undefined);
    setModalComponent(RideEnded);
    setModalCloseButton(null);
  };

  const endRide = async () => {
    try {
      // Trigger senior background GPS worker finalizer and sync flush
      await terminateRideTracking(0);

      await deductMoneyFromWallet();

      await WalletService.fetchUserWallet();
    } catch (error) {
      console.log('Error ending ride', error);
    }
  };

  const deductMoneyFromWallet = async () => {
    const userWallet = await WalletService.fetchUserWallet();
    try {
      if (!userWallet) {
        throw new Error('User wallet not found.');
      }

      const availableWalletBalance = userWallet.balance;
      const securityBalance = userWallet.security_deposit;

      if (availableWalletBalance >= totalCost) {
        // Case 1: Wallet has enough balance, deduct from wallet only
        await WalletService.deductBalanceFromWallet({
          id: userWallet.id,
          balance: -totalCost, // Pass negative value to deduct
        });
      } else {
        // Case 2: Wallet doesn't have enough, use full wallet and take the rest from security
        const remainingCost = totalCost - availableWalletBalance;

        if (remainingCost > securityBalance) {
          console.error('Insufficient funds in wallet and security deposit.');
          throw new Error('Insufficient balance.');
        }

        // Step 1: Deduct full wallet balance
        await WalletService.deductBalanceFromWallet({
          id: userWallet.id,
          balance: -availableWalletBalance, // Pass negative value to deduct full wallet
        });

        // Step 2: Deduct remaining cost from security deposit
        await WalletService.deductBalanceFromSecurity({
          id: userWallet.id,
          security_deposit: -remainingCost, // Pass negative value to deduct
        });
      }

      return {success: true, message: 'Ride cost deducted successfully.'};
    } catch (error) {
      console.error('Error in deducting ride cost:', error);
      return error;
    }
  };

  // Convert seconds into mm:ss format
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <View style={[styles.reachedHubWrapper, {backgroundColor: colors.white}]}>
      <View style={styles.headingContainer}>
        <TickMarkRounded />
        <H2 customStyles={{textAlign: 'center'}}>Reached Destination</H2>
      </View>
      <Divider height={6} />
      <P2 textColor="textSecondary" customStyles={{textAlign: 'center'}}>
        A small fee will be levied for parking the scooter away from the hub
      </P2>
      <Divider height={28} />
      <View style={styles.detailsContainer}>
        <View>
          <H3>{formatTime(secondsElapsed)} Minutes</H3>
        </View>
        <H3 textColor="highlight">₹ {totalCost.toFixed(1)}</H3>
      </View>
      <Divider height={6} />
      <View style={styles.detailsContainer}>
        <View>
          <H3>Parking Fee</H3>
        </View>
        <H3 textColor="error">₹ 10.0</H3>
      </View>
      <Divider height={28} />
      <SwipeButton
        height={60}
        width={288}
        thumbIconBackgroundColor="red"
        railFillBorderColor="transparent"
        thumbIconBorderColor="#fff"
        railBackgroundColor={colors.redFade}
        enableReverseSwipe={false}
        onSwipeSuccess={onSwipeSuccess}
        swipeSuccessThreshold={70}
        railBorderColor="white"
        thumbIconComponent={ThumbIconButton}
        title=""
        railFillBackgroundColor="transparent"
      />
    </View>
  );
};

export default ReachedHub;

const ThumbIconButton = () => <SwipeBtn />;

const styles = ScaledSheet.create({
  reachedHubWrapper: {
    padding: '18@ms',
    paddingTop: '41.6@vs',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    justifyContent: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
