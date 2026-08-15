import { API_ENDPOINTS } from './endpoints';

export { publicApi, authApi } from './simpleApi';
export const { AUTH, TASKS, GOALS, WEALTH, TIME_TRACK, HEALTH, NOTES, ASSISTANT } =
  API_ENDPOINTS;
export * from './wealth';
export * from './user';
export * from './assistant';
