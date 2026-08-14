export type AuthUser = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
};
