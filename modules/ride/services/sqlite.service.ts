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
    this.initializeDatabase().then(() => {
      this.seedMockCoordinates();
    });
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

  private async seedMockCoordinates() {
    const keySeeded = 'mock_coords_seeded_v2';
    if (this.fallbackStore.getBoolean(keySeeded)) {
      console.info('[SQLiteService] Mock coordinates already seeded.');
      return;
    }

    console.info('[SQLiteService] Seeding mock DU campus ride telemetry coordinates (v2 — 7 rides)...');

    // Seed Completed Rides list into MMKV fallback so they show up even without full SQLite support
    const rideIds = [
      'ride-morning-commute-1',
      'ride-south-campus-quick-1',
      'ride-cross-campus-long-1',
      'ride-evening-return-1',
      'ride-weekend-explorer-1',
      'ride-quick-errand-1',
      'ride-night-cruise-1'
    ];
    this.fallbackStore.set('ride_ids', JSON.stringify(rideIds));

    // ============================================================
    // Ride 1: Morning Commute (Hub 1 → Hub 2)
    // Vishwavidyalaya Metro → Maurice Nagar → Kamla Nagar
    // 2.1km, 12 min, scooter-1
    // ============================================================
    const ride1: LocalRide = {
      id: 'ride-morning-commute-1',
      scooter_id: 'scooter-1',
      start_time: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000 + 8.25 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000 + 8.25 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 2100,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride1.id}`, JSON.stringify(ride1));

    const t1 = Date.now() - 13 * 24 * 60 * 60 * 1000 + 8.25 * 60 * 60 * 1000;
    const coords1: LocalCoordinate[] = [
      { id: 'c1-01', ride_id: ride1.id, latitude: 28.6974, longitude: 77.2023, altitude: 240, speed: 0, accuracy: 4, timestamp: t1, sync_status: 'SYNCED' },
      { id: 'c1-02', ride_id: ride1.id, latitude: 28.6967, longitude: 77.2018, altitude: 240, speed: 4.2, accuracy: 4, timestamp: t1 + 10000, sync_status: 'SYNCED' },
      { id: 'c1-03', ride_id: ride1.id, latitude: 28.6958, longitude: 77.2010, altitude: 240, speed: 5.8, accuracy: 3, timestamp: t1 + 20000, sync_status: 'SYNCED' },
      { id: 'c1-04', ride_id: ride1.id, latitude: 28.6946, longitude: 77.2003, altitude: 241, speed: 6.1, accuracy: 4, timestamp: t1 + 30000, sync_status: 'SYNCED' },
      { id: 'c1-05', ride_id: ride1.id, latitude: 28.6932, longitude: 77.1997, altitude: 241, speed: 5.5, accuracy: 4, timestamp: t1 + 40000, sync_status: 'SYNCED' },
      { id: 'c1-06', ride_id: ride1.id, latitude: 28.6915, longitude: 77.1994, altitude: 240, speed: 6.3, accuracy: 3, timestamp: t1 + 50000, sync_status: 'SYNCED' },
      { id: 'c1-07', ride_id: ride1.id, latitude: 28.6895, longitude: 77.1996, altitude: 239, speed: 5.9, accuracy: 4, timestamp: t1 + 60000, sync_status: 'SYNCED' },
      { id: 'c1-08', ride_id: ride1.id, latitude: 28.6876, longitude: 77.2000, altitude: 239, speed: 5.2, accuracy: 4, timestamp: t1 + 70000, sync_status: 'SYNCED' },
      { id: 'c1-09', ride_id: ride1.id, latitude: 28.6855, longitude: 77.2006, altitude: 238, speed: 4.8, accuracy: 3, timestamp: t1 + 80000, sync_status: 'SYNCED' },
      { id: 'c1-10', ride_id: ride1.id, latitude: 28.6838, longitude: 77.2011, altitude: 238, speed: 4.3, accuracy: 4, timestamp: t1 + 90000, sync_status: 'SYNCED' },
      { id: 'c1-11', ride_id: ride1.id, latitude: 28.6824, longitude: 77.2014, altitude: 238, speed: 3.5, accuracy: 4, timestamp: t1 + 100000, sync_status: 'SYNCED' },
      { id: 'c1-12', ride_id: ride1.id, latitude: 28.6816, longitude: 77.2016, altitude: 238, speed: 0, accuracy: 3, timestamp: t1 + 110000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride1.id}`, JSON.stringify(coords1));

    // ============================================================
    // Ride 2: South Campus Quick (Hub 3 → Hub 4)
    // Dhaula Kuan → Satya Niketan (short hop via Satya Niketan Rd)
    // 1.4km, 8 min, scooter-3
    // ============================================================
    const ride2: LocalRide = {
      id: 'ride-south-campus-quick-1',
      scooter_id: 'scooter-3',
      start_time: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 1400,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride2.id}`, JSON.stringify(ride2));

    const t2 = Date.now() - 11 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000;
    const coords2: LocalCoordinate[] = [
      { id: 'c2-01', ride_id: ride2.id, latitude: 28.5840, longitude: 77.1630, altitude: 222, speed: 0, accuracy: 3, timestamp: t2, sync_status: 'SYNCED' },
      { id: 'c2-02', ride_id: ride2.id, latitude: 28.5844, longitude: 77.1633, altitude: 222, speed: 3.8, accuracy: 3, timestamp: t2 + 10000, sync_status: 'SYNCED' },
      { id: 'c2-03', ride_id: ride2.id, latitude: 28.5849, longitude: 77.1636, altitude: 222, speed: 4.5, accuracy: 4, timestamp: t2 + 20000, sync_status: 'SYNCED' },
      { id: 'c2-04', ride_id: ride2.id, latitude: 28.5854, longitude: 77.1638, altitude: 223, speed: 4.9, accuracy: 3, timestamp: t2 + 30000, sync_status: 'SYNCED' },
      { id: 'c2-05', ride_id: ride2.id, latitude: 28.5858, longitude: 77.1640, altitude: 223, speed: 5.1, accuracy: 3, timestamp: t2 + 40000, sync_status: 'SYNCED' },
      { id: 'c2-06', ride_id: ride2.id, latitude: 28.5863, longitude: 77.1642, altitude: 223, speed: 4.6, accuracy: 4, timestamp: t2 + 50000, sync_status: 'SYNCED' },
      { id: 'c2-07', ride_id: ride2.id, latitude: 28.5868, longitude: 77.1644, altitude: 222, speed: 3.9, accuracy: 3, timestamp: t2 + 60000, sync_status: 'SYNCED' },
      { id: 'c2-08', ride_id: ride2.id, latitude: 28.5873, longitude: 77.1645, altitude: 222, speed: 0, accuracy: 3, timestamp: t2 + 70000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride2.id}`, JSON.stringify(coords2));

    // ============================================================
    // Ride 3: Cross-Campus Long (Hub 2 → Hub 4)
    // Kamla Nagar → Civil Lines → Connaught Place → India Gate area → Moti Bagh → Satya Niketan
    // 15.6km, 42 min, scooter-2
    // ============================================================
    const ride3: LocalRide = {
      id: 'ride-cross-campus-long-1',
      scooter_id: 'scooter-2',
      start_time: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000 + 42 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 15600,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride3.id}`, JSON.stringify(ride3));

    const t3 = Date.now() - 9 * 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000;
    const coords3: LocalCoordinate[] = [
      // Start: Kamla Nagar
      { id: 'c3-01', ride_id: ride3.id, latitude: 28.6816, longitude: 77.2016, altitude: 235, speed: 0, accuracy: 5, timestamp: t3, sync_status: 'SYNCED' },
      // Heading south through Kamla Nagar Market
      { id: 'c3-02', ride_id: ride3.id, latitude: 28.6780, longitude: 77.2035, altitude: 236, speed: 7.5, accuracy: 5, timestamp: t3 + 10000, sync_status: 'SYNCED' },
      // Civil Lines — Alipur Road area
      { id: 'c3-03', ride_id: ride3.id, latitude: 28.6735, longitude: 77.2068, altitude: 236, speed: 9.2, accuracy: 4, timestamp: t3 + 20000, sync_status: 'SYNCED' },
      // Past Tis Hazari Courts
      { id: 'c3-04', ride_id: ride3.id, latitude: 28.6660, longitude: 77.2130, altitude: 235, speed: 10.5, accuracy: 5, timestamp: t3 + 30000, sync_status: 'SYNCED' },
      // Old Delhi — Chandni Chowk area outskirts
      { id: 'c3-05', ride_id: ride3.id, latitude: 28.6580, longitude: 77.2180, altitude: 237, speed: 8.8, accuracy: 6, timestamp: t3 + 40000, sync_status: 'SYNCED' },
      // Approaching Connaught Place from north
      { id: 'c3-06', ride_id: ride3.id, latitude: 28.6490, longitude: 77.2220, altitude: 238, speed: 10.1, accuracy: 5, timestamp: t3 + 50000, sync_status: 'SYNCED' },
      // Connaught Place inner circle
      { id: 'c3-07', ride_id: ride3.id, latitude: 28.6340, longitude: 77.2195, altitude: 240, speed: 7.3, accuracy: 5, timestamp: t3 + 60000, sync_status: 'SYNCED' },
      // Janpath — heading towards India Gate
      { id: 'c3-08', ride_id: ride3.id, latitude: 28.6270, longitude: 77.2150, altitude: 241, speed: 9.4, accuracy: 4, timestamp: t3 + 70000, sync_status: 'SYNCED' },
      // India Gate / Rajpath area
      { id: 'c3-09', ride_id: ride3.id, latitude: 28.6170, longitude: 77.2090, altitude: 242, speed: 11.2, accuracy: 5, timestamp: t3 + 80000, sync_status: 'SYNCED' },
      // Towards Vinay Marg
      { id: 'c3-10', ride_id: ride3.id, latitude: 28.6095, longitude: 77.2010, altitude: 243, speed: 10.8, accuracy: 5, timestamp: t3 + 90000, sync_status: 'SYNCED' },
      // Chanakyapuri diplomatic area
      { id: 'c3-11', ride_id: ride3.id, latitude: 28.6020, longitude: 77.1920, altitude: 241, speed: 9.6, accuracy: 5, timestamp: t3 + 100000, sync_status: 'SYNCED' },
      // Moti Bagh
      { id: 'c3-12', ride_id: ride3.id, latitude: 28.5975, longitude: 77.1840, altitude: 238, speed: 8.9, accuracy: 4, timestamp: t3 + 110000, sync_status: 'SYNCED' },
      // Approaching Dhaula Kuan flyover
      { id: 'c3-13', ride_id: ride3.id, latitude: 28.5940, longitude: 77.1780, altitude: 236, speed: 7.4, accuracy: 5, timestamp: t3 + 120000, sync_status: 'SYNCED' },
      // Near Satya Niketan
      { id: 'c3-14', ride_id: ride3.id, latitude: 28.5910, longitude: 77.1720, altitude: 234, speed: 6.8, accuracy: 4, timestamp: t3 + 130000, sync_status: 'SYNCED' },
      // Satya Niketan market area
      { id: 'c3-15', ride_id: ride3.id, latitude: 28.5890, longitude: 77.1680, altitude: 233, speed: 5.2, accuracy: 4, timestamp: t3 + 140000, sync_status: 'SYNCED' },
      // Arrival at Hub 4
      { id: 'c3-16', ride_id: ride3.id, latitude: 28.5873, longitude: 77.1645, altitude: 233, speed: 0, accuracy: 4, timestamp: t3 + 150000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride3.id}`, JSON.stringify(coords3));

    // ============================================================
    // Ride 4: Evening Return (Hub 2 → Hub 1)
    // Kamla Nagar → GTB Nagar road → Mall Road → Vishwavidyalaya Metro
    // 1.8km, 10 min, scooter-2 (different path from ride 1 reverse)
    // ============================================================
    const ride4: LocalRide = {
      id: 'ride-evening-return-1',
      scooter_id: 'scooter-2',
      start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 1800,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride4.id}`, JSON.stringify(ride4));

    const t4 = Date.now() - 7 * 24 * 60 * 60 * 1000 + 18.5 * 60 * 60 * 1000;
    const coords4: LocalCoordinate[] = [
      { id: 'c4-01', ride_id: ride4.id, latitude: 28.6816, longitude: 77.2016, altitude: 238, speed: 0, accuracy: 4, timestamp: t4, sync_status: 'SYNCED' },
      // Heading north via Bungalow Road
      { id: 'c4-02', ride_id: ride4.id, latitude: 28.6830, longitude: 77.2020, altitude: 238, speed: 4.5, accuracy: 5, timestamp: t4 + 10000, sync_status: 'SYNCED' },
      // GTB Nagar approach
      { id: 'c4-03', ride_id: ride4.id, latitude: 28.6848, longitude: 77.2030, altitude: 239, speed: 5.6, accuracy: 4, timestamp: t4 + 20000, sync_status: 'SYNCED' },
      // Mall Road
      { id: 'c4-04', ride_id: ride4.id, latitude: 28.6870, longitude: 77.2040, altitude: 239, speed: 6.0, accuracy: 5, timestamp: t4 + 30000, sync_status: 'SYNCED' },
      // Turning towards University
      { id: 'c4-05', ride_id: ride4.id, latitude: 28.6895, longitude: 77.2045, altitude: 240, speed: 5.3, accuracy: 4, timestamp: t4 + 40000, sync_status: 'SYNCED' },
      // North Campus gate area
      { id: 'c4-06', ride_id: ride4.id, latitude: 28.6920, longitude: 77.2042, altitude: 240, speed: 4.8, accuracy: 5, timestamp: t4 + 50000, sync_status: 'SYNCED' },
      // Along university internal road
      { id: 'c4-07', ride_id: ride4.id, latitude: 28.6938, longitude: 77.2038, altitude: 240, speed: 5.1, accuracy: 4, timestamp: t4 + 60000, sync_status: 'SYNCED' },
      // Approaching Vishwavidyalaya
      { id: 'c4-08', ride_id: ride4.id, latitude: 28.6955, longitude: 77.2032, altitude: 240, speed: 4.2, accuracy: 4, timestamp: t4 + 70000, sync_status: 'SYNCED' },
      // Arrival at Hub 1
      { id: 'c4-09', ride_id: ride4.id, latitude: 28.6974, longitude: 77.2023, altitude: 240, speed: 0, accuracy: 3, timestamp: t4 + 80000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride4.id}`, JSON.stringify(coords4));

    // ============================================================
    // Ride 5: Weekend Explorer (Hub 1 → Hub 3)
    // North Campus → Ridge Road → Pusa Road → Naraina → Dhaula Kuan
    // 8.2km, 32 min, scooter-1
    // ============================================================
    const ride5: LocalRide = {
      id: 'ride-weekend-explorer-1',
      scooter_id: 'scooter-1',
      start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 32 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 8200,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride5.id}`, JSON.stringify(ride5));

    const t5 = Date.now() - 5 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000;
    const coords5: LocalCoordinate[] = [
      // Start: North Campus Hub
      { id: 'c5-01', ride_id: ride5.id, latitude: 28.6974, longitude: 77.2023, altitude: 240, speed: 0, accuracy: 5, timestamp: t5, sync_status: 'SYNCED' },
      // Ridge Road entrance
      { id: 'c5-02', ride_id: ride5.id, latitude: 28.6945, longitude: 77.1985, altitude: 241, speed: 6.8, accuracy: 5, timestamp: t5 + 10000, sync_status: 'SYNCED' },
      // Along Ridge Road (Delhi Ridge forest)
      { id: 'c5-03', ride_id: ride5.id, latitude: 28.6890, longitude: 77.1945, altitude: 243, speed: 8.2, accuracy: 4, timestamp: t5 + 20000, sync_status: 'SYNCED' },
      // Flagstaff Tower area
      { id: 'c5-04', ride_id: ride5.id, latitude: 28.6825, longitude: 77.1910, altitude: 245, speed: 7.5, accuracy: 5, timestamp: t5 + 30000, sync_status: 'SYNCED' },
      // Kamla Nehru Ridge
      { id: 'c5-05', ride_id: ride5.id, latitude: 28.6750, longitude: 77.1880, altitude: 244, speed: 8.8, accuracy: 5, timestamp: t5 + 40000, sync_status: 'SYNCED' },
      // Past Rani Jhansi Road
      { id: 'c5-06', ride_id: ride5.id, latitude: 28.6660, longitude: 77.1860, altitude: 240, speed: 9.1, accuracy: 4, timestamp: t5 + 50000, sync_status: 'SYNCED' },
      // Pusa Road intersection
      { id: 'c5-07', ride_id: ride5.id, latitude: 28.6540, longitude: 77.1820, altitude: 238, speed: 7.9, accuracy: 5, timestamp: t5 + 60000, sync_status: 'SYNCED' },
      // Karol Bagh outskirts
      { id: 'c5-08', ride_id: ride5.id, latitude: 28.6430, longitude: 77.1790, altitude: 236, speed: 8.5, accuracy: 5, timestamp: t5 + 70000, sync_status: 'SYNCED' },
      // Naraina flyover
      { id: 'c5-09', ride_id: ride5.id, latitude: 28.6320, longitude: 77.1760, altitude: 234, speed: 10.2, accuracy: 4, timestamp: t5 + 80000, sync_status: 'SYNCED' },
      // Approaching Patel Nagar
      { id: 'c5-10', ride_id: ride5.id, latitude: 28.6210, longitude: 77.1730, altitude: 232, speed: 9.5, accuracy: 5, timestamp: t5 + 90000, sync_status: 'SYNCED' },
      // Ring Road heading south
      { id: 'c5-11', ride_id: ride5.id, latitude: 28.6100, longitude: 77.1700, altitude: 230, speed: 10.8, accuracy: 5, timestamp: t5 + 100000, sync_status: 'SYNCED' },
      // Near Dhaula Kuan flyover
      { id: 'c5-12', ride_id: ride5.id, latitude: 28.5980, longitude: 77.1670, altitude: 226, speed: 8.3, accuracy: 5, timestamp: t5 + 110000, sync_status: 'SYNCED' },
      // Dhaula Kuan area
      { id: 'c5-13', ride_id: ride5.id, latitude: 28.5910, longitude: 77.1648, altitude: 224, speed: 6.5, accuracy: 4, timestamp: t5 + 120000, sync_status: 'SYNCED' },
      // Arrival at Hub 3
      { id: 'c5-14', ride_id: ride5.id, latitude: 28.5840, longitude: 77.1630, altitude: 222, speed: 0, accuracy: 4, timestamp: t5 + 130000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride5.id}`, JSON.stringify(coords5));

    // ============================================================
    // Ride 6: Quick Errand (Hub 4 → Hub 3)
    // Satya Niketan → Dhaula Kuan (short hop)
    // 0.8km, 5 min, scooter-4
    // ============================================================
    const ride6: LocalRide = {
      id: 'ride-quick-errand-1',
      scooter_id: 'scooter-4',
      start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 16.75 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 16.75 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 800,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride6.id}`, JSON.stringify(ride6));

    const t6 = Date.now() - 3 * 24 * 60 * 60 * 1000 + 16.75 * 60 * 60 * 1000;
    const coords6: LocalCoordinate[] = [
      { id: 'c6-01', ride_id: ride6.id, latitude: 28.5873, longitude: 77.1645, altitude: 222, speed: 0, accuracy: 3, timestamp: t6, sync_status: 'SYNCED' },
      { id: 'c6-02', ride_id: ride6.id, latitude: 28.5869, longitude: 77.1643, altitude: 222, speed: 3.5, accuracy: 4, timestamp: t6 + 10000, sync_status: 'SYNCED' },
      { id: 'c6-03', ride_id: ride6.id, latitude: 28.5864, longitude: 77.1641, altitude: 222, speed: 4.2, accuracy: 3, timestamp: t6 + 20000, sync_status: 'SYNCED' },
      { id: 'c6-04', ride_id: ride6.id, latitude: 28.5858, longitude: 77.1638, altitude: 223, speed: 4.0, accuracy: 4, timestamp: t6 + 30000, sync_status: 'SYNCED' },
      { id: 'c6-05', ride_id: ride6.id, latitude: 28.5852, longitude: 77.1636, altitude: 222, speed: 3.8, accuracy: 3, timestamp: t6 + 40000, sync_status: 'SYNCED' },
      { id: 'c6-06', ride_id: ride6.id, latitude: 28.5846, longitude: 77.1633, altitude: 222, speed: 3.5, accuracy: 3, timestamp: t6 + 50000, sync_status: 'SYNCED' },
      { id: 'c6-07', ride_id: ride6.id, latitude: 28.5843, longitude: 77.1631, altitude: 222, speed: 3.0, accuracy: 4, timestamp: t6 + 60000, sync_status: 'SYNCED' },
      { id: 'c6-08', ride_id: ride6.id, latitude: 28.5840, longitude: 77.1630, altitude: 222, speed: 0, accuracy: 3, timestamp: t6 + 70000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride6.id}`, JSON.stringify(coords6));

    // ============================================================
    // Ride 7: Night Ride (Hub 3 → Hub 1)
    // Dhaula Kuan → Rajpath/Kartavya Path → Connaught Place → Civil Lines → North Campus
    // 12.4km, 38 min, scooter-3
    // ============================================================
    const ride7: LocalRide = {
      id: 'ride-night-cruise-1',
      scooter_id: 'scooter-3',
      start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000 + 38 * 60 * 1000).toISOString(),
      status: 'COMPLETED' as const,
      total_distance: 12400,
      sync_status: 'SYNCED' as const
    };
    this.fallbackStore.set(`ride:${ride7.id}`, JSON.stringify(ride7));

    const t7 = Date.now() - 1 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000;
    const coords7: LocalCoordinate[] = [
      // Start: Dhaula Kuan Hub
      { id: 'c7-01', ride_id: ride7.id, latitude: 28.5840, longitude: 77.1630, altitude: 222, speed: 0, accuracy: 5, timestamp: t7, sync_status: 'SYNCED' },
      // Heading east on Sardar Patel Marg
      { id: 'c7-02', ride_id: ride7.id, latitude: 28.5870, longitude: 77.1710, altitude: 224, speed: 7.8, accuracy: 6, timestamp: t7 + 10000, sync_status: 'SYNCED' },
      // Chanakyapuri
      { id: 'c7-03', ride_id: ride7.id, latitude: 28.5920, longitude: 77.1810, altitude: 226, speed: 9.5, accuracy: 5, timestamp: t7 + 20000, sync_status: 'SYNCED' },
      // Nearing Rashtrapati Bhavan
      { id: 'c7-04', ride_id: ride7.id, latitude: 28.5980, longitude: 77.1920, altitude: 230, speed: 10.8, accuracy: 5, timestamp: t7 + 30000, sync_status: 'SYNCED' },
      // Rajpath / Kartavya Path — majestic night view
      { id: 'c7-05', ride_id: ride7.id, latitude: 28.6060, longitude: 77.2020, altitude: 234, speed: 11.5, accuracy: 5, timestamp: t7 + 40000, sync_status: 'SYNCED' },
      // India Gate vicinity
      { id: 'c7-06', ride_id: ride7.id, latitude: 28.6130, longitude: 77.2100, altitude: 238, speed: 10.2, accuracy: 6, timestamp: t7 + 50000, sync_status: 'SYNCED' },
      // Heading north towards Barakhamba
      { id: 'c7-07', ride_id: ride7.id, latitude: 28.6220, longitude: 77.2160, altitude: 240, speed: 9.4, accuracy: 5, timestamp: t7 + 60000, sync_status: 'SYNCED' },
      // Connaught Place outer circle
      { id: 'c7-08', ride_id: ride7.id, latitude: 28.6330, longitude: 77.2190, altitude: 241, speed: 7.8, accuracy: 6, timestamp: t7 + 70000, sync_status: 'SYNCED' },
      // Leaving CP northward
      { id: 'c7-09', ride_id: ride7.id, latitude: 28.6440, longitude: 77.2200, altitude: 240, speed: 9.0, accuracy: 5, timestamp: t7 + 80000, sync_status: 'SYNCED' },
      // New Delhi Railway Station area
      { id: 'c7-10', ride_id: ride7.id, latitude: 28.6530, longitude: 77.2170, altitude: 239, speed: 8.5, accuracy: 6, timestamp: t7 + 90000, sync_status: 'SYNCED' },
      // Approaching Civil Lines
      { id: 'c7-11', ride_id: ride7.id, latitude: 28.6620, longitude: 77.2130, altitude: 238, speed: 9.2, accuracy: 5, timestamp: t7 + 100000, sync_status: 'SYNCED' },
      // Civil Lines / Tis Hazari
      { id: 'c7-12', ride_id: ride7.id, latitude: 28.6710, longitude: 77.2080, altitude: 237, speed: 8.6, accuracy: 5, timestamp: t7 + 110000, sync_status: 'SYNCED' },
      // GTB Nagar approach
      { id: 'c7-13', ride_id: ride7.id, latitude: 28.6780, longitude: 77.2050, altitude: 238, speed: 7.3, accuracy: 5, timestamp: t7 + 120000, sync_status: 'SYNCED' },
      // Near Vishwavidyalaya area
      { id: 'c7-14', ride_id: ride7.id, latitude: 28.6850, longitude: 77.2040, altitude: 239, speed: 6.5, accuracy: 4, timestamp: t7 + 130000, sync_status: 'SYNCED' },
      // University campus
      { id: 'c7-15', ride_id: ride7.id, latitude: 28.6920, longitude: 77.2035, altitude: 240, speed: 5.2, accuracy: 4, timestamp: t7 + 140000, sync_status: 'SYNCED' },
      // Arriving at Hub 1
      { id: 'c7-16', ride_id: ride7.id, latitude: 28.6974, longitude: 77.2023, altitude: 240, speed: 0, accuracy: 4, timestamp: t7 + 150000, sync_status: 'SYNCED' }
    ];
    this.fallbackStore.set(`coords:${ride7.id}`, JSON.stringify(coords7));

    // Also try putting them in the SQLite native database if present
    if (this.db && !this.isFallbackMode) {
      try {
        const allRides = [ride1, ride2, ride3, ride4, ride5, ride6, ride7];
        const allCoords = [coords1, coords2, coords3, coords4, coords5, coords6, coords7];

        this.db.transaction((tx: any) => {
          // Rides
          for (const ride of allRides) {
            tx.executeSql(`INSERT OR REPLACE INTO rides (id, scooter_id, start_time, end_time, status, total_distance, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?);`,
              [ride.id, ride.scooter_id, ride.start_time, ride.end_time, ride.status, ride.total_distance, ride.sync_status]);
          }
          // Coords
          for (const coordSet of allCoords) {
            for (const c of coordSet) {
              tx.executeSql(`INSERT OR REPLACE INTO coordinates (id, ride_id, latitude, longitude, altitude, speed, accuracy, timestamp, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [c.id, c.ride_id, c.latitude, c.longitude, c.altitude, c.speed, c.accuracy, c.timestamp, c.sync_status]);
            }
          }
        });
      } catch (err) {
        console.warn('Failed to seed native SQLite tables:', err);
      }
    }

    this.fallbackStore.set(keySeeded, true);
    console.info('[SQLiteService] Mock coordinates seeded successfully (v2 — 7 rides)!');
  }
}


export default new SQLiteService();
