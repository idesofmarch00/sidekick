// utils
import {callMutation, callQuery} from '@/utils/client';
import {DateTime, Duration} from 'luxon';

// store
import {useRideStore} from '@/globalStore';

// types
import {
  FetchAllHubsDocument,
  FetchAllHubsQuery,

  // fetch scooter by reg no
  FetchScooterByNumberDocument,
  FetchScooterByNumberQuery,
  FetchScooterByNumberQueryVariables,

  // create ride
  CreateRideDocument,
  CreateRideMutation,
  CreateRideMutationVariables,
  CreateRideStepDocument,
  CreateRideStepMutationVariables,
  CreateRideStepMutation,
  UpdateRideEndTimeDocument,
  UpdateRideEndTimeMutation,
  UpdateRideEndTimeMutationVariables,
  FetchCompletedRidesQueryVariables,
  FetchCompletedRidesQuery,
  FetchCompletedRidesDocument,
} from '@/generated/graphql';

const {setHubs, setRideHistory, setCompletedRides} = useRideStore.getState();

const WalletService = {
  fetchAllHubs: async function () {
    const response: FetchAllHubsQuery = await callQuery({
      queryDocument: FetchAllHubsDocument,
      variables: {},
    });

    setHubs(response.hubs);
    return response.hubs;
  },

  // fetch scooter by ride to check it exists

  fetchScooterByRegNo: async function (
    args: FetchScooterByNumberQueryVariables,
  ) {
    const response: FetchScooterByNumberQuery = await callQuery({
      queryDocument: FetchScooterByNumberDocument,
      variables: args,
    });

    return response.scooters[0];
  },

  startRide: async function (args: CreateRideMutationVariables) {
    const response: CreateRideMutation = await callMutation({
      queryDocument: CreateRideDocument,
      variables: args,
    });

    return response.insert_ride_details_one;
  },

  createRideStep: async function (args: CreateRideStepMutationVariables) {
    const response: CreateRideStepMutation = await callMutation({
      queryDocument: CreateRideStepDocument,
      variables: args,
    });

    return response.insert_ride_steps_one;
  },

  updateRideEndTime: async function (args: UpdateRideEndTimeMutationVariables) {
    const response: UpdateRideEndTimeMutation = await callMutation({
      queryDocument: UpdateRideEndTimeDocument,
      variables: args,
    });

    return response.update_ride_details_by_pk;
  },

  fetchCompletedRides: async function (
    args: FetchCompletedRidesQueryVariables,
  ) {
    const response: FetchCompletedRidesQuery = await callQuery({
      queryDocument: FetchCompletedRidesDocument,
      variables: args,
    });

    setRideHistory(response.ride_details);

    return response;
  },

  endRide: async function (args: UpdateRideEndTimeMutationVariables) {
    const response: UpdateRideEndTimeMutation = await callMutation({
      queryDocument: UpdateRideEndTimeDocument,
      variables: args,
    });

    return response.update_ride_details_by_pk;
  },

  fetchAllCompletedRides: async function (
    args: FetchCompletedRidesQueryVariables,
  ) {
    const response: FetchCompletedRidesQuery = await callQuery({
      queryDocument: FetchCompletedRidesDocument,
      variables: args,
    });

    setCompletedRides(response?.ride_details);

    return response.ride_details;
  },

  getTotalRideDuration: (rides: FetchCompletedRidesQuery['ride_details']) => {
    console.log('rides', rides);
    let totalDuration = Duration.fromMillis(0);

    // return {
    //   totalMilliseconds: totalDuration.toMillis(),
    //   totalSeconds: Math.floor(totalDuration.as('seconds')),
    //   totalMinutes: 3,
    //   // formatted: `${total.minutes} min ${Math.floor(total.seconds)} sec`,
    // };

    rides.forEach(ride => {
      if (ride?.start_time && ride?.end_time) {
        const start = DateTime.fromISO(ride.start_time);
        const end = DateTime.fromISO(ride.end_time);

        const duration = end.diff(start);
        totalDuration = totalDuration.plus(duration);
      }
    });

    // Return formatted duration
    const total = totalDuration.shiftTo('minutes', 'seconds');
    return {
      totalMilliseconds: totalDuration.toMillis(),
      totalSeconds: Math.floor(totalDuration.as('seconds')),
      totalMinutes: Math.floor(totalDuration.as('minutes')),
      formatted: `${total.minutes} min ${Math.floor(total.seconds)} sec`,
    };
  },
};

export default WalletService;
