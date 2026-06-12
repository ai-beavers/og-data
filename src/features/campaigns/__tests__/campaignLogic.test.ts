import {
  campaignOpportunityId,
  campaignToOpportunity,
  computeCampaignProgress,
  isCampaignFulfilled,
} from '@/features/campaigns/campaignLogic';
import type { Campaign, Submission, SubmissionStatus } from '@/shared/types';

const usd = (cents: number) => ({ cents, currency: 'USD' as const });

const baseCampaign: Campaign = {
  id: 'camp_test',
  name: 'Capture mailboxes',
  requester: 'Acme Robotics',
  description: 'Public mailboxes of any color.',
  category: 'street_infrastructure',
  environments: ['outdoors'],
  captureDepth: 'standard',
  qualityExpectations: ['the whole mailbox is visible'],
  rewardRange: { min: usd(50), max: usd(150) },
  targetAcceptedCount: 2,
  status: 'active',
  createdAt: '2026-06-10T00:00:00Z',
};

function submissionFor(campaign: Campaign, status: SubmissionStatus, id: string): Submission {
  return {
    id,
    opportunityId: campaignOpportunityId(campaign.id),
    contributorId: 'contributor_demo',
    media: [],
    category: campaign.category,
    submittedAt: '2026-06-11T10:00:00Z',
    status,
  };
}

describe('campaignToOpportunity', () => {
  it('derives a contributor-facing opportunity with a deterministic id', () => {
    const opportunity = campaignToOpportunity(baseCampaign);
    expect(opportunity.id).toBe('opp_camp_test');
    expect(opportunity.title).toBe(baseCampaign.name);
    expect(opportunity.category).toBe(baseCampaign.category);
    expect(opportunity.rewardRange).toEqual(baseCampaign.rewardRange);
  });

  it('folds environments and quality expectations into plain language', () => {
    const opportunity = campaignToOpportunity(baseCampaign);
    expect(opportunity.description).toContain('Best captured: outdoors.');
    const lastPrompt = opportunity.capturePrompts[opportunity.capturePrompts.length - 1];
    expect(lastPrompt).toContain('double-check: the whole mailbox is visible');
  });

  it('never leaks buyer concepts into the opportunity', () => {
    const opportunity = campaignToOpportunity(baseCampaign);
    const text = JSON.stringify(opportunity);
    expect(text).not.toContain(baseCampaign.requester);
    expect(text).not.toContain('target');
  });

  it('scales prompt count with capture depth', () => {
    const quick = campaignToOpportunity({ ...baseCampaign, captureDepth: 'quick' });
    const thorough = campaignToOpportunity({ ...baseCampaign, captureDepth: 'thorough' });
    expect(quick.capturePrompts.length).toBeLessThan(thorough.capturePrompts.length);
  });
});

describe('computeCampaignProgress', () => {
  it('counts only submissions belonging to the campaign', () => {
    const submissions = [
      submissionFor(baseCampaign, 'accepted', 's1'),
      submissionFor(baseCampaign, 'pending_review', 's2'),
      { ...submissionFor(baseCampaign, 'accepted', 's3'), opportunityId: 'opp_other' },
    ];
    const progress = computeCampaignProgress(baseCampaign, submissions);
    expect(progress).toEqual({
      campaignId: 'camp_test',
      submittedCount: 2,
      acceptedCount: 1,
      remainingCount: 1,
    });
  });

  it('never reports negative remaining', () => {
    const submissions = [
      submissionFor(baseCampaign, 'accepted', 's1'),
      submissionFor(baseCampaign, 'accepted', 's2'),
      submissionFor(baseCampaign, 'accepted', 's3'),
    ];
    const progress = computeCampaignProgress(baseCampaign, submissions);
    expect(progress.remainingCount).toBe(0);
    expect(isCampaignFulfilled(baseCampaign, submissions)).toBe(true);
  });
});
