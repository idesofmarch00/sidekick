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
 * Calculates the perpendicular distance from a point to a line segment defined by start and end.
 * This is the core geometric primitive used by the Douglas-Peucker algorithm.
 */
function perpendicularDistance(
  point: { latitude: number; longitude: number },
  lineStart: { latitude: number; longitude: number },
  lineEnd: { latitude: number; longitude: number }
): number {
  const dx = lineEnd.longitude - lineStart.longitude;
  const dy = lineEnd.latitude - lineStart.latitude;

  // If start and end are the same point, return direct distance
  const lineLengthSq = dx * dx + dy * dy;
  if (lineLengthSq === 0) {
    const pdx = point.longitude - lineStart.longitude;
    const pdy = point.latitude - lineStart.latitude;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  }

  // Calculate perpendicular distance using the cross-product method
  const numerator = Math.abs(
    dy * point.longitude - dx * point.latitude + lineEnd.longitude * lineStart.latitude - lineEnd.latitude * lineStart.longitude
  );
  const denominator = Math.sqrt(lineLengthSq);

  return numerator / denominator;
}

/**
 * Ramer-Douglas-Peucker algorithm for GPS trajectory simplification.
 * Recursively removes points that fall within the epsilon tolerance of the line
 * between their neighbors, preserving only geometrically significant waypoints.
 *
 * Time Complexity: O(N log N) average, O(N²) worst case.
 * Typical compression: 70% reduction on dense GPS tracks.
 *
 * @param coords - Array of GPS coordinates to simplify
 * @param epsilon - Distance tolerance threshold (in degrees, ~0.00001 ≈ 1.1 meters)
 * @returns Simplified array preserving geometric shape within tolerance
 */
export function douglasPeucker(
  coords: { latitude: number; longitude: number }[],
  epsilon: number = 0.00005
): { latitude: number; longitude: number }[] {
  if (!coords || coords.length <= 2) return coords;

  // Find the point with the maximum perpendicular distance from the line (start → end)
  let maxDistance = 0;
  let maxIndex = 0;

  const start = coords[0];
  const end = coords[coords.length - 1];

  for (let i = 1; i < coords.length - 1; i++) {
    const distance = perpendicularDistance(coords[i], start, end);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If the max distance exceeds epsilon, recursively simplify each half
  if (maxDistance > epsilon) {
    const leftHalf = douglasPeucker(coords.slice(0, maxIndex + 1), epsilon);
    const rightHalf = douglasPeucker(coords.slice(maxIndex), epsilon);

    // Combine results (remove duplicate point at the junction)
    return [...leftHalf.slice(0, -1), ...rightHalf];
  }

  // All intermediate points are within tolerance — keep only endpoints
  return [start, end];
}

/**
 * Smart down-sampling algorithm using the Ramer-Douglas-Peucker method.
 * Simplifies a high-density GPS track into a smooth set of vector coordinates for layout rendering.
 * Falls back to Douglas-Peucker with adaptive epsilon to target approximately maxPoints.
 */
export function simplifyRoutePath(
  coords: { latitude: number; longitude: number }[],
  maxPoints: number = 100
): { latitude: number; longitude: number }[] {
  if (!coords || coords.length <= maxPoints) return coords;

  // Use Douglas-Peucker with an adaptive epsilon
  // Start with a small epsilon and increase until we hit the target point count
  let epsilon = 0.00003;
  let simplified = douglasPeucker(coords, epsilon);

  // Iteratively increase epsilon if we still have too many points
  let iterations = 0;
  while (simplified.length > maxPoints && iterations < 10) {
    epsilon *= 1.5;
    simplified = douglasPeucker(coords, epsilon);
    iterations++;
  }

  return simplified;
}
