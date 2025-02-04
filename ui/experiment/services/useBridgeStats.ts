import { useState, useEffect } from 'react';
import { GraphQLClient } from 'graphql-request';
import type { DailyBridgeStat, BridgeStatsResponse } from './types';
import { DAILY_STATS_QUERY } from './types';

const createClient = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${ baseUrl }/experiment/api/experiment-graphql/`;
  return new GraphQLClient(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

interface UseBridgeStatsParams {
  startDate: string;
  endDate: string;
  chainFilter: string;
  eventTypeFilter: string;
}

interface UseBridgeStatsResult {
  data: DailyBridgeStat[];
  isLoading: boolean;
  error: Error | null;
}

export const useBridgeStats = ({
  startDate,
  endDate,
  chainFilter,
  eventTypeFilter,
}: UseBridgeStatsParams): UseBridgeStatsResult => {
  const [ data, setData ] = useState<DailyBridgeStat[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async() => {
      try {
        setIsLoading(true);
        const client = createClient();

        const requestParams = {
          first: 1000,
          orderBy: 'date',
          orderDirection: 'desc',
          startDate,
          endDate,
        };

        const response = await client.request<BridgeStatsResponse>(DAILY_STATS_QUERY, requestParams);

        if ('message' in response) {
          console.error('[Frontend] API returned an error response:', response);
          throw new Error(typeof response.message === 'string' ? response.message : 'API returned an error');
        }

        if (!response.dailyBridgeStats) {
          console.error('[Frontend] Response does not contain dailyBridgeStats:', response);
          setData([]);
          return;
        }

        let filteredData = response.dailyBridgeStats;

        if (chainFilter !== 'all') {
          filteredData = filteredData.filter(item => item.chainName === chainFilter);
        }

        if (eventTypeFilter !== 'all') {
          filteredData = filteredData.filter(item => item.eventType === eventTypeFilter);
        }

        setData(filteredData);
        setError(null);
      } catch (err) {
        console.error('[Frontend] GraphQL request failed:', {
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack,
          } : err,
        });
        setError(err instanceof Error ? err : new Error('Failed to fetch bridge stats'));
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ startDate, endDate, chainFilter, eventTypeFilter ]);

  return { data, isLoading, error };
}; 