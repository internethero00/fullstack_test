import { Router, Request, Response } from "express";
import { getItems, addItems } from "../store.js";

const router = Router();

/**
 * GET /api/items?page=1&filter=42
 * Returns unselected items with pagination and optional substring filter.
 */
router.get("/", (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const filter = (req.query.filter as string) || undefined;

    const result = getItems(page, filter);
    res.json(result);
});

/**
 * POST /api/items/batch
 * Body: { ids: number[] }
 * Add new items. Deduplicates against existing.
 */
router.post("/batch", (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "ids must be a non-empty array" });
        return;
    }

    const numericIds = ids.map(Number).filter((n) => !isNaN(n) && n > 0);
    const added = addItems(numericIds);

    res.json({ added });
});

export default router;
