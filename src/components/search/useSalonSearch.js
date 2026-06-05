import React from 'react';
import { searchVenues } from '@/services/search/searchService';

export default function useSalonSearch({
  initialVenues = [],
  initialMeta = null,
  initialLocationLabel = '',
  initialLocationLat = null,
  initialLocationLon = null,
  initialDistance = '50mi',
  initialQuery = '',
  scrollContainerRef = null,
}) {
  const [displayedVenues, setDisplayedVenues] = React.useState(initialVenues || []);
  const [totalVenues, setTotalVenues] = React.useState(initialMeta?.total ?? 0);
  const [page, setPage] = React.useState(initialMeta?.current_page ?? 1);
  const [hasMore, setHasMore] = React.useState((initialMeta?.current_page ?? 1) < (initialMeta?.last_page ?? 1));
  const [loading, setLoading] = React.useState(false);

  const [query, setQuery] = React.useState(initialQuery || '');
  const [distance, setDistance] = React.useState(initialDistance || '50mi');
  const [selectedLocation, setSelectedLocation] = React.useState(
    Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
      ? { lat: initialLocationLat, lon: initialLocationLon, address: initialLocationLabel }
      : null
  );

  const pageRef = React.useRef(page);
  const loadedPagesRef = React.useRef(new Set([initialMeta?.current_page ?? 1]));
  const hasMoreRef = React.useRef(hasMore);
  const loadingRef = React.useRef(loading);
  const distanceRef = React.useRef(distance);
  const selectedLocationRef = React.useRef(selectedLocation);
  const queryRef = React.useRef(query);
  const lastLoadMoreTimeRef = React.useRef(0);
  const isFreshSearchRef = React.useRef(true); // prevent immediate loadMore

  const loadMoreRef = React.useRef(null);

  // keep refs in sync
  React.useEffect(() => { pageRef.current = page; }, [page]);
  React.useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  React.useEffect(() => { loadingRef.current = loading; }, [loading]);
  React.useEffect(() => { distanceRef.current = distance; }, [distance]);
  React.useEffect(() => { selectedLocationRef.current = selectedLocation; }, [selectedLocation]);
  React.useEffect(() => { queryRef.current = query; }, [query]);

  const buildParamsForPage = (pageNum) => {
    const locationToUse = selectedLocationRef.current || (
      Number.isFinite(initialLocationLat) && Number.isFinite(initialLocationLon)
        ? { lat: initialLocationLat, lon: initialLocationLon }
        : null
    );
    const params = { page: pageNum };
    if (locationToUse?.lat) params.lat = locationToUse.lat;
    if (locationToUse?.lon) params.lon = locationToUse.lon;
    if (distanceRef.current) params.distance = distanceRef.current;
    if (queryRef.current) params.q = queryRef.current;
    return params;
  };

  const fetchPage = React.useCallback(async (pageNum, { replace = true } = {}) => {
    if (loadingRef.current) return null;
    // Skip fetching a page we've already loaded from SSR or earlier
    if (!replace && loadedPagesRef.current.has(pageNum)) {
      // eslint-disable-next-line no-console
      console.debug('[useSalonSearch] Skipping fetch for already-loaded page', pageNum);
      return null;
    }
    setLoading(true);
    try {
      const params = buildParamsForPage(pageNum);
      const res = await searchVenues(params);
      const data = res.data || [];
      if (replace) {
        setDisplayedVenues(data);
        // reset loaded pages to the new initial page (1)
        loadedPagesRef.current = new Set([1]);
      } else {
        setDisplayedVenues((prev) => {
          const existing = new Set(prev.map(v => v.uuid));
          const newUnique = data.filter(v => !existing.has(v.uuid));
          return [...prev, ...newUnique];
        });
        // mark this page as loaded
        loadedPagesRef.current.add(pageNum);
      }
      const meta = res.meta || {};
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[useSalonSearch] response.meta:', meta);
      }

      // If meta present, use it to update totals/hasMore safely
      const respTotal = (meta && typeof meta.total === 'number') ? meta.total : null;
      const respCurrent = (meta && Number.isFinite(Number(meta.current_page))) ? Number(meta.current_page) : null;
      const respLast = (meta && Number.isFinite(Number(meta.last_page))) ? Number(meta.last_page) : null;

      // If API reports current_page > last_page, treat as no-more-results
      if (respCurrent !== null && respLast !== null && respCurrent > respLast) {
        if (respTotal !== null) setTotalVenues(respTotal);
        setHasMore(false);
        if (replace) {
          setDisplayedVenues(data);
          setPage(1);
        }
        return res;
      }

      if (respTotal !== null) {
        setTotalVenues(respTotal);
      }

      if (respCurrent !== null && respLast !== null) {
        setHasMore(respCurrent < respLast);
      }

      setPage(pageNum);
      return res;
    } catch (e) {
      console.error('[useSalonSearch] fetchPage failed', e);
      if (replace) {
        setDisplayedVenues([]);
        setTotalVenues(0);
        setHasMore(false);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [initialLocationLat, initialLocationLon]);

  const handleDistanceChange = React.useCallback(async (newDistance) => {
    setDistance(newDistance);
    isFreshSearchRef.current = true;
    lastLoadMoreTimeRef.current = 0;
    await fetchPage(1, { replace: true });
  }, [fetchPage]);

  const handleLocationChange = React.useCallback(async (loc) => {
    setSelectedLocation(loc);
    isFreshSearchRef.current = true;
    lastLoadMoreTimeRef.current = 0;
    await fetchPage(1, { replace: true });
  }, [fetchPage]);

  const handleQueryChange = React.useCallback(async (q) => {
    setQuery(q);
    isFreshSearchRef.current = true;
    lastLoadMoreTimeRef.current = 0;
    await fetchPage(1, { replace: true });
  }, [fetchPage]);

  const loadMore = React.useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    if (nextPage <= 1) return;
    const now = Date.now();
    if (now - lastLoadMoreTimeRef.current < 800) return; // throttle
    lastLoadMoreTimeRef.current = now;
    await fetchPage(nextPage, { replace: false });
  }, [fetchPage]);

  // NOTE: Infinite-scroll observer removed — loading more is now manual via `loadMore()`

  return {
    displayedVenues,
    totalVenues,
    page,
    hasMore,
    loading,
    query,
    distance,
    selectedLocation,
    loadMoreRef,
    fetchPage,
    loadMore,
    handleDistanceChange,
    handleLocationChange,
    handleQueryChange,
    setSelectedLocation,
    setQuery,
    setDistance,
  };
}
