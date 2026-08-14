import { useLocalSearchParams } from 'expo-router';

import { AppPlaceholder } from '@/features/app/AppPlaceholder';

const titles: Record<string, string> = {
  tasks: 'Tasks',
  'time-track': 'Time Track',
  goals: 'Goals',
  wealth: 'Wealth',
  health: 'Health',
  notes: 'Notes',
  assistant: 'Assistant',
  communication: 'Communication',
  analytics: 'Analytics',
  'life-score': 'Life Score',
  settings: 'Settings',
};

export default function AppSectionPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const key = Array.isArray(page) ? page[0] : page;

  return <AppPlaceholder title={titles[key] ?? 'Astra'} />;
}
