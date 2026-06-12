import {
  campaignToOpportunity,
  computeCampaignProgress,
  isCampaignFulfilled,
} from '@/features/campaigns/campaignLogic';
import {
  computeChallengeProgress,
  computeContributorProgress,
  isChallengeActive,
} from '@/features/progression/progressionLogic';
import type { ApiClient } from '@/shared/api/client';
import type {
  Campaign,
  CampaignProgress,
  Challenge,
  ChallengeProgress,
  ContributorProgress,
  EarningsSummary,
  LeaderboardEntry,
  MoneyAmount,
  NewCampaignInput,
  NewSubmissionInput,
  Opportunity,
  ReviewDecision,
  Submission,
} from '@/shared/types';

const ZERO_USD: MoneyAmount = { cents: 0, currency: 'USD' };

function sumCents(amounts: MoneyAmount[]): MoneyAmount {
  return {
    cents: amounts.reduce((total, a) => total + a.cents, 0),
    currency: 'USD',
  };
}

/** Leaderboard peers before rank/current-user resolution. */
type LeaderboardSeed = Omit<LeaderboardEntry, 'rank' | 'isCurrentUser'>;

interface MockSeed {
  opportunities?: Opportunity[];
  submissions?: Submission[];
  campaigns?: Campaign[];
  challenges?: Challenge[];
  leaderboard?: LeaderboardSeed[];
}

/**
 * In-memory ApiClient used by both workstreams during the MVP and Post-MVP.
 * Seed it with fixtures (see src/testing/fixtures) so each feature can work
 * against realistic data. Game-layer and campaign reads are computed from
 * submission history via the pure logic modules in features/.
 */
export class MockApiClient implements ApiClient {
  private opportunities: Opportunity[];
  private submissions: Submission[];
  private campaigns: Campaign[];
  private challenges: Challenge[];
  private leaderboardSeed: LeaderboardSeed[];
  private nextId = 1;
  private nextCampaignId = 1;

  constructor(seed?: MockSeed) {
    this.opportunities = [...(seed?.opportunities ?? [])];
    this.submissions = [...(seed?.submissions ?? [])];
    this.campaigns = [...(seed?.campaigns ?? [])];
    this.challenges = [...(seed?.challenges ?? [])];
    this.leaderboardSeed = [...(seed?.leaderboard ?? [])];
  }

  async listOpportunities(): Promise<Opportunity[]> {
    // Active campaigns surface as ordinary opportunities (P2); contributors
    // never see the campaign behind them. Location sorting stays client-side.
    const fromCampaigns = this.campaigns
      .filter((c) => c.status === 'active')
      .map(campaignToOpportunity);
    return [...this.opportunities, ...fromCampaigns];
  }

  async getOpportunity(id: string): Promise<Opportunity | null> {
    const all = await this.listOpportunities();
    return all.find((o) => o.id === id) ?? null;
  }

  async createSubmission(input: NewSubmissionInput): Promise<Submission> {
    const submission: Submission = {
      ...input,
      id: `sub_${this.nextId++}`,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
    };
    this.submissions.push(submission);
    return submission;
  }

  async listSubmissions(contributorId: string): Promise<Submission[]> {
    return this.submissions.filter((s) => s.contributorId === contributorId);
  }

  async getEarnings(contributorId: string): Promise<EarningsSummary> {
    const rewards = this.submissions
      .filter((s) => s.contributorId === contributorId && s.reward)
      .map((s) => s.reward!);
    const pending = rewards.filter((r) => r.status === 'pending');
    return {
      totalEarned: rewards.length ? sumCents(rewards.map((r) => r.amount)) : ZERO_USD,
      pending: pending.length ? sumCents(pending.map((r) => r.amount)) : ZERO_USD,
      rewards,
    };
  }

  async listReviewQueue(): Promise<Submission[]> {
    return this.submissions.filter((s) => s.status === 'pending_review');
  }

  async reviewSubmission(submissionId: string, decision: ReviewDecision): Promise<Submission> {
    const submission = this.submissions.find((s) => s.id === submissionId);
    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`);
    }
    switch (decision.outcome) {
      case 'accept':
        submission.status = 'accepted';
        submission.reward = {
          submissionId,
          amount: decision.reward,
          status: 'pending',
        };
        submission.rejectionReason = undefined;
        this.completeFulfilledCampaigns();
        break;
      case 'needs_retry':
        submission.status = 'needs_retry';
        submission.rejectionReason = decision.reason;
        break;
      case 'reject':
        submission.status = 'rejected';
        submission.rejectionReason = decision.reason;
        break;
      default: {
        const exhaustive: never = decision;
        throw new Error(`Unhandled review outcome: ${JSON.stringify(exhaustive)}`);
      }
    }
    submission.reviewNote = decision.reviewNote;
    return submission;
  }

  // --- Post-MVP P1: game layer -------------------------------------------

  async getContributorProgress(contributorId: string): Promise<ContributorProgress> {
    return computeContributorProgress(contributorId, this.submissions, new Date());
  }

  async listChallenges(contributorId: string): Promise<ChallengeProgress[]> {
    const own = this.submissions.filter((s) => s.contributorId === contributorId);
    const now = new Date();
    return this.challenges
      .filter((c) => isChallengeActive(c, now))
      .map((c) => computeChallengeProgress(c, own));
  }

  async getLeaderboard(contributorId: string): Promise<LeaderboardEntry[]> {
    const acceptedCount = this.submissions.filter(
      (s) => s.contributorId === contributorId && s.status === 'accepted',
    ).length;
    const merged: LeaderboardSeed[] = [
      ...this.leaderboardSeed.filter((e) => e.contributorId !== contributorId),
      { contributorId, displayName: 'You', acceptedCount },
    ];
    return merged
      .sort((a, b) => b.acceptedCount - a.acceptedCount)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.contributorId === contributorId,
      }));
  }

  // --- Post-MVP P2: data request campaigns --------------------------------

  async createCampaign(input: NewCampaignInput): Promise<Campaign> {
    const campaign: Campaign = {
      ...input,
      id: `camp_new_${this.nextCampaignId++}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  async listCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns];
  }

  async getCampaignProgress(campaignId: string): Promise<CampaignProgress> {
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }
    return computeCampaignProgress(campaign, this.submissions);
  }

  /** Campaigns auto-complete once accepted submissions reach their target. */
  private completeFulfilledCampaigns(): void {
    for (const campaign of this.campaigns) {
      if (campaign.status === 'active' && isCampaignFulfilled(campaign, this.submissions)) {
        campaign.status = 'completed';
      }
    }
  }
}
