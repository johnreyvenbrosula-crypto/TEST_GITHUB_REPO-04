import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
const gameSchema = z.object({
  title: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/),
  genre: z.string().trim().min(2).max(40),
  description: z.string().trim().min(10).max(3000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional()
});

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").slice(0, 80);
    const games = await prisma.game.findMany({
      where: q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { genre: { contains: q, mode: "insensitive" } }] } : {},
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
      include: { _count: { select: { scores: true } } }
    });
    res.json({ games });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });
    if (!game) return res.status(404).json({ error: "Game not found" });
    res.json({ game });
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const game = await prisma.game.create({ data: gameSchema.parse(req.body) });
    res.status(201).json({ game });
  } catch (e) { next(e); }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const game = await prisma.game.update({ where: { id: req.params.id }, data: gameSchema.partial().parse(req.body) });
    res.json({ game });
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.game.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
