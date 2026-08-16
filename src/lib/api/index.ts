import { API_ENDPOINTS } from './endpoints';

export { publicApi, authApi } from './simpleApi';
export const {
  AUTH,
  TASKS,
  GOALS,
  WEALTH,
  TIME_TRACK,
  HABITS,
  HEALTH,
  NOTES,
  ASSISTANT,
} = API_ENDPOINTS;
export * from './wealth';
export * from './user';
export * from './assistant';
export * from './tasks';
export * from './goals';
export * from './notes';
export * from './habits';
export * from './health';
export * from './timeTrack';
export * from './insights';
