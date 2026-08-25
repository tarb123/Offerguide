import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

const host = isProduction
  ? process.env.DB_PROD_HOST
  : process.env.DB_HOST;

const port = Number(
  isProduction
    ? process.env.DB_PROD_PORT
    : process.env.DB_PORT
);

const user = isProduction
  ? process.env.DB_PROD_USER
  : process.env.DB_USER;

const password = isProduction
  ? process.env.DB_PROD_PASS
  : process.env.DB_PASS;

const database = isProduction
  ? process.env.DB_PROD_NAME
  : process.env.DB_NAME;

if (!host) {
  throw new Error("Database host is missing.");
}

if (!port || Number.isNaN(port)) {
  throw new Error("Database port is missing or invalid.");
}

if (!user) {
  throw new Error("Database user is missing.");
}

if (!password) {
  throw new Error("Database password is missing.");
}

if (!database) {
  throw new Error("Database name is missing.");
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,

  // TiDB Cloud public endpoint requires TLS.
  ssl: true,

  // Keep serverless connection usage small.
  connectionLimit: 3,

  // Fail clearly instead of hanging indefinitely.
  connectTimeout: 5000,
  acquireTimeout: 10000,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}