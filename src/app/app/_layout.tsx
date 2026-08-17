import { Slot } from 'expo-router';

import { AppShell } from '@/features/app/AppShell';
import { TimeTrackProvider } from '@/features/time-track/context/TimeTrackProvider';

export default function AppGroupLayout() {
  return (
    <TimeTrackProvider>
      <AppShell>
        <Slot />
      </AppShell>
    </TimeTrackProvider>
  );
}
