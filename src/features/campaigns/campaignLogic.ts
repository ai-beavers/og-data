import type {
  Campaign,
  CampaignProgress,
  CaptureDepth,
  Opportunity,
  Submission,
} from '@/shared/types';

/**
 * P2 — pure campaign domain logic.
 * Active campaigns are derived into contributor-facing opportunities so the
 * contributor UI never has to know campaigns exist.
 */

/** Deterministic opportunity id for a campaign — the join key for progress. */
export function campaignOpportunityId(campaignId: string): string {
  return `opp_${campaignId}`;
}

/** Capture-depth presets translated into non-technical guided prompts. */
const PROMPTS_BY_DEPTH: Record<CaptureDepth, string[]> = {
  quick: [
    'Take one clear photo of the whole subject from the front.',
    'Get one close-up of the most detailed part.',
  ],
  standard: [
    'Stand a couple of meters back and photograph the subject from the front.',
    'Walk around it — take a photo from each side.',
    'Get a close-up of any text, labels, or distinctive details.',
  ],
  thorough: [
    'Take a wide shot showing the subject and its surroundings.',
    'Photograph it from the front, both sides, and the back.',
    'Get close-ups of any text, labels, or distinctive details.',
    'Capture one shot from a low angle and one from above if you can.',
  ],
};

/** Human label for the capture depth, used by the operator UI. */
export const CAPTURE_DEPTH_LABEL: Record<CaptureDepth, string> = {
  quick: 'Quick (2 shots)',
  standard: 'Standard (3 shots)',
  thorough: 'Thorough (4+ shots)',
};

/**
 * Derives the contributor-facing opportunity for a campaign. Buyer concepts
 * (requester, targets, quality bar) are folded into plain-language guidance.
 */
export function campaignToOpportunity(campaign: Campaign): Opportunity {
  const description = campaign.environments.length
    ? `${campaign.description} Best captured: ${campaign.environments.join(', ')}.`
    : campaign.description;

  const capturePrompts = [...PROMPTS_BY_DEPTH[campaign.captureDepth]];
  if (campaign.qualityExpectations.length) {
    capturePrompts.push(
      `Before you finish, double-check: ${campaign.qualityExpectations.join('; ')}.`,
    );
  }

  return {
    id: campaignOpportunityId(campaign.id),
    title: campaign.name,
    description,
    category: campaign.category,
    location: campaign.location,
    rewardRange: campaign.rewardRange,
    capturePrompts,
  };
}

/** Requester-facing fulfilment counts for one campaign. */
export function computeCampaignProgress(
  campaign: Campaign,
  submissions: Submission[],
): CampaignProgress {
  const opportunityId = campaignOpportunityId(campaign.id);
  const forCampaign = submissions.filter((s) => s.opportunityId === opportunityId);
  const acceptedCount = forCampaign.filter((s) => s.status === 'accepted').length;
  return {
    campaignId: campaign.id,
    submittedCount: forCampaign.length,
    acceptedCount,
    remainingCount: Math.max(0, campaign.targetAcceptedCount - acceptedCount),
  };
}

/** A campaign is fulfilled once accepted submissions reach its target. */
export function isCampaignFulfilled(campaign: Campaign, submissions: Submission[]): boolean {
  return computeCampaignProgress(campaign, submissions).acceptedCount >= campaign.targetAcceptedCount;
}
