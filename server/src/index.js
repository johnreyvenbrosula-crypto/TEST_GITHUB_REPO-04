import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import playerRoutes from "./routes/players.js";\nimport scoreRoutes from "./routes/scores.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/players", playerRoutes);\napp.use("/api/scores", scoreRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: "Invalid input", details: err.issues });
  if (err.code === "P2025") return res.status(404).json({ error: "Record not found" });
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Neon Arena API listening on ${port}`));
