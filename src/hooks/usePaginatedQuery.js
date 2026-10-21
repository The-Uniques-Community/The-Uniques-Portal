/**
 * @file usePaginatedQuery.js
 * @description Centralized, stable pagination, search, filter, and sort hook.
 * Fully decoupled from URLSearchParams to eliminate React Router infinite re-render loops.
 * Guarantees loading state resolution and race condition safety via AbortController.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import apiClient from '@/services/apiClient';

/**
 * Normalizes backend response variations into a standard shape.
 */
const normalizeResponse = (response, limit = 10, page = 1, customTransformer = null) => {
  if (customTransformer) {
    return customTransformer(response);
  }

  let items = [];
  let total = 0;

  if (Array.isArray(response)) {
    items = response;
    total = response.length;
  } else if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) {
      items = response.data;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else if (response.data && Array.isArray(response.data.members)) {
      items = response.data.members;
      total = response.pagination?.total ?? response.data.count ?? response.data.total ?? items.length;
    } else if (response.data && Array.isArray(response.data.data)) {
      items = response.data.data;
      total = response.pagination?.total ?? response.data.count ?? response.data.total ?? items.length;
    } else if (Array.isArray(response.leaves)) {
      items = response.leaves;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else if (Array.isArray(response.projects)) {
      items = response.projects;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else if (Array.isArray(response.trainers)) {
      items = response.trainers;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else if (Array.isArray(response.tasks)) {
      items = response.tasks;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else if (Array.isArray(response.members)) {
      items = response.members;
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    } else {
      const arrayField = Object.values(response).find((val) => Array.isArray(val));
      items = arrayField || [];
      total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
    }
  }

  const safeLimit = Math.max(1, limit || 10);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    items,
    pagination: {
      total,
      page,
      limit: safeLimit,
      pages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const usePaginatedQuery = ({
  query,
  defaultLimit = 10,
  defaultPage = 1,
  defaultFilters = {},
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  debounceMs = 350,
  transformResponse = null,
  dependencies = [],
}) => {
  // Store dynamic references in refs so inline function definitions do NOT trigger re-fetches
  const queryRef = useRef(query);
  queryRef.current = query;

  const transformResponseRef = useRef(transformResponse);
  transformResponseRef.current = transformResponse;

  const defaultFiltersRef = useRef(defaultFilters);

  // Core state strictly in React state
  const [page, setPageState] = useState(defaultPage);
  const [limit, setLimitState] = useState(defaultLimit);
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFiltersState] = useState(defaultFilters);
  const [sortBy, setSortByState] = useState(defaultSortBy);
  const [sortOrder, setSortOrderState] = useState(defaultSortOrder);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [pagination, setPagination] = useState({
    total: 0,
    page: defaultPage,
    limit: defaultLimit,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const hasMountedRef = useRef(false);

  // Debounce search input changes (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Reset to page 1 whenever debouncedSearch changes (after initial mount)
  useEffect(() => {
    if (!hasMountedRef.current) return;
    setPageState(1);
  }, [debouncedSearch]);

  // Memoize filters into a stable JSON string to prevent reference mismatch re-triggers
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  // Track dependencies via stable key
  const depsKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);

  // Primary Data Fetching Effect: depends ONLY on stable primitive strings and numbers
  useEffect(() => {
    // Abort previous in-flight request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    const queryParams = {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      sortBy,
      order: sortOrder,
      ...filters,
    };

    // Clean up empty params
    Object.keys(queryParams).forEach((key) => {
      const val = queryParams[key];
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        val === 'all' ||
        val === 'All' ||
        val === 'All Batches'
      ) {
        delete queryParams[key];
      }
    });

    const executeFetch = async () => {
      try {
        let rawResult;
        const activeQuery = queryRef.current;

        if (typeof activeQuery === 'function') {
          rawResult = await activeQuery({
            ...queryParams,
            signal: abortController.signal,
          });
        } else if (typeof activeQuery === 'string') {
          const res = await apiClient.get(activeQuery, {
            params: queryParams,
            signal: abortController.signal,
          });
          rawResult = res.data;
        } else {
          throw new Error('usePaginatedQuery: query must be a function or endpoint string');
        }

        if (!isMountedRef.current || abortController.signal.aborted) {
          return;
        }

        const { items, pagination: normPagination } = normalizeResponse(
          rawResult,
          limit,
          page,
          transformResponseRef.current
        );

        setData(items);
        setPagination(normPagination);
        setError(null);
      } catch (err) {
        if (
          !isMountedRef.current ||
          err?.name === 'CanceledError' ||
          err?.name === 'AbortError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return;
        }
        console.error('[usePaginatedQuery] Request failed:', err);
        setError(err?.message || 'Failed to fetch paginated data');
        setData([]);
      } finally {
        // ALWAYS reset loading state when active request completes
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    executeFetch();

    return () => {
      abortController.abort();
    };
  }, [
    page,
    limit,
    debouncedSearch,
    filterKey,
    sortBy,
    sortOrder,
    refreshTrigger,
    depsKey,
  ]);

  // Track component mount status
  useEffect(() => {
    hasMountedRef.current = true;
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Stabilized Action Callbacks
  const handlePageChange = useCallback((newPage) => {
    setPageState(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchState(value);
  }, []);

  const handleFilterChange = useCallback((keyOrUpdater, value) => {
    setFiltersState((prev) => {
      if (typeof keyOrUpdater === 'function') {
        return keyOrUpdater(prev);
      }
      return { ...prev, [keyOrUpdater]: value };
    });
    setPageState(1);
  }, []);

  const handleSortingChange = useCallback((newSortBy, newSortOrder) => {
    setSortByState(newSortBy);
    setSortOrderState(newSortOrder || 'desc');
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchState('');
    setDebouncedSearch('');
    setFiltersState(defaultFiltersRef.current || {});
    setPageState(1);
  }, []);

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    limit,
    search,
    debouncedSearch,
    filters,
    sortBy,
    sortOrder,
    pagination,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    setSearch: handleSearchChange,
    setFilters: setFiltersState,
    setFilter: handleFilterChange,
    setSorting: handleSortingChange,
    resetFilters,
    refetch,
  };
};

export default usePaginatedQuery;
