import type { Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth';
import {
  createAccountAsAdmin,
  deleteAccount,
  getAccountByUser,
  getAccounts,
  updateAccountAsAdmin,
  updateAccountAsUser
} from '../services/account.service';
import { HttpError } from '../middleware/error-handler';

const adminCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().min(6),
  profilePicture: z.string().url().optional(),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

const adminUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  address: z.string().optional(),
  profilePicture: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

const userUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  address: z.string().optional(),
  profilePicture: z.string().url().optional()
});

export const adminCreateAccount = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const data = adminCreateSchema.parse(req.body);
  const result = await createAccountAsAdmin(data, req.user.id);
  res.status(201).json({
    success: true,
    toast: { type: 'success', message: 'Account created' },
    data: {
      user: result.user,
      temporaryPassword: result.temporaryPassword
    }
  });
};

export const adminUpdateAccount = async (req: AuthRequest, res: Response) => {
  const data = adminUpdateSchema.parse(req.body);
  const account = await updateAccountAsAdmin(req.params.accountId, data);
  res.json({
    success: true,
    message: 'Account updated',
    toast: { type: 'success', message: 'Account updated' },
    data: account
  });
};

export const adminDeleteAccount = async (req: AuthRequest, res: Response) => {
  await deleteAccount(req.params.accountId);
  res.status(204).send();
};

export const adminListAccounts = async (_req: AuthRequest, res: Response) => {
  const accounts = await getAccounts();
  res.json({
    success: true,
    data: accounts.map((account) => ({
      ...account,
      balance: Number(account.balance)
    }))
  });
};

export const userGetAccount = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const account = await getAccountByUser(req.user.id);
  res.json({
    success: true,
    data: {
      ...account,
      balance: Number(account.balance)
    }
  });
};

export const userUpdateAccount = async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Unauthorized');
  const body = userUpdateSchema.parse(req.body);
  const result = await updateAccountAsUser(req.user.id, body);
  res.json({
    success: true,
    toast: { type: 'success', message: 'Profile updated' },
    data: result
  });
};

