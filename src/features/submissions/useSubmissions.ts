import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { api } from '@/shared/api';
import type { Submission } from '@/shared/types';
import { FIXTURE_CONTRIBUTOR_ID } from '@/testing/fixtures/submissions';

interface SubmissionsState {
  submissions: Submission[];
  loading: boolean;
  reload: () => void;
}

/**
 * Loads the current contributor's submissions, newest first, and reloads on
 * screen focus so review decisions made elsewhere show up immediately.
 * Contributor identity is fixture-based until auth exists (Post-MVP).
 */
export function useSubmissions(): SubmissionsState {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listSubmissions(FIXTURE_CONTRIBUTOR_ID)
      .then((list) => {
        if (cancelled) return;
        setSubmissions(
          [...list].sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
          ),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(reload);

  return { submissions, loading, reload };
}
