import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';

export default function AppIndex() {
  return <Redirect href={ROUTES.APP.DASHBOARD} />;
}
