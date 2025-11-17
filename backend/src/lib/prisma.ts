import { PrismaClient } from '@prisma/client';

import { env, isProduction } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient =
  global.prisma ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    }
  });

if (!isProduction) {
  global.prisma = prismaClient;
}

export const prisma = prismaClient;

