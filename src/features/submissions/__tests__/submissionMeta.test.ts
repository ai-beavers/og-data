import {
  formatMoney,
  formatMoneyRange,
  formatSubmittedAt,
  REJECTION_REASON_COPY,
  SUBMISSION_STATUS_META,
} from '@/features/submissions/submissionMeta';
import type { RejectionReason, SubmissionStatus } from '@/shared/types';

describe('submissionMeta', () => {
  it('formats cents as dollars', () => {
    expect(formatMoney({ cents: 90, currency: 'USD' })).toBe('$0.90');
    expect(formatMoney({ cents: 1250, currency: 'USD' })).toBe('$12.50');
    expect(formatMoney({ cents: 0, currency: 'USD' })).toBe('$0.00');
  });

  it('formats reward ranges', () => {
    expect(
      formatMoneyRange({ cents: 50, currency: 'USD' }, { cents: 150, currency: 'USD' }),
    ).toBe('$0.50 – $1.50');
  });

  it('produces a readable submitted-at string', () => {
    expect(formatSubmittedAt('2026-06-10T17:05:00Z')).toEqual(expect.any(String));
    expect(formatSubmittedAt('2026-06-10T17:05:00Z').length).toBeGreaterThan(0);
  });

  it('covers every submission status with label, color, and hint', () => {
    const statuses: SubmissionStatus[] = [
      'pending_review',
      'accepted',
      'needs_retry',
      'rejected',
    ];
    for (const status of statuses) {
      const meta = SUBMISSION_STATUS_META[status];
      expect(meta.label).toBeTruthy();
      expect(meta.color).toMatch(/^#/);
      expect(meta.hint).toBeTruthy();
    }
  });

  it('covers every rejection reason with plain-language copy', () => {
    const reasons: RejectionReason[] = [
      'missing_angles',
      'blurry',
      'poor_lighting',
      'duplicate',
      'unsupported_subject',
    ];
    for (const reason of reasons) {
      expect(REJECTION_REASON_COPY[reason]).toBeTruthy();
    }
  });
});
