import type {
  Campaign,
  CampaignProgress,
  ChallengeProgress,
  ContributorProgress,
  EarningsSummary,
  GeoPoint,
  LeaderboardEntry,
  NewCampaignInput,
  NewSubmissionInput,
  Opportunity,
  ReviewDecision,
  Submission,
} from '@/shared/types';

/**
 * The API surface both workstreams build against. The MVP runs entirely on
 * the mock implementation; a real backend swaps in behind this interface.
 */
export interface ApiClient {
  // Contributor — capture side (Machine A)
  listOpportunities(params?: { near?: GeoPoint }): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | null>;

  // Contributor — post-submit side (Machine B)
  createSubmission(input: NewSubmissionInput): Promise<Submission>;
  listSubmissions(contributorId: string): Promise<Submission[]>;
  getEarnings(contributorId: string): Promise<EarningsSummary>;

  // Operator — internal review (Machine B)
  listReviewQueue(): Promise<Submission[]>;
  reviewSubmission(submissionId: string, decision: ReviewDecision): Promise<Submission>;

  // Contributor — game layer (Post-MVP P1)
  getContributorProgress(contributorId: string): Promise<ContributorProgress>;
  /** Challenges whose window includes "now", with the contributor's progress. */
  listChallenges(contributorId: string): Promise<ChallengeProgress[]>;
  getLeaderboard(contributorId: string): Promise<LeaderboardEntry[]>;

  // Operator/buyer — data request campaigns (Post-MVP P2)
  createCampaign(input: NewCampaignInput): Promise<Campaign>;
  listCampaigns(): Promise<Campaign[]>;
  getCampaignProgress(campaignId: string): Promise<CampaignProgress>;
}
