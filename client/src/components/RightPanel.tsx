import { forwardRef, useImperativeHandle } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { fetchSelected, reorderSelected } from "../api";
import { requestQueue } from "../requestQueue";
import { useInfiniteList } from "../useInfiniteList";
import { InfiniteScroll } from "./InfiniteScroll";
import { SortableItem } from "./SortableItem";
import type { PanelHandle } from "../App";

export const RightPanel = forwardRef<PanelHandle>(function RightPanel(_props, ref) {
    const { items, setItems, filter, setFilter, loading, hasMore, loadMore, softRefresh, removeItem } =
        useInfiniteList({ fetchFn: fetchSelected });

    useImperativeHandle(ref, () => ({ refresh: softRefresh }));

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDeselect = (id: number) => {
        removeItem(id); // мгновенно убираем из списка
        requestQueue.enqueueDeselect(id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id as number;
        const overId = over.id as number;

        const oldIndex = items.indexOf(activeId);
        const newIndex = items.indexOf(overId);

        const updated = [...items];
        updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, activeId);
        setItems(updated);

        const beforeId = newIndex < updated.length - 1 ? updated[newIndex + 1] : null;

        try {
            await reorderSelected(activeId, beforeId);
        } catch (e) {
            console.error("Reorder failed:", e);
            softRefresh();
        }
    };

    return (
        <div className="panel">
            <h2>Выбранные</h2>

            <input
                type="text"
                placeholder="Фильтр по ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-input"
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <InfiniteScroll onLoadMore={loadMore} loading={loading} hasMore={hasMore}>
                        {items.map((id) => (
                            <SortableItem key={id} id={id} onDeselect={handleDeselect} />
                        ))}
                        {items.length === 0 && !loading && (
                            <div className="empty">Нет выбранных</div>
                        )}
                    </InfiniteScroll>
                </SortableContext>
            </DndContext>
        </div>
    );
});