/**
 * @file usePaginatedQuery.js
 * @description Centralized pagination, search, filter, and sort hook.
 * Handles AbortController race condition cancellation, debounced search (350ms),
 * auto-reset page to 1 on filter/search change, URL search params synchronization,
 * and normalized response parsing across varied backend endpoints.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/services/apiClient';

export const usePaginatedQuery = ({
  query,
  defaultLimit = 10,
  defaultPage = 1,
  defaultFilters = {},
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc',
  debounceMs = 350,
  syncUrlParams = false,
  transformResponse = null,
  dependencies = [],
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = useMemo(() => {
    if (syncUrlParams) {
      const p = parseInt(searchParams.get('page'), 10);
      return !isNaN(p) && p > 0 ? p : defaultPage;
    }
    return defaultPage;
  }, [syncUrlParams, searchParams, defaultPage]);

  const initialLimit = useMemo(() => {
    if (syncUrlParams) {
      const l = parseInt(searchParams.get('limit'), 10);
      return !isNaN(l) && l > 0 ? l : defaultLimit;
    }
    return defaultLimit;
  }, [syncUrlParams, searchParams, defaultLimit]);

  const initialSearch = useMemo(() => {
    if (syncUrlParams) {
      return searchParams.get('search') || '';
    }
    return '';
  }, [syncUrlParams, searchParams]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [search, setSearchState] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filters, setFiltersState] = useState(defaultFilters);
  const [sortBy, setSortByState] = useState(defaultSortBy);
  const [sortOrder, setSortOrderState] = useState(defaultSortOrder);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    pages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const abortControllerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [search, debounceMs]);

  // Auto-reset page to 1 when debounced search changes
  useEffect(() => {
    if (isFirstRender.current) return;
    setPageState(1);
  }, [debouncedSearch]);

  // URL search params sync
  useEffect(() => {
    if (!syncUrlParams) return;

    const newParams = new URLSearchParams(searchParams);

    if (page > 1) newParams.set('page', String(page));
    else newParams.delete('page');

    if (limit !== defaultLimit) newParams.set('limit', String(limit));
    else newParams.delete('limit');

    if (debouncedSearch && debouncedSearch.trim()) newParams.set('search', debouncedSearch.trim());
    else newParams.delete('search');

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all' && val !== 'All' && val !== 'All Batches') {
        newParams.set(key, String(val));
      } else {
        newParams.delete(key);
      }
    });

    if (sortBy !== defaultSortBy) newParams.set('sortBy', sortBy);
    else newParams.delete('sortBy');

    if (sortOrder !== defaultSortOrder) newParams.set('sortOrder', sortOrder);
    else newParams.delete('sortOrder');

    setSearchParams(newParams, { replace: true });
  }, [page, limit, debouncedSearch, filters, sortBy, sortOrder, syncUrlParams]);

  // Normalize API responses
  const normalizeResponse = useCallback(
    (response) => {
      if (transformResponse) {
        return transformResponse(response);
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
          total = response.data.count ?? response.data.total ?? items.length;
        } else if (response.data && Array.isArray(response.data.data)) {
          items = response.data.data;
          total = response.data.count ?? response.data.total ?? items.length;
        } else if (Array.isArray(response.leaves)) {
          items = response.leaves;
          total = response.count ?? response.total ?? items.length;
        } else if (Array.isArray(response.projects)) {
          items = response.projects;
          total = response.count ?? response.total ?? items.length;
        } else if (Array.isArray(response.trainers)) {
          items = response.trainers;
          total = response.count ?? response.total ?? items.length;
        } else if (Array.isArray(response.tasks)) {
          items = response.tasks;
          total = response.count ?? response.total ?? items.length;
        } else {
          const arrayField = Object.values(response).find((val) => Array.isArray(val));
          items = arrayField || [];
          total = response.count || response.total || items.length;
        }
      }

      const totalPages = Math.max(1, Math.ceil(total / (limit || 10)));

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          pages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    [transformResponse, limit, page]
  );

  // Core execution with AbortController
  const executeQuery = useCallback(async () => {
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

    Object.keys(queryParams).forEach((key) => {
      if (
        queryParams[key] === undefined ||
        queryParams[key] === null ||
        queryParams[key] === '' ||
        queryParams[key] === 'all' ||
        queryParams[key] === 'All' ||
        queryParams[key] === 'All Batches'
      ) {
        delete queryParams[key];
      }
    });

    try {
      let rawResult;
      if (typeof query === 'function') {
        rawResult = await query({
          ...queryParams,
          signal: abortController.signal,
        });
      } else if (typeof query === 'string') {
        const res = await apiClient.get(query, {
          params: queryParams,
          signal: abortController.signal,
        });
        rawResult = res.data;
      } else {
        throw new Error('usePaginatedQuery: query must be a function or endpoint string');
      }

      const { items, pagination: normPagination } = normalizeResponse(rawResult);
      setData(items);
      setPagination(normPagination);
      setError(null);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      console.error('[usePaginatedQuery] Failed:', err);
      setError(err?.message || 'Failed to fetch paginated data');
      setData([]);
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [query, page, limit, debouncedSearch, filters, sortBy, sortOrder, normalizeResponse]);

  useEffect(() => {
    executeQuery();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeQuery, ...dependencies]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

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
    setFiltersState(defaultFilters);
    setPageState(1);
  }, [defaultFilters]);

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
    refetch: executeQuery,
  };
};

export default usePaginatedQuery;
