import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const windowMs = 15 * 60 * 1000;
export const loginKey = (email: string) =>
  createHash("sha256").update(email).digest("hex");

export async function loginBlocked(key: string) {
  const attempt = await prisma.loginAttempt.findUnique({ where: { key } });
  return !!attempt?.blockedUntil && attempt.blockedUntil > new Date();
}

export async function recordFailedLogin(key: string) {
  for (let retry = 0; retry < 3; retry++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const previous = await tx.loginAttempt.findUnique({ where: { key } });
          const now = new Date();
          const fresh =
            !previous || now.getTime() - previous.firstAt.getTime() >= windowMs;
          const attempts = fresh ? 1 : previous.attempts + 1;
          await tx.loginAttempt.upsert({
            where: { key },
            create: { key, attempts: 1, firstAt: now },
            update: {
              attempts,
              firstAt: fresh ? now : previous.firstAt,
              blockedUntil:
                attempts >= 5 ? new Date(now.getTime() + windowMs) : null,
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return;
    } catch (error) {
      if ((error as { code?: string }).code !== "P2034" || retry === 2)
        throw error;
    }
  }
}
