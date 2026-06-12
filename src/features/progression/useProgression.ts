import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { api } from '@/shared/api';
import type {
  ChallengeProgress,
  ContributorProgress,
  LeaderboardEntry,
} from '@/shared/types';

interface ProgressionState {
  progress: ContributorProgress | null;
  challenges: ChallengeProgress[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

/**
 * P1 — loads the contributor's game state (progress, active challenges,
 * leaderboard) and refreshes whenever the Progress tab regains focus, so new
 * submissions and review outcomes show up immediately.
 */
export function useProgression(contributorId: string): ProgressionState {
  const [state, setState] = useState<ProgressionState>({
    progress: null,
    challenges: [],
    leaderboard: [],
    loading: true,
  });

  const reload = useCallback(() => {
    let cancelled = false;
    Promise.all([
      api.getContributorProgress(contributorId),
      api.listChallenges(contributorId),
      api.getLeaderboard(contributorId),
    ]).then(([progress, challenges, leaderboard]) => {
      if (!cancelled) {
        setState({ progress, challenges, leaderboard, loading: false });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [contributorId]);

  useFocusEffect(reload);

  return state;
}
