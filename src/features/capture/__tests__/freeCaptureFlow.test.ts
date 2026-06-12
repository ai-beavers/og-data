import { toSubmissionInput, type FreeShot } from '@/features/capture/useFreeCaptureFlow';
import { FALLBACK_CLASSIFICATION } from '@/shared/ai/classifyCapture';

jest.mock('expo-location');

const shot = (id: string, base64?: string): FreeShot => ({
  media: {
    id,
    uri: `file://${id}.jpg`,
    kind: 'photo',
    capturedAt: '2026-06-11T12:00:00Z',
  },
  base64,
});

describe('toSubmissionInput', () => {
  it('builds a task-less submission with the AI classification', () => {
    const input = toSubmissionInput(
      [shot('a', 'b64'), shot('b')],
      { category: 'signage', aiLabel: 'stop sign' },
      { latitude: 52.52, longitude: 13.405 },
      'contrib_1',
    );

    expect(input.opportunityId).toBeUndefined();
    expect(input.media.map((m) => m.id)).toEqual(['a', 'b']);
    expect(input.category).toBe('signage');
    expect(input.aiLabel).toBe('stop sign');
    expect(input.location).toEqual({ latitude: 52.52, longitude: 13.405 });
  });

  it('submits as uncategorized when classification fell back (AI never blocks)', () => {
    const input = toSubmissionInput([shot('a')], FALLBACK_CLASSIFICATION, undefined, 'c');

    expect(input.category).toBe('uncategorized');
    expect(input.aiLabel).toBeUndefined();
    expect(input.location).toBeUndefined();
  });
});
