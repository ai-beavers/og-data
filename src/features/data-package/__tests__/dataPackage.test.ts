import { buildDataPackage } from '@/features/data-package/dataPackage';
import type { CapturedMedia, Opportunity, Submission } from '@/shared/types';

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

function media(id: string, kind: CapturedMedia['kind'] = 'photo'): CapturedMedia {
  return { id, uri: `file://${id}.jpg`, kind, capturedAt: '2026-06-11T17:00:00Z' };
}

function submission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 'sub_test_1',
    opportunityId: 'opp_fire_hydrant',
    contributorId: 'contributor_demo',
    media: [media('m1'), media('m2')],
    category: 'street_infrastructure',
    location: { latitude: 37.7749, longitude: -122.4194 },
    submittedAt: '2026-06-11T17:05:00Z',
    status: 'pending_review',
    ...overrides,
  };
}

const opportunity: Opportunity = {
  id: 'opp_fire_hydrant',
  title: 'Capture a fire hydrant',
  description: 'desc',
  category: 'street_infrastructure',
  rewardRange: { min: usd(50), max: usd(150) },
  capturePrompts: ['front', 'sides', 'close-up'],
};

describe('buildDataPackage', () => {
  it('is deterministic for a given submission id', () => {
    const a = buildDataPackage(submission(), opportunity);
    const b = buildDataPackage(submission(), opportunity);
    expect(a).toEqual(b);
  });

  it('maps one analyzed frame per captured media', () => {
    const pkg = buildDataPackage(submission(), opportunity);
    expect(pkg.frames).toHaveLength(2);
    expect(pkg.frames[0].mediaId).toBe('m1');
    expect(pkg.frames.every((f) => f.boxes.length >= 1)).toBe(true);
  });

  it('keeps quality scores within 0–1 and grades consistently', () => {
    const pkg = buildDataPackage(submission(), opportunity);
    expect(pkg.quality.overall).toBeGreaterThan(0);
    expect(pkg.quality.overall).toBeLessThanOrEqual(1);
    pkg.quality.metrics.forEach((m) => {
      expect(m.score).toBeGreaterThanOrEqual(0);
      expect(m.score).toBeLessThanOrEqual(1);
    });
    const expectedGrade =
      pkg.quality.overall >= 0.85 ? 'A' : pkg.quality.overall >= 0.7 ? 'B' : 'C';
    expect(pkg.quality.grade).toBe(expectedGrade);
  });

  it('extracts at least three key frames even from a single photo', () => {
    const pkg = buildDataPackage(submission({ media: [media('only')] }), opportunity);
    expect(pkg.keyFrameCount).toBeGreaterThanOrEqual(3);
  });

  it('produces more key frames when a video is present', () => {
    const pkg = buildDataPackage(
      submission({ media: [media('v1', 'video')] }),
      opportunity,
    );
    expect(pkg.keyFrameCount).toBeGreaterThanOrEqual(4);
  });

  it('scales reward within the opportunity range', () => {
    const pkg = buildDataPackage(submission(), opportunity);
    expect(pkg.rewardCents).toBeGreaterThanOrEqual(50);
    expect(pkg.rewardCents).toBeLessThanOrEqual(150);
  });

  it('emits a valid, parseable metadata preview', () => {
    const pkg = buildDataPackage(submission(), opportunity);
    const parsed = JSON.parse(pkg.metadataPreview);
    expect(parsed.package_id).toBe('pkg_sub_test_1');
    expect(parsed.category).toBe('street_infrastructure');
    expect(parsed.location).toEqual({ lat: 37.7749, lng: -122.4194 });
  });

  it('includes a metadata.json entry in the export manifest', () => {
    const pkg = buildDataPackage(submission(), opportunity);
    const names = pkg.manifest.map((f) => f.name);
    expect(names).toContain('metadata.json');
    expect(names).toContain('quality_report.json');
  });

  it('falls back to a flat reward when no opportunity is provided', () => {
    const pkg = buildDataPackage(submission(), null);
    expect(pkg.rewardCents).toBe(100);
  });
});
