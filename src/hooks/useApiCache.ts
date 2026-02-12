import { useState, useCallback, useRef, useEffect } from "react";
import { cache, CacheTTL } from "../lib/cache";

interface UseApiCacheOptions<T> {
  /** Cache key prefix */
  cacheKey: string;
  /** Time-to-live in milliseconds */
  ttl?: number;
  /** Initial data before fetch */
  initialData?: T;
  /** Whether to fetch immediately on mount */
  fetchOnMount?: boolean;
  /** Dependencies that trigger a refetch when changed */
  deps?: unknown[];
}

interface UseApiCacheResult<T, TParams extends unknown[]> {
  /** The cached or fetched data */
  data: T | null;
  /** Whether the API call is in progress */
  isLoading: boolean;
  /** Error message if the call failed */
  error: string | null;
  /** Function to manually trigger a fetch */
  fetch: (...params: TParams) => Promise<T | null>;
  /** Function to refetch with the last used parameters */
  refetch: () => Promise<T | null>;
  /** Function to clear the cache for this key */
  clearCache: () => void;
  /** Whether data came from cache */
  isFromCache: boolean;
  /** Timestamp of last successful fetch */
  lastFetchedAt: Date | null;
}

/**
 * Custom hook for caching API responses in React components.
 * Provides loading states, error handling, and automatic cache management.
 *
 * @example
 * const { data, isLoading, error, fetch } = useApiCache({
 *   cacheKey: 'skills-analysis',
 *   ttl: CacheTTL.MEDIUM,
 * });
 *
 * const handleAnalyze = async () => {
 *   const result = await fetch(analyzeSkillsGap, skills, targetRole);
 *   // result is now cached
 * };
 */
export function useApiCache<T, TParams extends unknown[] = []>(
  apiFunction: (...params: TParams) => Promise<T>,
  options: UseApiCacheOptions<T>,
): UseApiCacheResult<T, TParams> {
  const {
    cacheKey,
    ttl = CacheTTL.MEDIUM,
    initialData = null,
    fetchOnMount = false,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Store the last params for refetch
  const lastParamsRef = useRef<TParams | null>(null);

  // Generate cache key from parameters
  const generateKey = useCallback(
    (params: TParams): string => {
      const paramString = params
        .map((p) => {
          if (typeof p === "object" && p !== null) {
            return JSON.stringify(p);
          }
          return String(p);
        })
        .join("|");
      return `${cacheKey}:${paramString}`;
    },
    [cacheKey],
  );

  // Main fetch function
  const fetch = useCallback(
    async (...params: TParams): Promise<T | null> => {
      const key = generateKey(params);
      lastParamsRef.current = params;

      // Check cache first
      const cachedData = cache.get<T>(key);
      if (cachedData !== null) {
        setData(cachedData);
        setIsFromCache(true);
        setError(null);
        return cachedData;
      }

      setIsLoading(true);
      setError(null);
      setIsFromCache(false);

      try {
        const result = await apiFunction(...params);
        cache.set(key, result, { ttl });
        setData(result);
        setLastFetchedAt(new Date());
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, generateKey, ttl],
  );

  // Refetch with last params
  const refetch = useCallback(async (): Promise<T | null> => {
    if (lastParamsRef.current) {
      // Clear cache for this key first
      const key = generateKey(lastParamsRef.current);
      cache.delete(key);
      return fetch(...lastParamsRef.current);
    }
    return null;
  }, [fetch, generateKey]);

  // Clear cache for this key
  const clearCache = useCallback(() => {
    if (lastParamsRef.current) {
      const key = generateKey(lastParamsRef.current);
      cache.delete(key);
    }
    setData(null);
    setIsFromCache(false);
  }, [generateKey]);

  // Fetch on mount if requested
  useEffect(() => {
    if (fetchOnMount && lastParamsRef.current) {
      fetch(...lastParamsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, ...deps]);

  return {
    data,
    isLoading,
    error,
    fetch,
    refetch,
    clearCache,
    isFromCache,
    lastFetchedAt,
  };
}

/**
 * Simpler version for one-time fetches with caching
 */
export function useCachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {},
) {
  const { ttl = CacheTTL.MEDIUM, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      // Check cache first
      const cached = cache.get<T>(cacheKey);
      if (cached !== null) {
        setData(cached);
        return;
      }

      setIsLoading(true);
      try {
        const result = await fetcher();
        cache.set(cacheKey, result, { ttl });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cacheKey, enabled, fetcher, ttl]);

  return { data, isLoading, error };
}

export default useApiCache;
