// dependencies
import {create} from 'zustand';
import {CameraDevice} from 'react-native-vision-camera';

// utils
import createSelectors from '@/utils/selectors';

// types
import {FetchAllHubsQuery, FetchCompletedRidesQuery} from '@/generated/graphql';

// const {height} = Dimensions.get('window');

// type LoaderType =
//   | 'loading-user'
//   | 'phone-verification'
//   | 'user-login'
//   | 'profile-update'
//   | 'auth-confirmation';

import sqliteService, { LocalRide } from '../services/sqlite.service';
import backgroundLocationService from '../services/backgroundLocation.service';
import syncService from '../services/sync.service';
import rideStorage from '../storage';

type RideStore = {
  hubs: FetchAllHubsQuery['hubs'];
  interval: NodeJS.Timeout | null;
  totalCost: number;
  isPaused: boolean;
  secondsElapsed: number;
  perMinuteRate: number;
  selectedHub: FetchAllHubsQuery['hubs'][0] | undefined;

  // ride tracking state
  isTracking: boolean;
  startTimeEpoch: number | null;
  liveRoutePoints: { latitude: number; longitude: number }[];

  // ride history
  completedRides: FetchCompletedRidesQuery['ride_details'];

  // camera
  device: CameraDevice | null | undefined;

  // ride history
  rideHistory: FetchCompletedRidesQuery['ride_details'];
};

type RideActions = {
  setHubs: (allHubs: FetchAllHubsQuery['hubs']) => void;
  setTimerInterval: (timeoutInterval: NodeJS.Timeout | null) => void;
  setTotalCost: (cost: number) => void;
  setIsPaused: (pauseState: boolean) => void;
  setSecondsElapsed: (updater: any) => void;
  setSelectedHub: (hub: FetchAllHubsQuery['hubs'][0] | undefined) => void;

  // Tracking operations
  initiateRideTracking: (scooterId: string) => Promise<string>;
  pauseRideTracking: () => Promise<void>;
  resumeRideTracking: () => Promise<void>;
  terminateRideTracking: (totalDistance?: number) => Promise<void>;
  addLivePoint: (latitude: number, longitude: number) => void;
  syncLivePath: () => Promise<void>;

  // ride history
  setCompletedRides: (rides: FetchCompletedRidesQuery['ride_details']) => void;

  //camera
  setDevice: (camera: CameraDevice | null | undefined) => void;

  // ride history
  setRideHistory: (rides: FetchCompletedRidesQuery['ride_details']) => void;
  resetRideStore: () => void;
};

// Separate state from actions
const rideInitialState: RideStore = {
  hubs: [],
  interval: null,
  totalCost: 0,
  isPaused: false,
  secondsElapsed: 0,
  perMinuteRate: 2,
  selectedHub: undefined,

  // tracking
  isTracking: false,
  startTimeEpoch: null,
  liveRoutePoints: [],

  // ride history
  completedRides: [],

  // camera
  device: null,

  // ride history
  rideHistory: [],
};

const rideStore = create<RideStore & RideActions>((set, get) => ({
  ...rideInitialState,

  setHubs: allHubs =>
    set({
      hubs: allHubs,
    }),

  setTimerInterval: timeoutInterval =>
    set({
      interval: timeoutInterval,
    }),

  setTotalCost: cost =>
    set({
      totalCost: cost,
    }),

  setIsPaused: pausedState =>
    set({
      isPaused: pausedState,
    }),

  setSecondsElapsed: updater =>
    set(state => ({
      secondsElapsed:
        typeof updater === 'function' ? updater(state.secondsElapsed) : updater,
    })),

  setSelectedHub: hub =>
    set({
      selectedHub: hub,
    }),

  // ==========================================
  // SENIOR-LEVEL TRACKING INTEGRATION
  // ==========================================

  initiateRideTracking: async (scooterId) => {
    const rideId = `ride_${Date.now()}`;
    const startTimeStr = new Date().toISOString();
    const startEpoch = Date.now();

    const localRide: LocalRide = {
      id: rideId,
      scooter_id: scooterId,
      start_time: startTimeStr,
      end_time: null,
      status: 'ACTIVE',
      total_distance: 0,
      sync_status: 'PENDING',
    };

    // 1. Persist new Ride in offline SQLite storage
    await sqliteService.saveRide(localRide);
    
    // 2. Set runtime caching variables (MMKV)
    rideStorage.set('currentRideId', rideId);
    rideStorage.set('currentRideStartEpoch', startEpoch);

    // 3. Initiate native Background Location Services
    await backgroundLocationService.startTracking(rideId);

    // 4. Update Zustand state
    set({
      isTracking: true,
      startTimeEpoch: startEpoch,
      secondsElapsed: 0,
      totalCost: 0,
      isPaused: false,
      liveRoutePoints: [],
    });

    // 5. Opportunistically trigger outbox sync worker
    syncService.triggerImmediateSync();

    return rideId;
  },

  pauseRideTracking: async () => {
    const rideId = rideStorage.getString('currentRideId');
    if (!rideId) return;

    const ride = await sqliteService.getRide(rideId);
    if (ride) {
      ride.status = 'PAUSED';
      await sqliteService.saveRide(ride);
    }

    set({ isPaused: true });
    
    // Trigger sync to register pause state on Hasura DB
    syncService.triggerImmediateSync();
  },

  resumeRideTracking: async () => {
    const rideId = rideStorage.getString('currentRideId');
    if (!rideId) return;

    const ride = await sqliteService.getRide(rideId);
    if (ride) {
      ride.status = 'ACTIVE';
      await sqliteService.saveRide(ride);
    }

    set({ isPaused: false });
    
    // Trigger sync to register resume state on Hasura DB
    syncService.triggerImmediateSync();
  },

  terminateRideTracking: async (totalDistance = 0) => {
    const rideId = rideStorage.getString('currentRideId');
    if (!rideId) return;

    // 1. Stop background GPS streams and workers
    await backgroundLocationService.stopTracking();

    // 2. Update SQLite records to COMPLETED
    const ride = await sqliteService.getRide(rideId);
    if (ride) {
      ride.status = 'COMPLETED';
      ride.end_time = new Date().toISOString();
      ride.total_distance = totalDistance;
      await sqliteService.saveRide(ride);
    }

    // 3. Clear MMKV caches
    rideStorage.delete('currentRideId');
    rideStorage.delete('currentRideStartEpoch');

    // 4. Reset state
    set({
      isTracking: false,
      startTimeEpoch: null,
      isPaused: false,
    });

    // 5. Instantly flush outbox to Hasura backend
    syncService.triggerImmediateSync();
  },

  addLivePoint: (latitude, longitude) => {
    set(state => ({
      liveRoutePoints: [...state.liveRoutePoints, { latitude, longitude }],
    }));
  },

  syncLivePath: async () => {
    const rideId = rideStorage.getString('currentRideId');
    if (!rideId) return;

    const coords = await sqliteService.getCoordinatesForRide(rideId);
    const pts = coords.map(c => ({ latitude: c.latitude, longitude: c.longitude }));
    
    set({ liveRoutePoints: pts });
  },

  // ==========================================
  // HISTORY & UTILS
  // ==========================================

  setCompletedRides: rides =>
    set({
      completedRides: rides,
    }),

  setDevice: camera =>
    set({
      device: camera,
    }),

  setRideHistory: rides =>
    set({
      rideHistory: rides,
    }),

  resetRideStore: () => set(rideInitialState),
}));

export default createSelectors(rideStore);
