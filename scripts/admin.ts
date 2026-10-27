import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const userId = process.env.SUPABASE_ADMIN_USER_ID?.trim();
if (
  !email ||
  !userId ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    userId,
  )
) {
  throw new Error(
    "Set ADMIN_EMAIL and SUPABASE_ADMIN_USER_ID from Supabase Auth > Users in .env.local.",
  );
}

const prisma = new PrismaClient();
try {
  await prisma.admin.upsert({
    where: { email },
    create: {
      email,
      name: process.env.ADMIN_NAME || "Administrador",
      supabaseUserId: userId,
    },
    update: {
      name: process.env.ADMIN_NAME || "Administrador",
      supabaseUserId: userId,
    },
  });
  console.log("Supabase Auth user authorized for the administrative panel.");
} finally {
  await prisma.$disconnect();
}
