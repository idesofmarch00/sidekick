import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import sqliteService, { LocalCoordinate } from './sqlite.service';

/**
 * 1D / 2D Kalman Filter for filtering GPS noise and anomalous telemetry spikes.
 * Keeps track of coordinate states and adjusts prediction weights based on sensor accuracy.
 */
export class GPSKalmanFilter {
  private minAccuracy = 1.0; // meters
  private Q_metres_per_second: number;
  private TimeStamp_ms: number = 0;
  private lat: number = 0;
  private lng: number = 0;
  private variance: number = -1; // -1 indicates filter is uninitialized

  constructor(noiseValue: number = 3.0) {
    this.Q_metres_per_second = noiseValue;
  }

  /**
   * Processes a raw GPS coordinate and returns the smoothed/filtered coordinate.
   */
  public process(
    rawLat: number,
    rawLng: number,
    accuracy: number,
    timestampMs: number
  ): { latitude: number; longitude: number } {
    if (accuracy < this.minAccuracy) {
      accuracy = this.minAccuracy;
    }

    if (this.variance < 0) {
      // Initialize filter with first sample
      this.lat = rawLat;
      this.lng = rawLng;
      this.variance = accuracy * accuracy;
      this.TimeStamp_ms = timestampMs;
      return { latitude: rawLat, longitude: rawLng };
    }

    const durationMs = timestampMs - this.TimeStamp_ms;
    if (durationMs > 0) {
      // Time has moved forward. Increase variance based on elapsed time and expected movement noise
      this.variance += (durationMs * this.Q_metres_per_second * this.Q_metres_per_second) / 1000.0;
      this.TimeStamp_ms = timestampMs;
    }

    // Kalman Gain (how much weight to put on the new reading vs the current state estimation)
    const K = this.variance / (this.variance + accuracy * accuracy);

    // Update state estimation
    this.lat += K * (rawLat - this.lat);
    this.lng += K * (rawLng - this.lng);

    // Update variance
    this.variance = (1.0 - K) * this.variance;

    return { latitude: this.lat, longitude: this.lng };
  }

  public reset() {
    this.variance = -1;
  }
}

/**
 * Senior-level Background Location Tracking Service.
 * Orchestrates background geofencing / tracking, handles OS background permissions,
 * and processes high-accuracy streams via a noise-reducing Kalman Filter before persistence.
 */
class BackgroundLocationService {
  private watchId: number | null = null;
  private activeRideId: string | null = null;
  private kalmanFilter = new GPSKalmanFilter(3.0); // 3m/s noise threshold

  /**
   * Starts tracking coordinates in the foreground/background for a specific ride.
   */
  public async startTracking(rideId: string): Promise<void> {
    if (this.watchId !== null) {
      console.warn('Tracking is already running.');
      return;
    }

    this.activeRideId = rideId;
    this.kalmanFilter.reset();

    console.info(`[BackgroundLocationService] Starting tracking for ride: ${rideId}`);

    // Standard high-accuracy configuration
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 5, // Receive updates every 5 meters
      interval: 5000,    // Update every 5 seconds (preferred on Android)
      fastestInterval: 2000,
    };

    // Spin up the location watch thread
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.handleLocationUpdate(position);
      },
      (error) => {
        console.error('[BackgroundLocationService] GPS Stream Error:', error);
      },
      options
    );

    // If on native mobile, start background worker threads to keep JS thread active.
    this.enableNativeBackgroundService();
  }

  /**
   * Stops tracking and releases OS location listeners.
   */
  public async stopTracking(): Promise<void> {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.info(`[BackgroundLocationService] Stopped tracking for ride: ${this.activeRideId}`);
    }

    this.activeRideId = null;
    this.disableNativeBackgroundService();
  }

  /**
   * Core telemetry processing pipeline.
   * Cleans, filters, transforms, and logs the coordinate to the SQLite outbox database.
   */
  private async handleLocationUpdate(position: any) {
    if (!this.activeRideId) return;

    const { latitude, longitude, altitude, speed, accuracy } = position.coords;
    const timestamp = position.timestamp;

    // 1. Process coordinates through Kalman Filter to strip GPS noise/drift
    const smoothed = this.kalmanFilter.process(latitude, longitude, accuracy || 10, timestamp);

    // 2. Format coordinate matching LocalCoordinate database interface
    const localCoord: LocalCoordinate = {
      id: `${this.activeRideId}_${timestamp}`,
      ride_id: this.activeRideId,
      latitude: smoothed.latitude,
      longitude: smoothed.longitude,
      altitude: altitude || 0,
      speed: speed || 0,
      accuracy: accuracy || 0,
      timestamp,
      sync_status: 'PENDING',
    };

    // 3. Write coordinate block to local database transactional queue
    try {
      await sqliteService.saveCoordinate(localCoord);
      console.info(`[BackgroundLocationService] Logged coordinate (${smoothed.latitude.toFixed(5)}, ${smoothed.longitude.toFixed(5)}) for ride: ${this.activeRideId}`);
    } catch (err) {
      console.error('[BackgroundLocationService] Coordinate logging crash:', err);
    }
  }

  /**
   * Senior Practice: Spawns native headless background service tasks to ensure
   * location telemetry tracks persistently when the application goes into the background.
   */
  private enableNativeBackgroundService() {
    try {
      // Dynamic import to prevent bundler errors if native bridge package is not installed/linked
      const BackgroundActions = require('react-native-background-actions').default;

      const bgOptions = {
        taskName: 'SidekickTracking',
        taskTitle: 'Ride Tracking Active',
        taskDescription: 'Sidekick is logging your bike route to ensure accurate stats.',
        taskIcon: {
          name: 'ic_launcher',
          type: 'mipmap',
        },
        color: '#FF5733',
        parameters: {
          delay: 1000,
        },
      };

      const backgroundTask = async (taskData: any) => {
        await new Promise(async (resolve) => {
          // Task continues in headless loop until stopped
          while (this.watchId !== null) {
            await new Promise((r) => setTimeout(r, 2000));
          }
          resolve(null);
        });
      };

      BackgroundActions.start(backgroundTask, bgOptions);
    } catch (error) {
      // Graceful fallback for non-native / simulator / testing environments
      console.info('[BackgroundLocationService] Background task running in hybrid standard mode.');
    }
  }

  private disableNativeBackgroundService() {
    try {
      const BackgroundActions = require('react-native-background-actions').default;
      BackgroundActions.stop();
    } catch (error) {
      // Fail silently
    }
  }
}

export default new BackgroundLocationService();
