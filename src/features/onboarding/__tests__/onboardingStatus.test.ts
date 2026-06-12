import { hasSeenOnboarding, markOnboardingSeen } from '@/features/onboarding/onboardingStatus';

describe('onboarding status', () => {
  it('is unseen by default and seen after completion', async () => {
    expect(await hasSeenOnboarding()).toBe(false);
    await markOnboardingSeen();
    expect(await hasSeenOnboarding()).toBe(true);
  });
});
