import {
    addItemsBatch,
    selectItemsBatch,
    deselectItemsBatch,
} from "./api";

type Callback = () => void;

/**
 * Request queue with batching and deduplication.
 *
 * - addItem: batched every 10 seconds (Set = auto-dedup)
 * - select/deselect: batched every 1 second
 * - onFlush callback fires after any batch is sent,
 *   so panels can refresh their data.
 */
class RequestQueue {
    private addQueue = new Set<number>();
    private selectQueue = new Set<number>();
    private deselectQueue = new Set<number>();

    private addTimer: ReturnType<typeof setInterval> | null = null;
    private mutationTimer: ReturnType<typeof setInterval> | null = null;

    private onFlushCallbacks: Callback[] = [];

    start() {
        this.addTimer = setInterval(() => this.flushAdds(), 10_000);
        this.mutationTimer = setInterval(() => this.flushMutations(), 1_000);
    }

    stop() {
        if (this.addTimer) clearInterval(this.addTimer);
        if (this.mutationTimer) clearInterval(this.mutationTimer);
    }

    onFlush(cb: Callback) {
        this.onFlushCallbacks.push(cb);
        return () => {
            this.onFlushCallbacks = this.onFlushCallbacks.filter((c) => c !== cb);
        };
    }

    private notifyFlush() {
        this.onFlushCallbacks.forEach((cb) => cb());
    }

    // ── Add new items (10 sec batch) ──

    enqueueAdd(id: number) {
        this.addQueue.add(id); // Set = deduplication
    }

    /** Force flush adds immediately (e.g. on unmount). */
    async flushAdds() {
        if (this.addQueue.size === 0) return;

        const ids = [...this.addQueue];
        this.addQueue.clear();

        try {
            await addItemsBatch(ids);
            this.notifyFlush();
        } catch (e) {
            // Put back on failure
            ids.forEach((id) => this.addQueue.add(id));
            console.error("Failed to flush adds:", e);
        }
    }

    // ── Select / Deselect (1 sec batch) ──

    enqueueSelect(id: number) {
        // If it was queued for deselect, cancel that instead
        if (this.deselectQueue.has(id)) {
            this.deselectQueue.delete(id);
            return;
        }
        this.selectQueue.add(id);
    }

    enqueueDeselect(id: number) {
        // If it was queued for select, cancel that instead
        if (this.selectQueue.has(id)) {
            this.selectQueue.delete(id);
            return;
        }
        this.deselectQueue.add(id);
    }

    async flushMutations() {
        const hasSelect = this.selectQueue.size > 0;
        const hasDeselect = this.deselectQueue.size > 0;

        if (!hasSelect && !hasDeselect) return;

        const selectIds = [...this.selectQueue];
        const deselectIds = [...this.deselectQueue];
        this.selectQueue.clear();
        this.deselectQueue.clear();

        try {
            const promises: Promise<unknown>[] = [];
            if (selectIds.length > 0) promises.push(selectItemsBatch(selectIds));
            if (deselectIds.length > 0) promises.push(deselectItemsBatch(deselectIds));
            await Promise.all(promises);
            this.notifyFlush();
        } catch (e) {
            // Put back on failure
            selectIds.forEach((id) => this.selectQueue.add(id));
            deselectIds.forEach((id) => this.deselectQueue.add(id));
            console.error("Failed to flush mutations:", e);
        }
    }

    /** Pending counts for UI feedback. */
    get pendingAdds() {
        return this.addQueue.size;
    }
    get pendingMutations() {
        return this.selectQueue.size + this.deselectQueue.size;
    }
}

// Singleton
export const requestQueue = new RequestQueue();