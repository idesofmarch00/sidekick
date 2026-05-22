import {
  haversineDistance,
  calculateRouteDistance,
  calculateJourneyStats,
  simplifyRoutePath
} from '../modules/ride/utils/journeyUtils';

describe('Journey Statistics & Geodesic Utilities Test Suite', () => {
  
  // 1. Geodesic distance (Haversine formula) tests
  describe('haversineDistance', () => {
    it('should calculate correct distance between Delhi and Noida hubs (approx 18.5 km)', () => {
      const delhiLat = 28.6139;
      const delhiLng = 77.2090;
      const noidaLat = 28.5355;
      const noidaLng = 77.3910;

      const dist = haversineDistance(delhiLat, delhiLng, noidaLat, noidaLng);
      const distKm = dist / 1000;

      // Delhi to Noida central is roughly 18 - 20 km
      expect(distKm).toBeGreaterThan(18);
      expect(distKm).toBeLessThan(21);
    });

    it('should return 0 meters for identical coordinate positions', () => {
      const lat = 28.7041;
      const lng = 77.1025;
      const dist = haversineDistance(lat, lng, lat, lng);
      expect(dist).toBe(0);
    });
  });

  // 2. Accumulating route coordinate distance tests
  describe('calculateRouteDistance', () => {
    it('should correctly sum distances across multiple coordinates', () => {
      const coords = [
        { latitude: 28.6139, longitude: 77.2090 }, // Point A
        { latitude: 28.6149, longitude: 77.2100 }, // Point B (approx 140m away)
        { latitude: 28.6159, longitude: 77.2110 }  // Point C (approx 140m away)
      ];

      const dist = calculateRouteDistance(coords);
      expect(dist).toBeGreaterThan(270);
      expect(dist).toBeLessThan(300);
    });
  });

  // 3. Telemetry parsing & average/max speed calculators
  describe('calculateJourneyStats', () => {
    const mockRide = {
      id: 'ride_123',
      start_time: '2026-05-20T10:00:00.000Z',
      end_time: '2026-05-20T10:20:00.000Z', // 20 minutes duration (1200 seconds)
      total_distance: 6000, // 6.0 km
      total_cost: 40
    };

    it('should correctly parse standard stats from completed ride details', () => {
      const stats = calculateJourneyStats(mockRide, []);
      
      expect(stats.distanceKm).toBe(6.0);
      expect(stats.durationSeconds).toBe(1200);
      expect(stats.durationFormatted).toBe('20m 0s');
      expect(stats.avgSpeedKmH).toBe(18.0); // 6km in 20min is 18km/h
      expect(stats.journeyString).toContain('6 km');
      expect(stats.journeyString).toContain('20m 0s');
    });

    it('should calculate fallbacks if coordinates are provided and total_distance is missing', () => {
      const rideWithoutDist = {
        ...mockRide,
        total_distance: null
      };

      // Coordinates 1 km apart total
      const coords = [
        { latitude: 28.6139, longitude: 77.2090, speed: 5.0, timestamp: 1716200000000 }, // 18 km/h
        { latitude: 28.6189, longitude: 77.2140, speed: 6.5, timestamp: 1716200600000 }, // 23.4 km/h
        { latitude: 28.6239, longitude: 77.2190, speed: 8.0, timestamp: 1716201200000 }  // 28.8 km/h
      ];

      const stats = calculateJourneyStats(rideWithoutDist, coords);

      expect(stats.distanceKm).toBeGreaterThan(1);
      expect(stats.maxSpeedKmH).toBe(28.8); // 8.0 m/s * 3.6 = 28.8 km/h
      expect(stats.avgSpeedKmH).toBeCloseTo(23.4, 1); // average of speeds in km/h
    });

    it('should filter anomalous noise speed spikes', () => {
      const coords = [
        { latitude: 28.6139, longitude: 77.2090, speed: 5.0, timestamp: 1716200000000 }, // 18 km/h
        { latitude: 28.6189, longitude: 77.2140, speed: 100.0, timestamp: 1716200600000 }, // 360 km/h (Anomaly Spike!)
        { latitude: 28.6239, longitude: 77.2190, speed: 6.0, timestamp: 1716201200000 }  // 21.6 km/h
      ];

      const stats = calculateJourneyStats(mockRide, coords);

      // Should filter out the 360 km/h anomaly
      expect(stats.maxSpeedKmH).toBe(21.6); // maximum valid speed
      expect(stats.avgSpeedKmH).toBeCloseTo(19.8, 1); // average of 18 and 21.6
    });
  });

  // 4. Path geometry down-sampler tests
  describe('simplifyRoutePath', () => {
    it('should down-sample points correctly while retaining endpoints', () => {
      const denseCoords = Array.from({ length: 500 }, (_, idx) => ({
        latitude: 28.6139 + idx * 0.0001,
        longitude: 77.2090 + idx * 0.0001
      }));

      const simplified = simplifyRoutePath(denseCoords, 50);

      expect(simplified.length).toBeLessThanOrEqual(52); // allow small bounds for step ceilings
      expect(simplified[0]).toEqual(denseCoords[0]); // first point matches
      expect(simplified[simplified.length - 1]).toEqual(denseCoords[denseCoords.length - 1]); // last point matches
    });

    it('should return coordinates unaltered if length is below down-sampling threshold', () => {
      const shortCoords = [
        { latitude: 28.6139, longitude: 77.2090 },
        { latitude: 28.6149, longitude: 77.2100 }
      ];

      const simplified = simplifyRoutePath(shortCoords, 50);
      expect(simplified.length).toBe(2);
      expect(simplified).toEqual(shortCoords);
    });
  });
});
