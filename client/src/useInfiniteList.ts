import { useState, useCallback, useRef, useEffect } from "react";

interface UseInfiniteListOptions {
    fetchFn: (page: number, filter?: string) => Promise<{ items: number[]; page: number }>;
}

export function useInfiniteList({ fetchFn }: UseInfiniteListOptions) {
    const [items, setItems] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const filterRef = useRef(filter);
    const loadingRef = useRef(false);
    const pageRef = useRef(page);

    filterRef.current = filter;
    pageRef.current = page;

    const loadPage = useCallback(
        async (pageNum: number, currentFilter: string, append: boolean) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);

            try {
                const data = await fetchFn(pageNum, currentFilter || undefined);

                if (currentFilter !== filterRef.current) return;

                if (append) {
                    setItems((prev) => [...prev, ...data.items]);
                } else {
                    setItems(data.items);
                }

                setHasMore(data.items.length >= 20);
                setPage(pageNum);
            } catch (e) {
                console.error("Load error:", e);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [fetchFn]
    );

    useEffect(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);

        const timer = setTimeout(() => {
            loadPage(1, filter, false);
        }, 300);

        return () => clearTimeout(timer);
    }, [filter, loadPage]);

    const loadMore = useCallback(() => {
        if (loadingRef.current || !hasMore) return;
        loadPage(page + 1, filter, true);
    }, [hasMore, page, filter, loadPage]);

    /** Hard refresh — clears and reloads. Used on filter change. */
    const refresh = useCallback(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        loadPage(1, filter, false);
    }, [filter, loadPage]);

    /** Soft refresh — reloads all loaded pages without clearing the list. No moргание. */
    const softRefresh = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        try {
            const currentPage = pageRef.current;
            const currentFilter = filterRef.current || undefined;
            const allItems: number[] = [];

            for (let p = 1; p <= currentPage; p++) {
                const data = await fetchFn(p, currentFilter);
                allItems.push(...data.items);
                if (data.items.length < 20) break;
            }

            setItems(allItems);
        } catch (e) {
            console.error("Soft refresh error:", e);
        } finally {
            loadingRef.current = false;
        }
    }, [fetchFn]);

    /** Optimistic remove — instantly removes an item from the local list. */
    const removeItem = useCallback((id: number) => {
        setItems((prev) => prev.filter((item) => item !== id));
    }, []);

    return {
        items, setItems, filter, setFilter, loading, hasMore,
        loadMore, refresh, softRefresh, removeItem,
    };
}