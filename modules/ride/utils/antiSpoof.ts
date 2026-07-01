import { haversineDistance } from './journeyUtils';

/**
 * Maximum realistic speed for an electric scooter in km/h.
 * Anything above this threshold is physically impossible on a scooter
 * and indicates either GPS spoofing or riding in a motor vehicle.
 */
const MAX_SCOOTER_SPEED_KMH = 60;

/**
 * Number of consecutive suspicious speed readings before we flag the ride.
 * Allows for 1-2 GPS "teleport" glitches without false positives.
 */
const SPOOF_THRESHOLD_COUNT = 3;

export interface SpeedCheckResult {
  isSuspicious: boolean;
  speedKmh: number;
  reason?: string;
}

export interface CoordinatePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number | null;
  accuracy?: number | null;
}

/**
 * Anti-Spoofing Validator.
 * Provides client-side GPS fraud detection through two layers:
 * 1. OS-level mock provider detection (Android `position.mocked` flag)
 * 2. Haversine-based speed anomaly detection between consecutive GPS points
 *
 * This is the first defense layer. The backend provides the authoritative second layer
 * since client-side checks can be bypassed on jailbroken/rooted devices.
 */
export class AntiSpoofValidator {
  private consecutiveSpoofCount = 0;
  private totalSpoofFlags = 0;
  private lastValidCoord: CoordinatePoint | null = null;

  /**
   * Checks whether the GPS position came from a mock/fake GPS provider.
   * On Android, the OS sets `position.mocked = true` when a Fake GPS app is active.
   * On iOS, this flag is not reliably available, so we rely on speed anomaly detection.
   */
  public checkMockProvider(position: any): boolean {
    // Android exposes the `mocked` flag directly
    if (position?.mocked === true) {
      console.warn('[AntiSpoof] ⚠️ MOCK GPS PROVIDER DETECTED — position.mocked = true');
      this.totalSpoofFlags++;
      return true;
    }

    // Additional heuristic: if GPS accuracy is exactly 0 or unrealistically perfect,
    // it may indicate a software-generated coordinate
    if (position?.coords?.accuracy === 0) {
      console.warn('[AntiSpoof] ⚠️ Suspiciously perfect GPS accuracy (0m) — possible mock');
      return true;
    }

    return false;
  }

  /**
   * Calculates the speed between two consecutive GPS points using the Haversine formula.
   * If the computed speed exceeds the physical limit of a scooter, it flags the segment.
   *
   * @param prevCoord - The previous GPS coordinate
   * @param currCoord - The current GPS coordinate
   * @returns SpeedCheckResult with isSuspicious flag and computed speed
   */
  public checkSpeedAnomaly(
    prevCoord: CoordinatePoint,
    currCoord: CoordinatePoint
  ): SpeedCheckResult {
    const timeDiffMs = currCoord.timestamp - prevCoord.timestamp;
    const timeDiffSeconds = timeDiffMs / 1000;

    // Skip check if timestamps are identical or reversed (clock drift)
    if (timeDiffSeconds <= 0) {
      return { isSuspicious: false, speedKmh: 0 };
    }

    // Calculate distance in meters using Haversine
    const distanceMeters = haversineDistance(
      prevCoord.latitude,
      prevCoord.longitude,
      currCoord.latitude,
      currCoord.longitude
    );

    // Convert to km/h
    const speedKmh = (distanceMeters / timeDiffSeconds) * 3.6;

    if (speedKmh > MAX_SCOOTER_SPEED_KMH) {
      this.consecutiveSpoofCount++;
      this.totalSpoofFlags++;

      const reason = `Speed ${speedKmh.toFixed(1)} km/h exceeds ${MAX_SCOOTER_SPEED_KMH} km/h limit (${this.consecutiveSpoofCount}/${SPOOF_THRESHOLD_COUNT} strikes)`;
      console.warn(`[AntiSpoof] ⚠️ ${reason}`);

      return {
        isSuspicious: this.consecutiveSpoofCount >= SPOOF_THRESHOLD_COUNT,
        speedKmh,
        reason,
      };
    }

    // Reset consecutive counter on a valid reading
    this.consecutiveSpoofCount = 0;
    return { isSuspicious: false, speedKmh };
  }

  /**
   * Processes a new coordinate through the full anti-spoof pipeline.
   * Combines mock provider check with speed anomaly detection.
   *
   * @returns true if the ride should be flagged as spoofed
   */
  public processCoordinate(position: any): boolean {
    // Layer 1: Mock provider check (instant flag)
    if (this.checkMockProvider(position)) {
      return true;
    }

    // Layer 2: Speed anomaly check (requires previous coordinate)
    const currCoord: CoordinatePoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      speed: position.coords.speed,
      accuracy: position.coords.accuracy,
    };

    if (this.lastValidCoord) {
      const result = this.checkSpeedAnomaly(this.lastValidCoord, currCoord);
      if (result.isSuspicious) {
        return true;
      }
    }

    this.lastValidCoord = currCoord;
    return false;
  }

  /**
   * Returns whether the current ride has accumulated enough spoof flags to be considered fraudulent.
   */
  public isSpoofDetected(): boolean {
    return this.totalSpoofFlags >= SPOOF_THRESHOLD_COUNT;
  }

  /**
   * Returns the total number of spoof flags accumulated during this ride session.
   */
  public getSpoofFlagCount(): number {
    return this.totalSpoofFlags;
  }

  /**
   * Resets the validator for a new ride session.
   */
  public reset(): void {
    this.consecutiveSpoofCount = 0;
    this.totalSpoofFlags = 0;
    this.lastValidCoord = null;
  }
}
