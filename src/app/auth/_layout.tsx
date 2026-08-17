import { Stack } from 'expo-router';

import { useAppTheme } from '@/features/theme/AppThemeProvider';

export default function AuthLayout() {
  const { tokens } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.background },
        animation: 'fade',
      }}
    />
  );
}
