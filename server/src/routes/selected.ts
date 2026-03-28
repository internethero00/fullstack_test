import { Router, Request, Response } from "express";
import {
    getSelected,
    selectItems,
    deselectItems,
    reorderSelected,
} from "../store.js";

const router = Router();

/**
 * GET /api/selected?page=1&filter=42
 * Returns selected items in D&D order with pagination.
 */
router.get("/", (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const filter = (req.query.filter as string) || undefined;

    const result = getSelected(page, filter);
    res.json(result);
});

/**
 * POST /api/selected/batch
 * Body: { ids: number[] }
 * Move items to selected.
 */
router.post("/batch", (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "ids must be a non-empty array" });
        return;
    }

    const numericIds = ids.map(Number).filter((n) => !isNaN(n));
    const added = selectItems(numericIds);

    res.json({ added });
});

/**
 * DELETE /api/selected/batch
 * Body: { ids: number[] }
 * Move items back to unselected.
 */
router.delete("/batch", (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "ids must be a non-empty array" });
        return;
    }

    const numericIds = ids.map(Number).filter((n) => !isNaN(n));
    const removed = deselectItems(numericIds);

    res.json({ removed });
});

/**
 * PUT /api/selected/reorder
 * Body: { itemId: number, beforeId: number | null }
 * Move itemId before beforeId. If beforeId is null — move to end.
 */
router.put("/reorder", (req: Request, res: Response) => {
    const { itemId, beforeId } = req.body;

    if (typeof itemId !== "number") {
        res.status(400).json({ error: "itemId is required" });
        return;
    }

    const success = reorderSelected(itemId, beforeId ?? null);

    if (!success) {
        res.status(404).json({ error: "Item not found in selected" });
        return;
    }

    res.json({ ok: true });
});

export default router;