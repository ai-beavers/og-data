import { AppText } from '@/shared/ui/AppText';
import { Card } from '@/shared/ui/Card';
import { Screen } from '@/shared/ui/Screen';

interface PlaceholderScreenProps {
  title: string;
  deliverable: string;
  owner: 'Machine A — capture side' | 'Machine B — post-submit side';
}

/** Temporary stand-in for unbuilt feature screens. Delete as features land. */
export function PlaceholderScreen({ title, deliverable, owner }: PlaceholderScreenProps) {
  return (
    <Screen>
      <AppText variant="title">{title}</AppText>
      <Card>
        <AppText>{deliverable}</AppText>
        <AppText variant="caption" muted>
          Owner: {owner}
        </AppText>
      </Card>
    </Screen>
  );
}
