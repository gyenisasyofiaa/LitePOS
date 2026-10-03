import "dotenv/config";
import cors from "cors";
import express from "express";
import { requireAuth } from "./auth.js";
import productsRouter from "./routes/products.js";
import transactionsRouter from "./routes/transactions.js";

const app = express();
const port = Number(process.env.PORT || 4000);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin tidak diizinkan oleh CORS."));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "minipos-backend" });
});

app.use("/api/products", requireAuth, productsRouter);
app.use("/api/transactions", requireAuth, transactionsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Terjadi kesalahan pada server." });
});

app.listen(port, () => {
  console.log(`MiniPOS backend berjalan di http://localhost:${port}`);
});
