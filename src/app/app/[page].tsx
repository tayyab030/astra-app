import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';

/** Fallback for unknown `/app/*` segments — all main modules have dedicated routes. */
export default function AppSectionPage() {
  return <Redirect href={ROUTES.APP.DASHBOARD} />;
}
