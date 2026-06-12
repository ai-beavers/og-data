import { firstUnfilledIndex } from '@/features/capture/useCaptureFlow';
import type { CapturedMedia } from '@/shared/types';

jest.mock('expo-location');

const shot = (id: string): CapturedMedia => ({
  id,
  uri: `file://${id}.jpg`,
  kind: 'photo',
  capturedAt: '2026-06-11T12:00:00Z',
});

describe('firstUnfilledIndex', () => {
  it('points to the next prompt missing a shot', () => {
    expect(firstUnfilledIndex([shot('a'), null, null])).toBe(1);
    expect(firstUnfilledIndex([null, shot('b')])).toBe(0);
  });

  it('returns -1 once every prompt has a shot (flow moves to review)', () => {
    expect(firstUnfilledIndex([shot('a'), shot('b')])).toBe(-1);
  });

  it('treats an empty prompt list as complete', () => {
    expect(firstUnfilledIndex([])).toBe(-1);
  });
});
