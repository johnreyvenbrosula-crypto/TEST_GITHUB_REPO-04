import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.get("/:id", async (req, res, next) => {
  try {
    const player = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, username: true, avatarUrl: true, bio: true, createdAt: true,
        scores: { orderBy: { points: "desc" }, take: 10, include: { game: { select: { title: true } } } }
      }
    });
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json({ player });
  } catch (e) { next(e); }
});
export default router;
