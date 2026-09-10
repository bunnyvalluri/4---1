import { PrismaClient } from '@prisma/client';

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_SwidG35QXDWx@ep-muddy-math-aeqfkwpn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30';

const DEFAULT_DIRECT_URL =
  process.env.DIRECT_URL ||
  'postgresql://neondb_owner:npg_SwidG35QXDWx@ep-muddy-math-aeqfkwpn.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DEFAULT_DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
