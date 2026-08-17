import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getLocalDateString } from '@/features/health/utils/date';

import { getAnalyticsRanges, type AnalyticsPeriod } from '../utils/dateRanges';
import { computeAnalytics } from '../utils/computeAnalytics';
import { fetchAnalyticsBundle } from './fetchAnalyticsBundle';
import { analyticsKeys } from './queryKeys';

export function useAnalytics(period: AnalyticsPeriod = 'week') {
  const today = getLocalDateString();

  const query = useQuery({
    queryKey: analyticsKeys.bundle(today),
    queryFn: () => fetchAnalyticsBundle(today),
    staleTime: 30_000,
  });

  const analytics = useMemo(() => {
    if (!query.data) return null;
    return computeAnalytics({ ...query.data, period });
  }, [query.data, period]);

  return {
    analytics,
    period,
    ranges: query.data?.ranges ?? getAnalyticsRanges(today),
    isLoading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
