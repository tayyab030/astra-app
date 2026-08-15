export type AuthUser = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  currency?: string;
  country?: string | null;
  timezone?: string;
  theme?: 'light' | 'dark' | 'neon';
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
};
