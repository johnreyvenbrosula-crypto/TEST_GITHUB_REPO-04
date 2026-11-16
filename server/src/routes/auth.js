import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const registerSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72)
});

function tokenFor(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({ data: { ...data, passwordHash } });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Email or username already exists" });
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Email or password is incorrect" });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, avatarUrl: true, bio: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: "Player not found" });
    res.json({ user });
  } catch (e) { next(e); }
});

export default router;
