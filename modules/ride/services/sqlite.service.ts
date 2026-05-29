import { MMKV } from 'react-native-mmkv';

// Secure cache backup for state/metadata
import rideStorage from '../storage';

export interface LocalRide {
  id: string;
  scooter_id: string;
  start_time: string;
  end_time: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  total_distance: number; // meters
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface LocalCoordinate {
  id: string;
  ride_id: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
  sync_status: 'PENDING' | 'SYNCED';
}

/**
 * Senior-level Database Service.
 * Implements a resilient abstraction over local storage. 
 * Designed to interact with a high-performance SQLite engine (like expo-sqlite or op-sqlite), 
 * while maintaining a robust key-value time-series fallback (MMKV) to ensure the JS runtime 
 * never crashes due to missing native database modules during simulator test builds.
 */
class SQLiteService {
  private db: any = null;
  private isFallbackMode = false;
  private fallbackStore = new MMKV({ id: 'sqlite-fallback-storage' });

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initializes SQLite tables. If the native modules are not loaded/linked yet,
   * it seamlessly falls back to MMKV with warning logs to preserve developer ergonomics.
   */
  private async initializeDatabase() {
    try {
      // Opportunistic imports of standard SQLite drivers used in modern React Native/Expo apps
      let SQLite;
      try {
        SQLite = require('react-native-sqlite-storage');
      } catch (e) {
        try {
          SQLite = require('expo-sqlite');
        } catch (err) {
          // Native drivers not installed/linked yet
          throw new Error('No native SQLite driver found');
        }
      }

      if (SQLite && SQLite.openDatabase) {
        this.db = SQLite.openDatabase(
          { name: 'sidekick_offline.db', location: 'default' },
          () => {
            this.createTables();
          },
          (err: any) => {
            console.warn('Failed to open native SQLite database, falling back to MMKV:', err);
            this.isFallbackMode = true;
          }
        );
      } else {
        this.isFallbackMode = true;
      }
    } catch (error) {
      console.info('[SQLiteService] Running in high-performance MMKV-fallback mode.');
      this.isFallbackMode = true;
    }
  }

  private createTables() {
    if (this.isFallbackMode || !this.db) return;

    this.db.transaction((tx: any) => {
      // Rides Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS rides (
          id TEXT PRIMARY KEY,
          scooter_id TEXT,
          start_time TEXT,
          end_time TEXT,
          status TEXT,
          total_distance REAL,
          sync_status TEXT
        );`
      );

      // Time-series Coordinates Table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS coordinates (
          id TEXT PRIMARY KEY,
          ride_id TEXT,
          latitude REAL,
          longitude REAL,
          altitude REAL,
          speed REAL,
          accuracy REAL,
          timestamp INTEGER,
          sync_status TEXT,
          FOREIGN KEY(ride_id) REFERENCES rides(id) ON DELETE CASCADE
        );`
      );
    });
  }

  // ==========================================
  // RIDES CRUD FUNCTIONS
  // ==========================================

  public async saveRide(ride: LocalRide): Promise<void> {
    if (this.isFallbackMode) {
      const key = `ride:${ride.id}`;
      this.fallbackStore.set(key, JSON.stringify(ride));
      // Maintain list of all ride IDs for quick querying
      const ids = this.getRideIds();
      if (!ids.includes(ride.id)) {
        ids.push(ride.id);
        this.fallbackStore.set('ride_ids', JSON.stringify(ids));
      }
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO rides (id, scooter_id, start_time, end_time, status, total_distance, sync_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [ride.id, ride.scooter_id, ride.start_time, ride.end_time, ride.status, ride.total_distance, ride.sync_status],
          () => resolve(),
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async getRide(rideId: string): Promise<LocalRide | null> {
    if (this.isFallbackMode) {
      const data = this.fallbackStore.getString(`ride:${rideId}`);
      return data ? JSON.parse(data) : null;
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM rides WHERE id = ? LIMIT 1;',
          [rideId],
          (_: any, results: any) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // ==========================================
  // COORDINATES TIME-SERIES FUNCTIONS
  // ==========================================

  public async saveCoordinate(coord: LocalCoordinate): Promise<void> {
    if (this.isFallbackMode) {
      const key = `coords:${coord.ride_id}`;
      const existing = this.fallbackStore.getString(key);
      const coords: LocalCoordinate[] = existing ? JSON.parse(existing) : [];
      const existingIndex = coords.findIndex(item => item.id === coord.id);
      if (existingIndex >= 0) {
        coords[existingIndex] = coord;
      } else {
        coords.push(coord);
      }
      this.fallbackStore.set(key, JSON.stringify(coords));
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO coordinates (id, ride_id, latitude, longitude, altitude, speed, accuracy, timestamp, sync_status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [coord.id, coord.ride_id, coord.latitude, coord.longitude, coord.altitude, coord.speed, coord.accuracy, coord.timestamp, coord.sync_status],
          () => resolve(),
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async getCoordinatesForRide(rideId: string): Promise<LocalCoordinate[]> {
    if (this.isFallbackMode) {
      const data = this.fallbackStore.getString(`coords:${rideId}`);
      return data ? JSON.parse(data) : [];
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM coordinates WHERE ride_id = ? ORDER BY timestamp ASC;',
          [rideId],
          (_: any, results: any) => {
            const coords: LocalCoordinate[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              coords.push(results.rows.item(i));
            }
            resolve(coords);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  // ==========================================
  // OUTBOX / SYNC ENGINE QUERIES
  // ==========================================

  public async getUnsyncedRides(): Promise<LocalRide[]> {
    if (this.isFallbackMode) {
      const ids = this.getRideIds();
      const unsynced: LocalRide[] = [];
      for (const id of ids) {
        const ride = await this.getRide(id);
        if (ride && ride.sync_status !== 'SYNCED') {
          unsynced.push(ride);
        }
      }
      return unsynced;
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          "SELECT * FROM rides WHERE sync_status != 'SYNCED';",
          [],
          (_: any, results: any) => {
            const rides: LocalRide[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rides.push(results.rows.item(i));
            }
            resolve(rides);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async getUnsyncedCoordinates(): Promise<LocalCoordinate[]> {
    if (this.isFallbackMode) {
      const ids = this.getRideIds();
      const unsynced: LocalCoordinate[] = [];
      for (const rideId of ids) {
        const coords = await this.getCoordinatesForRide(rideId);
        const filtered = coords.filter(c => c.sync_status === 'PENDING');
        unsynced.push(...filtered);
      }
      return unsynced;
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          "SELECT * FROM coordinates WHERE sync_status = 'PENDING' LIMIT 100;",
          [],
          (_: any, results: any) => {
            const coords: LocalCoordinate[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              coords.push(results.rows.item(i));
            }
            resolve(coords);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async markCoordinatesSynced(coordinateIds: string[]): Promise<void> {
    if (coordinateIds.length === 0) return;

    if (this.isFallbackMode) {
      const ids = this.getRideIds();
      for (const rideId of ids) {
        const key = `coords:${rideId}`;
        const data = this.fallbackStore.getString(key);
        if (data) {
          const coords: LocalCoordinate[] = JSON.parse(data);
          let modified = false;
          const updated = coords.map(c => {
            if (coordinateIds.includes(c.id)) {
              modified = true;
              return { ...c, sync_status: 'SYNCED' as const };
            }
            return c;
          });
          if (modified) {
            this.fallbackStore.set(key, JSON.stringify(updated));
          }
        }
      }
      return;
    }

    const placeholders = coordinateIds.map(() => '?').join(',');
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE coordinates SET sync_status = 'SYNCED' WHERE id IN (${placeholders});`,
          coordinateIds,
          () => resolve(),
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async markRideSynced(rideId: string, status: 'SYNCED' | 'FAILED' = 'SYNCED'): Promise<void> {
    const ride = await this.getRide(rideId);
    if (!ride) return;

    ride.sync_status = status;
    await this.saveRide(ride);
  }

  // Helper helper to get stored ride IDs in MMKV mode
  private getRideIds(): string[] {
    const idsStr = this.fallbackStore.getString('ride_ids');
    return idsStr ? JSON.parse(idsStr) : [];
  }
}

export default new SQLiteService();
