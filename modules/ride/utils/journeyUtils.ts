import { DateTime } from 'luxon';

export interface JourneyStats {
  distanceKm: number;
  durationSeconds: number;
  durationFormatted: string;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
  journeyString: string;
}

/**
 * Calculates high-precision geodesic distance between two coordinates in meters.
 * Uses the standard Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

/**
 * Accumulates the total length of a coordinate route in meters.
 */
export function calculateRouteDistance(coords: { latitude: number; longitude: number }[]): number {
  let totalDistance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalDistance += haversineDistance(
      coords[i].latitude,
      coords[i].longitude,
      coords[i + 1].latitude,
      coords[i + 1].longitude
    );
  }
  return totalDistance;
}

/**
 * Senior-level Telemetry Parser.
 * Computes precise distance, duration, speeds, and outputs a formatted Strava-style summary.
 */
export function calculateJourneyStats(ride: any, coords: any[] = []): JourneyStats {
  // 1. Calculate Duration
  let durationSeconds = 0;
  if (ride.start_time) {
    const start = DateTime.fromISO(ride.start_time);
    const end = ride.end_time ? DateTime.fromISO(ride.end_time) : DateTime.now();
    durationSeconds = Math.max(0, Math.floor(end.diff(start).as('seconds')));
  }

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const durationFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // 2. Calculate Distance (in Kilometers)
  let distanceMeters = 0;
  if (ride.total_distance && Number(ride.total_distance) > 0) {
    distanceMeters = Number(ride.total_distance);
  } else if (coords && coords.length > 1) {
    distanceMeters = calculateRouteDistance(coords);
  }
  const distanceKm = Number((distanceMeters / 1000).toFixed(2));

  // 3. Calculate Speed Metrics (in km/h)
  let maxSpeedKmH = 0;
  let avgSpeedKmH = 0;

  if (coords && coords.length > 0) {
    let speedSum = 0;
    let speedCount = 0;

    coords.forEach((coord, idx) => {
      let speedVal = 0;

      if (coord.speed !== undefined && coord.speed !== null && coord.speed > 0) {
        // Native Geolocation speed is in m/s. Convert to km/h
        speedVal = coord.speed * 3.6;
      } else if (idx > 0 && coord.timestamp && coords[idx - 1].timestamp) {
        // Fallback speed calculation between consecutive points
        const dist = haversineDistance(
          coords[idx - 1].latitude,
          coords[idx - 1].longitude,
          coord.latitude,
          coord.longitude
        );
        const timeDiffSec = (coord.timestamp - coords[idx - 1].timestamp) / 1000;
        if (timeDiffSec > 0 && dist > 0) {
          speedVal = (dist / timeDiffSec) * 3.6; // convert m/s to km/h
        }
      }

      // Filter out extreme noise spikes (e.g. teleports or GPS jumps > 80 km/h on a scooter)
      if (speedVal > 0 && speedVal < 80) {
        speedSum += speedVal;
        speedCount++;
        if (speedVal > maxSpeedKmH) {
          maxSpeedKmH = speedVal;
        }
      }
    });

    if (speedCount > 0) {
      avgSpeedKmH = speedSum / speedCount;
    }
  }

  // If average speed couldn't be parsed from coords, fallback to basic math: distance / time
  if (avgSpeedKmH === 0 && durationSeconds > 0 && distanceKm > 0) {
    avgSpeedKmH = (distanceKm / (durationSeconds / 3600));
  }

  // Bound metrics to reasonable precision
  avgSpeedKmH = Number(Math.min(avgSpeedKmH, 45).toFixed(1)); // Cap avg speed on a scooter to 45 km/h
  maxSpeedKmH = Number(Math.min(Math.max(maxSpeedKmH, avgSpeedKmH), 50).toFixed(1));

  // 4. Compile Journey String
  const journeyString = `🚴 ${distanceKm} km  |  ⏱️ ${durationFormatted}  |  ⚡ ${avgSpeedKmH} km/h avg  |  🔥 ${maxSpeedKmH} km/h max`;

  return {
    distanceKm,
    durationSeconds,
    durationFormatted,
    avgSpeedKmH,
    maxSpeedKmH,
    journeyString,
  };
}

/**
 * Smart down-sampling algorithm.
 * Simplifies a high-density GPS track into a smooth set of vector coordinates for layout rendering.
 */
export function simplifyRoutePath(
  coords: { latitude: number; longitude: number }[],
  maxPoints: number = 100
): { latitude: number; longitude: number }[] {
  if (!coords || coords.length <= maxPoints) return coords;

  const simplified: { latitude: number; longitude: number }[] = [coords[0]];

  for (let i = 1; i < maxPoints - 1; i += 1) {
    const sourceIndex = Math.round((i * (coords.length - 1)) / (maxPoints - 1));
    simplified.push(coords[sourceIndex]);
  }

  simplified.push(coords[coords.length - 1]);

  return simplified;
}
