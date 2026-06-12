import type { ApiClient } from '@/shared/api/client';
import type {
  EarningsSummary,
  MoneyAmount,
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

/**
 * In-memory ApiClient used by both workstreams during the MVP.
 * Seed it with fixtures (see src/testing/fixtures) so each machine can work
 * without waiting on the other.
 */
export class MockApiClient implements ApiClient {
  private opportunities: Opportunity[];
  private submissions: Submission[];
  private nextId = 1;

  constructor(seed?: { opportunities?: Opportunity[]; submissions?: Submission[] }) {
    this.opportunities = [...(seed?.opportunities ?? [])];
    this.submissions = [...(seed?.submissions ?? [])];
  }

  async listOpportunities(): Promise<Opportunity[]> {
    // Location filtering is Machine A's M3 work; the mock returns everything.
    return [...this.opportunities];
  }

  async getOpportunity(id: string): Promise<Opportunity | null> {
    return this.opportunities.find((o) => o.id === id) ?? null;
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
}
