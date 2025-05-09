import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Export a singleton Prisma client
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 