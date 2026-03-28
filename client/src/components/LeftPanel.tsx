import { useState, forwardRef, useImperativeHandle } from "react";
import { fetchItems } from "../api";
import { requestQueue } from "../requestQueue";
import { useInfiniteList } from "../useInfiniteList";
import { InfiniteScroll } from "./InfiniteScroll";
import type { PanelHandle } from "../App";

export const LeftPanel = forwardRef<PanelHandle>(function LeftPanel(_props, ref) {
    const { items, filter, setFilter, loading, hasMore, loadMore, softRefresh, removeItem } =
        useInfiniteList({ fetchFn: fetchItems });

    const [newId, setNewId] = useState("");

    useImperativeHandle(ref, () => ({ refresh: softRefresh }));

    const handleSelect = (id: number) => {
        removeItem(id); // мгновенно убираем из списка
        requestQueue.enqueueSelect(id);
    };

    const handleAdd = () => {
        const id = parseInt(newId, 10);
        if (isNaN(id) || id <= 0) return;
        requestQueue.enqueueAdd(id);
        setNewId("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAdd();
    };

    return (
        <div className="panel">
            <h2>Все элементы</h2>

            <input
                type="text"
                placeholder="Фильтр по ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-input"
            />

            <div className="add-row">
                <input
                    type="number"
                    placeholder="Новый ID"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="add-input"
                />
                <button onClick={handleAdd} className="btn btn-add">
                    Добавить
                </button>
            </div>

            <InfiniteScroll onLoadMore={loadMore} loading={loading} hasMore={hasMore}>
                {items.map((id) => (
                    <div key={id} className="item">
                        <span className="item-id">ID: {id}</span>
                        <button onClick={() => handleSelect(id)} className="btn btn-select">
                            +
                        </button>
                    </div>
                ))}
                {items.length === 0 && !loading && (
                    <div className="empty">Нет элементов</div>
                )}
            </InfiniteScroll>
        </div>
    );
});