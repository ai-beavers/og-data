import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { hasSeenOnboarding } from '@/features/onboarding/onboardingStatus';

/** Entry: contributors see onboarding once, then land on opportunities (M2). */
export default function Index() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setSeen);
  }, []);

  if (seen === null) {
    return null; // Splash screen covers the storage read.
  }
  return <Redirect href={seen ? '/(tabs)' : '/onboarding'} />;
}
