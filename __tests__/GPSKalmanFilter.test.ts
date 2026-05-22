jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    requestAuthorization: jest.fn(),
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}));

import { GPSKalmanFilter } from '../modules/ride/services/backgroundLocation.service';

describe('GPSKalmanFilter Telemetry Signal Processing', () => {
  let filter: GPSKalmanFilter;

  beforeEach(() => {
    // 3.0 noise threshold
    filter = new GPSKalmanFilter(3.0);
  });

  test('should initialize state with first raw coordinate sample', () => {
    const rawLat = 28.7041;
    const rawLng = 77.1025;
    const accuracy = 10; // meters
    const timestamp = Date.now();

    const result = filter.process(rawLat, rawLng, accuracy, timestamp);

    expect(result.latitude).toBeCloseTo(rawLat, 6);
    expect(result.longitude).toBeCloseTo(rawLng, 6);
  });

  test('should smooth coordinates and suppress anomalous telemetry jumps', () => {
    const startLat = 28.70410;
    const startLng = 77.10250;
    const timestamp = Date.now();

    // 1. Initialize filter
    filter.process(startLat, startLng, 5, timestamp);

    // 2. Add sequential straight-line movement points (approx 2 meters steps)
    const points = [
      { lat: 28.70412, lng: 77.10252, time: timestamp + 2000 },
      { lat: 28.70414, lng: 77.10254, time: timestamp + 4000 },
      { lat: 28.70416, lng: 77.10256, time: timestamp + 6000 },
    ];

    let current = { latitude: startLat, longitude: startLng };
    for (const pt of points) {
      current = filter.process(pt.lat, pt.lng, 5, pt.time);
    }

    // Expect smoothed output to be very close to the last coordinate
    expect(current.latitude).toBeCloseTo(28.70416, 4);
    expect(current.longitude).toBeCloseTo(77.10256, 4);

    // 3. Inject a huge GPS telemetry anomaly / jump (e.g. coordinates teleporting 100 meters away inside a tunnel)
    const anomalousLat = 28.70520; // Massive sudden jump in latitude
    const anomalousLng = 77.10360;
    const anomalyTimestamp = timestamp + 8000;

    const filteredAnomaly = filter.process(anomalousLat, anomalousLng, 15, anomalyTimestamp);

    // Expected behavior: The Kalman filter MUST reject the sudden extreme jump,
    // pulling the coordinates significantly closer to the true track.
    expect(filteredAnomaly.latitude).toBeLessThan(28.70470); // Significantly dampened
    expect(filteredAnomaly.longitude).toBeLessThan(77.10310);
    
    console.info(`[Test] Kalman Filter Dampening: Raw Jump to ${anomalousLat} -> Dampened to ${filteredAnomaly.latitude.toFixed(6)}`);
  });

  test('should reset state cleanly upon calling reset()', () => {
    const lat1 = 28.7041;
    const lng1 = 77.1025;
    filter.process(lat1, lng1, 5, Date.now());

    // Reset filter
    filter.reset();

    // Feeding a completely different start coordinate should treat it as new initial sample instead of filtering relative to the old state
    const newStartLat = 40.7128;
    const newStartLng = -74.0060;
    const result = filter.process(newStartLat, newStartLng, 5, Date.now());

    expect(result.latitude).toBeCloseTo(newStartLat, 6);
    expect(result.longitude).toBeCloseTo(newStartLng, 6);
  });
});
