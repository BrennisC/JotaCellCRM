import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const tables = await prisma.$queryRaw<
    { tablename: string; rowsecurity: boolean }[]
  >`
    SELECT tablename, rowsecurity FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    ORDER BY tablename`;
  if (tables.length !== 12 || tables.some((table) => !table.rowsecurity)) {
    throw new Error(
      `Expected 12 RLS-protected application tables; found ${tables.length}, unprotected: ${tables
        .filter((table) => !table.rowsecurity)
        .map((table) => table.tablename)
        .join(", ")}`,
    );
  }
  console.log("All 12 application tables have row-level security enabled.");
} finally {
  await prisma.$disconnect();
}
