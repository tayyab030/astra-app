export const ROUTES = {
  AUTH: {
    LOGIN: '/',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
  },
  APP: {
    DASHBOARD: '/app/dashboard',
  },
} as const;
