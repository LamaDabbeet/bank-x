import { prisma } from '../lib/prisma';

interface LogInput {
  log: string;
  userId?: string;
  haveError?: boolean;
  type: 1 | 2;
}

export const logAction = async ({ log, userId, haveError = false, type }: LogInput) => {
  await prisma.logEntry.create({
    data: {
      log,
      userId,
      haveError,
      type
    }
  });
};

