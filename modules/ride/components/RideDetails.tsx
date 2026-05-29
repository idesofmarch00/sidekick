// dependencies
import {Dimensions, View} from 'react-native';
import React, {useMemo} from 'react';
import {moderateScale, ScaledSheet} from 'react-native-size-matters';
import useLocationStore from '@/modules/home/store/locationStore';

// store
import {useGlobalStore, useRideStore} from '@/globalStore';
import {useThemeStore} from '@/theme/store';

// components
import {
  ButtonTextBottomSheet,
  Divider,
  H1,
  // H2,
  H3,
  P1,
} from '@/components';

import {EndRide} from '../components';
import {calculateHubDistance} from '@/modules/home/utilis/distanceUtils';
import {RideService} from '@/globalService';
import rideStorage from '../storage';
import {Ride_Step_Enum} from '@/generated/graphql';

const RideDetails: React.FC = () => {
  const currentRideId = rideStorage.getString('currentRideId');

  const {setModalComponent, openModal} = useGlobalStore();
  const {
    totalCost,
    isPaused,
    secondsElapsed,
    perMinuteRate,
    selectedHub,
    pauseRideTracking,
    resumeRideTracking,
  } = useRideStore();

  const latitude = useLocationStore(state => state.latitude);
  const longitude = useLocationStore(state => state.longitude);
  const {colors} = useThemeStore(state => state.theme);

  // Convert seconds into mm:ss format
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  };

  const distance = useMemo(() => {
    if (!selectedHub) {
      return '0m';
    }
    return calculateHubDistance(latitude, longitude, selectedHub);
  }, [latitude, longitude, selectedHub]);

  const endRide = () => {
    setModalComponent(EndRide);
    openModal();
  };

  return (
    <View style={{height: '100%'}}>
      {/* {selectedHub && (
        <View style={styles.targetHubWrapper}>
          <View style={[styles.targetHubContainer, {backgroundColor: colors.white, borderColor: colors.highlight}]}>
            <H2 textColor="highlight">
              {selectedHub.name || 'No Hub Selected'}
            </H2>
            <H2 textColor="highlight">{distance}</H2>
          </View>
        </View>
      )} */}
      <Divider height={9} />
      <View style={[styles.rideDetailsContainer, {backgroundColor: colors.white, borderColor: colors.lightGray}]}>
        <View style={[styles.handle, {backgroundColor: colors.textSecondary}]} />
        <Divider height={16} />
        <View style={{alignItems: 'center'}}>
          <H1>{formatTime(secondsElapsed)}</H1>
          <P1>{distance}</P1>
        </View>
        <Divider height={16} />
        <View style={{paddingHorizontal: moderateScale(18)}}>
          <View style={styles.ridingMetricsFlexContainer}>
            <H3 textColor="textSecondary">Riding Cost</H3>
            <H3 textColor="textSecondary">₹ {perMinuteRate}/Minute</H3>
          </View>
          <Divider height={4} />
          <View style={styles.ridingMetricsFlexContainer}>
            <H3 textColor="textSecondary">Total</H3>
            <H3 textColor="textSecondary">₹ {totalCost}</H3>
          </View>

          <Divider height={16} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <ButtonTextBottomSheet
              variant="alert"
              onPress={endRide}
              customStyle={{width: 170}}>
              End Ride
            </ButtonTextBottomSheet>
            {isPaused ? (
              <ButtonTextBottomSheet
                variant="primary"
                onPress={() => {
                  resumeRideTracking();
                }}
                customStyle={{width: 170}}>
                Resume Ride
              </ButtonTextBottomSheet>
            ) : (
              <ButtonTextBottomSheet
                variant="primary"
                onPress={() => {
                  pauseRideTracking();
                }}
                customStyle={{width: 170}}>
                Pause Ride
              </ButtonTextBottomSheet>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideDetails;

const styles = ScaledSheet.create({
  targetHubWrapper: {
    paddingHorizontal: '10@s',
  },

  targetHubContainer: {
    paddingVertical: '14@vs',
    paddingHorizontal: '18@vs',
    borderWidth: 1,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  handle: {
    alignSelf: 'center',
    height: '3.4@vs',
    width: '70@s',
  },

  rideDetailsContainer: {
    height: Dimensions.get('screen').height,
    borderRadius: 16,
    paddingTop: '16@vs',
    borderWidth: 1,
  },

  ridingMetricsFlexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
