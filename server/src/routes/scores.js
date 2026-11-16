import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = z.object({
      gameId: z.string().min(1),
      points: z.number().int().min(0).max(100000000)
    }).parse(req.body);
    const game = await prisma.game.findUnique({ where: { id: data.gameId } });
    if (!game) return res.status(404).json({ error: "Game not found" });
    const score = await prisma.score.create({
      data: { ...data, userId: req.user.id },
      include: {
        user: { select: { id: true, username: true } },
        game: { select: { id: true, title: true } }
      }
    });
    res.status(201).json({ score });
  } catch (e) { next(e); }
});

export default router;
