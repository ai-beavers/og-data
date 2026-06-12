import {
  classifyCapture,
  FALLBACK_CLASSIFICATION,
  parseClassification,
} from '@/shared/ai/classifyCapture';

const PHOTO = ['base64photo'];

function setFetch(mock: jest.Mock) {
  (globalThis as { fetch: unknown }).fetch = mock;
}

function mockFetchOnce(value: unknown, ok = true): jest.Mock {
  const mock = jest.fn().mockResolvedValue({ ok, json: async () => value });
  setFetch(mock);
  return mock;
}

describe('parseClassification', () => {
  it('accepts a known category and trims the label', () => {
    expect(parseClassification('{"category":"vehicle","label":" blue bike "}')).toEqual({
      category: 'vehicle',
      aiLabel: 'blue bike',
    });
  });

  it('maps unknown categories to other and drops empty labels', () => {
    expect(parseClassification('{"category":"spaceship","label":""}')).toEqual({
      category: 'other',
      aiLabel: undefined,
    });
  });

  it('falls back on malformed JSON', () => {
    expect(parseClassification('not json')).toEqual(FALLBACK_CLASSIFICATION);
  });
});

describe('classifyCapture', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    setFetch(originalFetch as unknown as jest.Mock);
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  });

  it('falls back without an API key and never calls the network', async () => {
    const mock = jest.fn();
    setFetch(mock);
    await expect(classifyCapture(PHOTO)).resolves.toEqual(FALLBACK_CLASSIFICATION);
    expect(mock).not.toHaveBeenCalled();
  });

  it('falls back when there is no photo', async () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    const mock = jest.fn();
    setFetch(mock);
    await expect(classifyCapture([])).resolves.toEqual(FALLBACK_CLASSIFICATION);
    expect(mock).not.toHaveBeenCalled();
  });

  it('falls back when the request rejects', async () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    setFetch(jest.fn().mockRejectedValue(new Error('offline')));
    await expect(classifyCapture(PHOTO)).resolves.toEqual(FALLBACK_CLASSIFICATION);
  });

  it('falls back on a non-OK response', async () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    mockFetchOnce({}, false);
    await expect(classifyCapture(PHOTO)).resolves.toEqual(FALLBACK_CLASSIFICATION);
  });

  it('parses a successful classification', async () => {
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
    mockFetchOnce({
      choices: [{ message: { content: '{"category":"signage","label":"stop sign"}' } }],
    });
    await expect(
      classifyCapture(PHOTO, { latitude: 52.52, longitude: 13.405 }),
    ).resolves.toEqual({ category: 'signage', aiLabel: 'stop sign' });
  });
});
