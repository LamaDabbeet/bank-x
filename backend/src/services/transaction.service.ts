import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/error-handler';
import { logAction } from './log.service';

interface TransactionPayload {
  amount: number;
  description?: string;
}

const MIN_AMOUNT = 1;

export const performCredit = async (accountId: string, payload: TransactionPayload, adminId: string) => {
  if (payload.amount < MIN_AMOUNT) {
    throw new HttpError(400, 'Amount must be positive');
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: payload.amount }
      }
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId: account.id,
        type: 'CREDIT',
        amount: payload.amount,
        description: payload.description,
        performedById: adminId
      }
    });

    return { account, transaction };
  });

  await logAction({
    log: `Admin ${adminId} credited ${payload.amount} to account ${accountId}`,
    userId: adminId,
    type: 2
  });

  return result;
};

export const performDebit = async (accountId: string, payload: TransactionPayload, adminId: string) => {
  if (payload.amount < MIN_AMOUNT) {
    throw new HttpError(400, 'Amount must be positive');
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.account.findUnique({ where: { id: accountId } });

    if (!account) {
      throw new HttpError(404, 'Account not found');
    }

    if (account.balance < payload.amount) {
      throw new HttpError(400, 'Insufficient balance');
    }

    const updatedAccount = await tx.account.update({
      where: { id: accountId },
      data: {
        balance: { decrement: payload.amount }
      }
    });

    const transaction = await tx.transaction.create({
      data: {
        accountId,
        type: 'DEBIT',
        amount: payload.amount,
        description: payload.description,
        performedById: adminId
      }
    });

    return { account: updatedAccount, transaction };
  });

  await logAction({
    log: `Admin ${adminId} debited ${payload.amount} from account ${accountId}`,
    userId: adminId,
    type: 2
  });

  return result;
};

export const getTransactionsForAccount = async (accountId: string) => {
  return prisma.transaction.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

