import { createContext, useContext, type ReactNode } from 'react';

import { useTimeTrackCore, type UseTimeTrackCoreReturn } from '../hooks/useTimeTrackCore';

const TimeTrackContext = createContext<UseTimeTrackCoreReturn | null>(null);

export function TimeTrackProvider({ children }: { children: ReactNode }) {
  const value = useTimeTrackCore();
  return <TimeTrackContext.Provider value={value}>{children}</TimeTrackContext.Provider>;
}

export function useTimeTrackContext() {
  const context = useContext(TimeTrackContext);
  if (!context) {
    throw new Error('useTimeTrackContext must be used within TimeTrackProvider');
  }
  return context;
}
