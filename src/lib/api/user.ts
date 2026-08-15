import { authApi } from './simpleApi';
import { API_ENDPOINTS } from './endpoints';

const { AUTH } = API_ENDPOINTS;

export type AuthTheme = 'light' | 'dark' | 'neon';

export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender: UserGender | string | null;
  currency: string;
  country: string | null;
  timezone: string;
  theme: AuthTheme | string;
}

export async function fetchCurrentUser() {
  const response = await authApi.get<CurrentUser>(AUTH.ME);
  return response.data;
}
