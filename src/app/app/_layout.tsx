import { Slot } from 'expo-router';

import { AppShell } from '@/features/app/AppShell';

export default function AppGroupLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
