import { distanceMeters, formatDistance } from '@/features/opportunities/distance';

describe('distanceMeters', () => {
  it('returns 0 for identical points', () => {
    const p = { latitude: 37.7749, longitude: -122.4194 };
    expect(distanceMeters(p, p)).toBe(0);
  });

  it('matches a known distance (SF downtown → Golden Gate Park, ~7.5 km)', () => {
    const downtown = { latitude: 37.7749, longitude: -122.4194 };
    const park = { latitude: 37.7694, longitude: -122.4862 };
    const d = distanceMeters(downtown, park);
    expect(d).toBeGreaterThan(5500);
    expect(d).toBeLessThan(6500);
  });
});

describe('formatDistance', () => {
  it('uses meters below 1 km', () => {
    expect(formatDistance(349.6)).toBe('350 m away');
  });

  it('uses one-decimal kilometers at 1 km and above', () => {
    expect(formatDistance(2400)).toBe('2.4 km away');
  });
});
