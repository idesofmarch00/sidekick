import sqliteService from './sqlite.service';
import { callMutation } from '@/utils/client';
import { gql } from 'urql';

// Fallback GraphQL documents for sync - can be adapted to exact schema
const SYNC_RIDE_MUTATION = gql`
  mutation SyncLocalRide($id: uuid!, $scooter_id: String!, $start_time: timestamptz!, $end_time: timestamptz, $status: String!, $total_distance: numeric!) {
    insert_ride_details_one(
      object: {
        id: $id,
        scooter_id: $scooter_id,
        start_time: $start_time,
        end_time: $end_time,
        status: $status,
        total_distance: $total_distance
      },
      on_conflict: {
        constraint: ride_details_pkey,
        update_columns: [status, end_time, total_distance]
      }
    ) {
      id
      status
    }
  }
`;

const BATCH_INSERT_COORDINATES_MUTATION = gql`
  mutation SyncCoordinatesBatch($objects: [ride_coordinates_insert_input!]!) {
    insert_ride_coordinates(
      objects: $objects,
      on_conflict: {
        constraint: ride_coordinates_pkey,
        update_columns: [sync_status]
      }
    ) {
      affected_rows
    }
  }
`;

/**
 * Resilient Outbox Synchronization Engine.
 * Monitored by the main application lifecycle, it manages queue flushes 
 * using an Outbox pattern when internet access is confirmed.
 * Features: Batch inserts (prevents HTTP congestion), Exponential Backoff.
 */
class SyncService {
  private isSyncing = false;
  private isOnline = true;
  private syncTimer: NodeJS.Timeout | null = null;
  private retryDelayMs = 2000; // Base delay: 2 seconds
  private maxRetryDelayMs = 60000; // Max delay: 1 minute

  constructor() {
    this.setupNetworkListener();
  }

  /**
   * Dynamically attaches network status event handlers.
   * Leverages NetInfo if available; gracefully falls back to ping polling on exception.
   */
  private setupNetworkListener() {
    try {
      const NetInfo = require('@react-native-community/netinfo');
      NetInfo.addEventListener((state: any) => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable !== false;

        console.info(`[SyncService] Connection state: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);

        if (this.isOnline && wasOffline) {
          // Opportunistic connection restoration trigger
          this.triggerImmediateSync();
        }
      });
    } catch (e) {
      console.info('[SyncService] NetInfo not found. Running in dynamic polling fallback.');
      // Periodic ping fallback for dev-sandboxes/expo wrappers
      setInterval(async () => {
        const prevOnline = this.isOnline;
        this.isOnline = await this.pingGateway();
        if (this.isOnline && !prevOnline) {
          this.triggerImmediateSync();
        }
      }, 15000);
    }
  }

  /**
   * Pings the production endpoint to verify DNS/Internet connectivity.
   */
  private async pingGateway(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      // const response = await fetch('https://supreme-mustang-86.hasura.app/v1/version', {
      const response = await fetch('http://localhost:3000/v1/version', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      return false;
    }
  }

  /**
   * Schedules a sync execution with dynamic backoff retry thresholds.
   */
  public triggerImmediateSync() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(async () => {
      if (!this.isOnline || this.isSyncing) return;
      
      try {
        await this.syncOutbox();
        // Reset delay on successful complete execution
        this.retryDelayMs = 2000;
      } catch (err) {
        console.warn('[SyncService] Sync sequence failed, scaling back:', err);
        // Exponential scaling: double the delay up to max limit
        this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.maxRetryDelayMs);
        this.triggerImmediateSync(); // Re-schedule next retry
      }
    }, 500);
  }

  /**
   * Main synchronization execution chain.
   * Flushes local rides metadata, followed by batch coordinate telemetry.
   */
  private async syncOutbox(): Promise<void> {
    this.isSyncing = true;
    console.info('[SyncService] Running synchronization worker...');

    try {
      // 1. Sync Ride Metadata
      await this.flushRides();

      // 2. Batch Sync Telemetry Coordinates
      await this.flushCoordinates();

      console.info('[SyncService] Synchronization complete. Local Outbox is clear.');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetches pending rides from SQLite outbox and merges updates with remote DB.
   */
  private async flushRides(): Promise<void> {
    const unsyncedRides = await sqliteService.getUnsyncedRides();
    if (unsyncedRides.length === 0) return;

    console.info(`[SyncService] Synchronizing ${unsyncedRides.length} ride headers...`);

    for (const localRide of unsyncedRides) {
      try {
        await callMutation({
          queryDocument: SYNC_RIDE_MUTATION,
          variables: {
            id: localRide.id,
            scooter_id: localRide.scooter_id,
            start_time: localRide.start_time,
            end_time: localRide.end_time,
            status: localRide.status,
            total_distance: localRide.total_distance
          }
        });

        // Update database sync status flags
        await sqliteService.markRideSynced(localRide.id, 'SYNCED');
      } catch (err) {
        console.error(`[SyncService] Failed to sync ride metadata (${localRide.id}):`, err);
        await sqliteService.markRideSynced(localRide.id, 'FAILED');
        throw err; // Stop chain to trigger backoff delay
      }
    }
  }

  /**
   * Fetches unsynced coordinates, batches them in sets of 100, and inserts them
   * using Hasura bulk-insert payloads to conserve client battery and reduce HTTP headers.
   */
  private async flushCoordinates(): Promise<void> {
    const coords = await sqliteService.getUnsyncedCoordinates();
    if (coords.length === 0) return;

    console.info(`[SyncService] Synchronizing ${coords.length} coordinates in batches...`);

    const batchSize = 100;
    for (let i = 0; i < coords.length; i += batchSize) {
      const batch = coords.slice(i, i + batchSize);
      const objects = batch.map(c => ({
        id: c.id,
        ride_id: c.ride_id,
        latitude: c.latitude,
        longitude: c.longitude,
        altitude: c.altitude,
        speed: c.speed,
        accuracy: c.accuracy,
        timestamp: c.timestamp
      }));

      try {
        await callMutation({
          queryDocument: BATCH_INSERT_COORDINATES_MUTATION,
          variables: { objects }
        });

        // Mark local coordinates rows as Synced
        const syncedIds = batch.map(c => c.id);
        await sqliteService.markCoordinatesSynced(syncedIds);
      } catch (err) {
        console.error('[SyncService] Failed to sync coordinates batch:', err);
        throw err; // Retain items for subsequent backoff triggers
      }
    }
  }
}

export default new SyncService();
