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

// TLS is required by the TiDB Cloud public endpoint, but a local MySQL/MariaDB
// only offers a self-signed certificate — forcing `ssl: true` there fails the
// handshake with SELF_SIGNED_CERT_IN_CHAIN, so the pool never gets a single
// connection and every query dies with a "pool timeout" (P2039) after 10s.
// Default to TLS for remote hosts, off for loopback, and let DB_SSL override.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function resolveSsl(): boolean {
  const override = process.env.DB_SSL?.trim().toLowerCase();
  if (override === "true" || override === "1") return true;
  if (override === "false" || override === "0") return false;
  return !LOCAL_HOSTS.has(host!.toLowerCase());
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,

  ssl: resolveSsl(),

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
