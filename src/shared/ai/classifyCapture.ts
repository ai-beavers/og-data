import type { GeoPoint } from '@/shared/types';

/**
 * M8 — AI auto-categorization of free captures.
 *
 * Sends the first capture photo (base64) plus location metadata to an OpenAI
 * vision model and gets back a category + short subject label. The contributor
 * never types anything; classification is silent and best-effort.
 *
 * MVP shortcut: the key ships via EXPO_PUBLIC_OPENAI_API_KEY (dev only) and
 * the app calls OpenAI directly. A real backend proxies this later.
 */

export interface CaptureClassification {
  category: string;
  /** Short human label for the subject, e.g. "red fire hydrant". */
  aiLabel?: string;
}

/** Used whenever classification is unavailable — submission never blocks on AI. */
export const FALLBACK_CLASSIFICATION: CaptureClassification = {
  category: 'uncategorized',
};

/** Buyer-meaningful buckets the model must choose from. */
export const CAPTURE_CATEGORIES = [
  'vehicle',
  'furniture',
  'storefront',
  'signage',
  'nature',
  'infrastructure',
  'indoor_object',
  'other',
] as const;

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT =
  'You classify photos captured for a physical-world dataset. ' +
  `Respond with JSON: {"category": one of [${CAPTURE_CATEGORIES.join(', ')}], ` +
  '"label": a short subject description of at most 5 words, e.g. "red fire hydrant"}.';

function isKnownCategory(value: unknown): value is string {
  return (
    typeof value === 'string' && (CAPTURE_CATEGORIES as readonly string[]).includes(value)
  );
}

/** Parses the model's JSON reply defensively; anything unexpected → fallback. */
export function parseClassification(content: string): CaptureClassification {
  try {
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null) return FALLBACK_CLASSIFICATION;
    const { category, label } = parsed as { category?: unknown; label?: unknown };
    return {
      category: isKnownCategory(category) ? category : 'other',
      aiLabel: typeof label === 'string' && label.trim() !== '' ? label.trim() : undefined,
    };
  } catch {
    return FALLBACK_CLASSIFICATION;
  }
}

/**
 * Classifies a capture from its photos and location. Resolves with the
 * fallback (never rejects) when the key is missing, the request fails,
 * times out, or the reply cannot be parsed.
 */
export async function classifyCapture(
  photosBase64: string[],
  location?: GeoPoint,
): Promise<CaptureClassification> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const photo = photosBase64[0];
  if (!apiKey || !photo) return FALLBACK_CLASSIFICATION;

  const locationLine = location
    ? `Captured at latitude ${location.latitude.toFixed(4)}, longitude ${location.longitude.toFixed(4)}.`
    : 'Capture location unknown.';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.EXPO_PUBLIC_OPENAI_MODEL ?? DEFAULT_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: `${locationLine} Classify this capture.` },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${photo}`, detail: 'low' },
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) return FALLBACK_CLASSIFICATION;
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    return content ? parseClassification(content) : FALLBACK_CLASSIFICATION;
  } catch {
    return FALLBACK_CLASSIFICATION;
  } finally {
    clearTimeout(timer);
  }
}
