const BASE = import.meta.env.VITE_API_URL || "";

export interface PageResponse {
    items: number[];
    page: number;
    total?: number;
}

export async function fetchItems(
    page: number,
    filter?: string
): Promise<PageResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (filter) params.set("filter", filter);
    const res = await fetch(`${BASE}/api/items?${params}`);
    return res.json();
}

export async function fetchSelected(
    page: number,
    filter?: string
): Promise<PageResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (filter) params.set("filter", filter);
    const res = await fetch(`${BASE}/api/selected?${params}`);
    return res.json();
}

export async function addItemsBatch(ids: number[]): Promise<{ added: number[] }> {
    const res = await fetch(`${BASE}/api/items/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    return res.json();
}

export async function selectItemsBatch(ids: number[]): Promise<{ added: number[] }> {
    const res = await fetch(`${BASE}/api/selected/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    return res.json();
}

export async function deselectItemsBatch(ids: number[]): Promise<{ removed: number[] }> {
    const res = await fetch(`${BASE}/api/selected/batch`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    return res.json();
}

export async function reorderSelected(
    itemId: number,
    beforeId: number | null
): Promise<{ ok: boolean }> {
    const res = await fetch(`${BASE}/api/selected/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, beforeId }),
    });
    return res.json();
}