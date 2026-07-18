import { PrismaClient } from '@prisma/client'

let client: PrismaClient | null = null;

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

function getClient(): PrismaClient {
  if (typeof window !== 'undefined') {
    return null as unknown as PrismaClient;
  }
  if (!client) {
    if (globalForPrisma.prisma) {
      client = globalForPrisma.prisma;
    } else {
      try {
        // Only instantiate if we have a database URL or connection
        client = new PrismaClient();
        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = client;
        }
      } catch (e) {
        // Suppress verbose stack trace logs in Vercel or production environments
        if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
          console.warn("Failed to initialize Prisma Client lazily. Using mock database fallback.", e);
        }
        client = null as unknown as PrismaClient;
      }
    }
  }
  return client;
}

// Export a proxy to defer instantiation until first database property access
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const c = getClient();
    if (!c) {
      return undefined;
    }
    const val = Reflect.get(c, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(c);
    }
    return val;
  }
});
