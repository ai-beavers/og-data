import { storage } from '@/shared/storage';

const SEEN_KEY = 'onboarding.seen';

/** Whether the contributor has completed onboarding (M2). */
export async function hasSeenOnboarding(): Promise<boolean> {
  return (await storage.get<boolean>(SEEN_KEY)) === true;
}

export async function markOnboardingSeen(): Promise<void> {
  await storage.set(SEEN_KEY, true);
}
