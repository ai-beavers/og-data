import { Tabs } from 'expo-router';

import { colors } from '@/shared/ui';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Opportunities' }} />
      <Tabs.Screen name="submissions" options={{ title: 'Submissions' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
    </Tabs>
  );
}
