import type { Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error-handler';
import { getAccountByUser } from '../services/account.service';
import { getTransactionsForAccount, performCredit, performDebit } from '../services/transaction.service';

const mutationSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional()
});

export const adminCredit = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const body = mutationSchema.parse(req.body);
  const result = await performCredit(req.params.accountId, body, req.user.id);
  res.json({
    success: true,
    toast: { type: 'success', message: 'Credit completed' },
    data: result
  });
};

export const adminDebit = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const body = mutationSchema.parse(req.body);
  const result = await performDebit(req.params.accountId, body, req.user.id);
  res.json({
    success: true,
    toast: { type: 'warning', message: 'Debit completed' },
    data: result
  });
};

export const userDashboard = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const account = await getAccountByUser(req.user.id);
  const transactions = await getTransactionsForAccount(account.id);
  res.json({
    success: true,
    data: {
      balance: Number(account.balance),
      transactions: transactions.map((txn) => ({
        ...txn,
        amount: Number(txn.amount)
      }))
    }
  });
};

