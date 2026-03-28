let allItems: number[] = [];
let allSet: Set<number> = new Set();
let selected: number[] = [];
let selectedSet: Set<number> = new Set();

// ── Init ──────────────────────────────────────────────

export function initStore() {
    allItems = Array.from({ length: 1_000_000 }, (_, i) => i + 1);
    allSet = new Set(allItems);
    selected = [];
    selectedSet = new Set();
}

// ── Items (left panel) ────────────────────────────────

export function getItems(page: number, filter?: string) {
    const limit = 20;
    const offset = (page - 1) * limit;

    let result: number[];

    if (filter) {
        // Iterate and collect only what we need (offset + limit)
        // Avoid building a full filtered array for 1M items
        result = [];
        let skipped = 0;

        for (let i = 0; i < allItems.length; i++) {
            const id = allItems[i];
            if (selectedSet.has(id)) continue;
            if (!String(id).includes(filter)) continue;

            if (skipped < offset) {
                skipped++;
                continue;
            }

            result.push(id);
            if (result.length >= limit) break;
        }
    } else {
        // No filter — still need to skip selected items
        result = [];
        let skipped = 0;

        for (let i = 0; i < allItems.length; i++) {
            const id = allItems[i];
            if (selectedSet.has(id)) continue;

            if (skipped < offset) {
                skipped++;
                continue;
            }

            result.push(id);
            if (result.length >= limit) break;
        }
    }

    return { items: result, page };
}

/** Add new items (batch). Returns actually added IDs (deduplication). */
export function addItems(ids: number[]): number[] {
    const added: number[] = [];

    for (const id of ids) {
        if (allSet.has(id)) continue; // deduplicate
        allSet.add(id);
        added.push(id);
    }

    if (added.length > 0) {
        allItems.push(...added);
        allItems.sort((a, b) => a - b);
    }

    return added;
}

// ── Selected (right panel) ────────────────────────────

export function getSelected(page: number, filter?: string) {
    const limit = 20;
    const offset = (page - 1) * limit;

    if (filter) {
        const filtered = selected.filter((id) => String(id).includes(filter));
        return {
            items: filtered.slice(offset, offset + limit),
            total: filtered.length,
            page,
        };
    }

    return {
        items: selected.slice(offset, offset + limit),
        total: selected.length,
        page,
    };
}

/** Select items (move to right panel). Returns actually selected IDs. */
export function selectItems(ids: number[]): number[] {
    const added: number[] = [];

    for (const id of ids) {
        if (!allSet.has(id)) continue;      // must exist in allItems
        if (selectedSet.has(id)) continue;  // already selected
        selectedSet.add(id);
        selected.push(id);
        added.push(id);
    }

    return added;
}

/** Deselect items (move back to left panel). Returns actually deselected IDs. */
export function deselectItems(ids: number[]): number[] {
    const removed: number[] = [];

    for (const id of ids) {
        if (!selectedSet.has(id)) continue;
        selectedSet.delete(id);
        removed.push(id);
    }

    if (removed.length > 0) {
        const removeSet = new Set(removed);
        selected = selected.filter((id) => !removeSet.has(id));
    }

    return removed;
}

/** Reorder: move itemId before beforeId. If beforeId is null — move to end. */
export function reorderSelected(
    itemId: number,
    beforeId: number | null
): boolean {
    if (!selectedSet.has(itemId)) return false;
    if (beforeId !== null && !selectedSet.has(beforeId)) return false;

    // Remove item from current position
    const fromIndex = selected.indexOf(itemId);
    selected.splice(fromIndex, 1);

    if (beforeId === null) {
        // Move to end
        selected.push(itemId);
    } else {
        // Insert before target
        const toIndex = selected.indexOf(beforeId);
        selected.splice(toIndex, 0, itemId);
    }

    return true;
}