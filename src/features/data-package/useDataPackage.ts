import { useEffect, useState } from 'react';

import { buildDataPackage, type DataPackage } from '@/features/data-package/dataPackage';
import { api } from '@/shared/api';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

export type DataPackageStatus = 'loading' | 'not_found' | 'ready';

interface UseDataPackageResult {
  status: DataPackageStatus;
  dataPackage: DataPackage | null;
}

/**
 * Loads a submission (newly created or seeded) and derives its buyer-ready
 * data-package preview. Reads via `listSubmissions` so it touches no part of
 * the frozen API contract.
 */
export function useDataPackage(submissionId: string): UseDataPackageResult {
  const [status, setStatus] = useState<DataPackageStatus>('loading');
  const [dataPackage, setDataPackage] = useState<DataPackage | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const submissions = await api.listSubmissions(FIXTURE_CONTRIBUTOR_ID);
      const submission = submissions.find((s) => s.id === submissionId);
      if (!submission) {
        if (!cancelled) setStatus('not_found');
        return;
      }
      const opportunity = submission.opportunityId
        ? await api.getOpportunity(submission.opportunityId)
        : null;
      if (cancelled) return;
      setDataPackage(buildDataPackage(submission, opportunity));
      setStatus('ready');
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  return { status, dataPackage };
}
