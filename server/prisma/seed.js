import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@neonarena.local" },
    update: {},
    create: {
      username: "ArenaAdmin",
      email: "admin@neonarena.local",
      passwordHash,
      role: "ADMIN",
      bio: "Neon Arena administrator"
    }
  });

  const games = [
    ["Cyber Strike", "cyber-strike", "FPS", "Fast-paced tactical arena combat.", true],
    ["Mythic Realms", "mythic-realms", "RPG", "Explore a vast fantasy world and build your legend.", true],
    ["Turbo Circuit", "turbo-circuit", "Racing", "High-speed racing across futuristic tracks.", false],
    ["Shadow Tactics", "shadow-tactics", "Strategy", "Outthink your rivals in a tactical showdown.", false]
  ];
  for (const [title, slug, genre, description, isFeatured] of games) {
    await prisma.game.upsert({
      where: { slug },
      update: {},
      create: { title, slug, genre, description, isFeatured }
    });
  }
}

main().finally(() => prisma.$disconnect());
