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
    TASKS: '/app/tasks',
    TIME_TRACK: '/app/time-track',
    GOALS: '/app/goals',
    WEALTH: '/app/wealth',
    HEALTH: '/app/health',
    HABITS: '/app/habits',
    NOTES: '/app/notes',
    ASSISTANT: '/app/assistant',
    COMMUNICATION: '/app/communication',
    ANALYTICS: '/app/analytics',
    LIFE_SCORE: '/app/life-score',
    SETTINGS: '/app/settings',
  },
} as const;
