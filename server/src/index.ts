import express from "express";
import cors from "cors";
import itemsRouter from "./routes/items.js";
import selectedRouter from "./routes/selected.js";
import {initStore} from "./store.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/items", itemsRouter);
app.use("/api/selected", selectedRouter);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

console.log("Initializing store with 1,000,000 items...");
initStore();
console.log("Store ready.");

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
