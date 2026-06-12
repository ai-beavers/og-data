import type {
  EarningsSummary,
  GeoPoint,
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
}
