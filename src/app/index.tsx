import { Redirect } from 'expo-router';

/** Entry: always onboard for now. Machine A adds "seen onboarding" logic in M2. */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
