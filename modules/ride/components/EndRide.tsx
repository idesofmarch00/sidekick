// dependencies
import {Dimensions, FlatList, Pressable, View} from 'react-native';
import React, {useMemo} from 'react';
import {ScaledSheet} from 'react-native-size-matters';

// components
import {ReachedHub} from '../components';
import {ButtonText, Divider, H2, H3, P2} from '@/components';

// store
import {useGlobalStore, useRideStore} from '@/globalStore';
import {useThemeStore} from '@/theme/store';
import useLocationStore from '@/modules/home/store/locationStore';
import {sortHubsByDistance} from '@/modules/home/utilis/distanceUtils';
import {FetchAllHubsQuery} from '@/generated/graphql';

const NearestHubCard: React.FC<NearestHubCardProps> = ({
  hub,
  selectedHub,
  setSelectedHub,
}) => {
  const {colors} = useThemeStore(state => state.theme);
  return (
    <Pressable
      onPress={() => setSelectedHub(hub)}
      style={[
        styles.nearestCardContainer,
        {
          borderWidth: selectedHub?.id === hub.id ? 2 : 0,
          borderColor: colors.primary,
        },
      ]}>
      <H3>{hub.name}</H3>
      <H3 textColor="highlight">{hub.distance}</H3>
    </Pressable>
  );
};

const EndRide: React.FC = () => {
  const {selectedHub, setSelectedHub, hubs} = useRideStore();
  const {latitude, longitude} = useLocationStore();
  const {closeModal, setModalComponent} = useGlobalStore();
  const {setIsPaused} = useRideStore();
  const {colors} = useThemeStore(state => state.theme);

  const sortedHubs = useMemo(() => {
    if (!latitude || !longitude || !hubs.length) {
      return [];
    }
    return sortHubsByDistance(latitude, longitude, hubs);
  }, [latitude, longitude, hubs]);

  const nearestDistance = sortedHubs[0]?.distance;

  return (
    <View style={[styles.endRideWrapper, {backgroundColor: colors.white}]}>
      <View>
        <H2 customStyles={{textAlign: 'center'}}>
          Nearest Hub is {nearestDistance} away!
        </H2>
        <P2 customStyles={{textAlign: 'center'}} textColor="textSecondary">
          Please select the nearest hub to continue.
        </P2>
      </View>
      <Divider height={16} />
      <View style={{maxHeight: Dimensions.get('window').height * 0.25}}>
        <FlatList
          data={sortedHubs}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <NearestHubCard
              hub={item}
              selectedHub={selectedHub}
              setSelectedHub={setSelectedHub}
            />
          )}
          keyExtractor={item => item.id}
        />
      </View>
      <Divider height={16} />
      <View style={styles.actionButtonContainer}>
        <ButtonText
          variant="primary"
          onPress={() => {
            setIsPaused(false);
            closeModal();
          }}>
          Resume Ride
        </ButtonText>
        <ButtonText
          variant="error"
          onPress={() => setModalComponent(ReachedHub)}>
          End Ride
        </ButtonText>
      </View>
    </View>
  );
};

export default EndRide;

const styles = ScaledSheet.create({
  endRideWrapper: {
    paddingTop: '41.6@vs',
    width: '100%',
  },
  nearestCardContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18@ms',
    borderRadius: 20,
  },
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
    rowGap: 12,
    paddingHorizontal: '18@ms',
  },
});
