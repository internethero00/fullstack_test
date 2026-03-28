import { useRef, useCallback, type ReactNode } from "react";

interface Props {
    onLoadMore: () => void;
    loading: boolean;
    hasMore: boolean;
    children: ReactNode;
}

export function InfiniteScroll({ onLoadMore, loading, hasMore, children }: Props) {
    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);
    loadingRef.current = loading;
    hasMoreRef.current = hasMore;

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            if (loadingRef.current || !hasMoreRef.current) return;

            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            // Подгружаем когда до конца осталось < 100px
            if (scrollHeight - scrollTop - clientHeight < 100) {
                onLoadMore();
            }
        },
        [onLoadMore]
    );

    return (
        <div className="scroll-container" onScroll={handleScroll}>
            {children}
            <div className="sentinel">
                {loading ? "Загрузка..." : ""}
            </div>
        </div>
    );
}