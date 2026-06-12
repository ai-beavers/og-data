import type { Opportunity, Submission } from '@/shared/types';

/**
 * M8 — Demo wow layer: turn a raw Submission into a buyer-ready data package
 * preview (key frames, robot-vision labels, quality report, export manifest).
 *
 * Everything here is a deterministic, client-side *preview* derived from the
 * submission + opportunity. It is intentionally honest about scope: it shows
 * the shape of a robotics-ready training package without claiming a real
 * reconstruction/3D pipeline (see README_PRD.md M8 + P3).
 */

/** A normalized bounding box (fractions of frame width/height, 0–1). */
export interface BoundingBox {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

/** One analyzed key frame extracted from a captured photo/video. */
export interface FrameAnalysis {
  mediaId: string;
  /** Source media URI (real file:// from the camera, fixture:// in seeds). */
  uri: string;
  /** Short human label for the angle, e.g. "Front view". */
  angleLabel: string;
  boxes: BoundingBox[];
}

export interface QualityMetric {
  id: string;
  label: string;
  /** 0–1 score. */
  score: number;
}

export interface QualityReport {
  /** 0–1 overall score. */
  overall: number;
  /** Letter grade derived from `overall`. */
  grade: 'A' | 'B' | 'C';
  metrics: QualityMetric[];
}

export type PackageFileKind = 'video' | 'image' | 'json' | 'folder';

export interface PackageFile {
  name: string;
  kind: PackageFileKind;
  detail: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
}

export interface DataPackage {
  submissionId: string;
  subject: string;
  category: string;
  capturedCount: number;
  keyFrameCount: number;
  trainingEpisodes: number;
  frames: FrameAnalysis[];
  detectedLabels: string[];
  quality: QualityReport;
  manifest: PackageFile[];
  steps: AnalysisStep[];
  /** Pretty-printed buyer-facing metadata record. */
  metadataPreview: string;
  /** Reward, in integer cents, this capture would earn at this quality. */
  rewardCents: number;
}

/** Per-category flavor so the robot-vision preview reads as believable. */
interface CategoryProfile {
  subject: string;
  /** Candidate detection labels; the primary subject is always first. */
  labels: string[];
}

const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  street_infrastructure: {
    subject: 'Fire hydrant',
    labels: ['fire_hydrant', 'curb', 'pavement', 'drain_grate', 'sidewalk'],
  },
  street_furniture: {
    subject: 'Park bench',
    labels: ['bench', 'armrest', 'seat_slats', 'ground_plane', 'shadow'],
  },
  everyday_objects: {
    subject: 'Shopping cart',
    labels: ['cart_basket', 'handle', 'wheel', 'frame', 'child_seat'],
  },
};

const FALLBACK_PROFILE: CategoryProfile = {
  subject: 'Captured object',
  labels: ['primary_object', 'surface', 'edge', 'background'],
};

/** Angle labels assigned to key frames in capture order. */
const ANGLE_LABELS = [
  'Front view',
  'Side view',
  'Rear view',
  'Close-up detail',
  'Wide context',
  'Top-down',
];

const QUALITY_DIMENSIONS: { id: string; label: string }[] = [
  { id: 'lighting', label: 'Lighting' },
  { id: 'sharpness', label: 'Sharpness' },
  { id: 'coverage', label: 'Angle coverage' },
  { id: 'framing', label: 'Framing' },
];

/** Deterministic 32-bit hash so a submission always yields the same preview. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — small, seedable, good enough for demo jitter. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Maps a 0–1 score to a letter grade for the quality summary. */
function gradeFor(overall: number): QualityReport['grade'] {
  if (overall >= 0.85) return 'A';
  if (overall >= 0.7) return 'B';
  return 'C';
}

function profileFor(category: string): CategoryProfile {
  return CATEGORY_PROFILES[category] ?? FALLBACK_PROFILE;
}

/** One or two believable boxes per frame: the subject, plus an optional detail. */
function buildBoxes(
  profile: CategoryProfile,
  frameIndex: number,
  rng: () => number,
): BoundingBox[] {
  const subjectLabel = profile.labels[0];
  const boxes: BoundingBox[] = [
    {
      label: subjectLabel,
      x: 0.18 + rng() * 0.12,
      y: 0.16 + rng() * 0.12,
      width: 0.42 + rng() * 0.16,
      height: 0.5 + rng() * 0.18,
      confidence: 0.9 + rng() * 0.09,
    },
  ];
  // Secondary context box on most frames, anchored toward a corner.
  if (rng() > 0.35 && profile.labels.length > 1) {
    const secondary = profile.labels[1 + (frameIndex % (profile.labels.length - 1))];
    boxes.push({
      label: secondary,
      x: 0.55 + rng() * 0.1,
      y: 0.58 + rng() * 0.12,
      width: 0.2 + rng() * 0.12,
      height: 0.16 + rng() * 0.12,
      confidence: 0.72 + rng() * 0.2,
    });
  }
  return boxes;
}

/**
 * Build the buyer-ready data-package preview for a submission. Pure and
 * deterministic: same submission id ⇒ same preview, so the demo is stable.
 */
export function buildDataPackage(
  submission: Submission,
  opportunity: Opportunity | null,
): DataPackage {
  const rng = makeRng(hashString(submission.id));
  const profile = profileFor(submission.category);

  const media = submission.media.length > 0 ? submission.media : [];
  const hasVideo = media.some((m) => m.kind === 'video');

  const frames: FrameAnalysis[] = media.map((item, index) => ({
    mediaId: item.id,
    uri: item.uri,
    angleLabel: ANGLE_LABELS[index] ?? `Frame ${index + 1}`,
    boxes: buildBoxes(profile, index, rng),
  }));

  // A video yields several key frames; photos map 1:1. Always at least 3 to
  // feel like a usable training clip.
  const keyFrameCount = Math.max(
    3,
    hasVideo ? media.length * 4 : media.length,
  );

  const metrics: QualityMetric[] = QUALITY_DIMENSIONS.map((dim) => ({
    ...dim,
    // Bias high (0.74–0.99) so the demo capture reads as buyer-grade.
    score: Math.min(0.99, 0.74 + rng() * 0.25),
  }));
  const overall = metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length;
  const quality: QualityReport = { overall, grade: gradeFor(overall), metrics };

  const detectedLabels = profile.labels.slice(0, 3 + Math.floor(rng() * 2));

  const trainingEpisodes = Math.max(1, Math.round(keyFrameCount / 3));

  const mediaFile: PackageFile = hasVideo
    ? { name: 'capture.mp4', kind: 'video', detail: 'Source clip · H.264' }
    : {
        name: 'media/',
        kind: 'folder',
        detail: `${media.length} source ${media.length === 1 ? 'photo' : 'photos'}`,
      };

  const manifest: PackageFile[] = [
    mediaFile,
    { name: 'frames/', kind: 'folder', detail: `${keyFrameCount} extracted key frames` },
    { name: 'labels.json', kind: 'json', detail: `${detectedLabels.length} object classes` },
    { name: 'quality_report.json', kind: 'json', detail: `Grade ${quality.grade} · ${(overall * 100).toFixed(0)}%` },
    { name: 'metadata.json', kind: 'json', detail: 'Context, geo, prompts' },
  ];

  const steps: AnalysisStep[] = [
    { id: 'ingest', label: 'Ingesting capture' },
    { id: 'frames', label: `Extracting ${keyFrameCount} key frames` },
    { id: 'detect', label: 'Detecting objects' },
    { id: 'quality', label: 'Scoring capture quality' },
    { id: 'package', label: 'Packaging training episode' },
  ];

  const rewardCents = computeReward(opportunity, overall);

  const metadataPreview = JSON.stringify(
    {
      package_id: `pkg_${submission.id}`,
      subject: profile.subject,
      category: submission.category,
      key_frames: keyFrameCount,
      training_episodes: trainingEpisodes,
      object_classes: detectedLabels,
      quality_score: Number(overall.toFixed(2)),
      location: submission.location
        ? {
            lat: Number(submission.location.latitude.toFixed(4)),
            lng: Number(submission.location.longitude.toFixed(4)),
          }
        : null,
      captured_at: media[0]?.capturedAt ?? submission.submittedAt,
    },
    null,
    2,
  );

  return {
    submissionId: submission.id,
    subject: profile.subject,
    category: submission.category,
    capturedCount: media.length,
    keyFrameCount,
    trainingEpisodes,
    frames,
    detectedLabels,
    quality,
    manifest,
    steps,
    metadataPreview,
    rewardCents,
  };
}

/** Reward scales between the opportunity's range by quality; falls back flat. */
function computeReward(opportunity: Opportunity | null, overall: number): number {
  if (!opportunity) return 100;
  const { min, max } = opportunity.rewardRange;
  const span = Math.max(0, max.cents - min.cents);
  return Math.round(min.cents + span * overall);
}
