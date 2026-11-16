import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const gameId = req.query.gameId ? String(req.query.gameId) : undefined;
    const scores = await prisma.score.findMany({
      where: gameId ? { gameId } : {},
      orderBy: { points: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        game: { select: { id: true, title: true } }
      }
    });
    res.json({ leaderboard: scores });
  } catch (e) { next(e); }
});
export default router;
