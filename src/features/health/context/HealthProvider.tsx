import { createContext, useContext, type ReactNode } from 'react';

import { useHealth, type UseHealthReturn } from '../hooks/useHealth';

const HealthContext = createContext<UseHealthReturn | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const value = useHealth();
  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealthContext() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealthContext must be used within HealthProvider');
  return ctx;
}
