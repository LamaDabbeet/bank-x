import type { Response } from 'express';
import { z } from 'zod';

import { AuthRequest } from '../middleware/auth';
import { HttpError } from '../middleware/error-handler';
import { loginUser, refreshSession, registerUser } from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  mobileNumber: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const register = async (req: AuthRequest, res: Response) => {
  const body = registerSchema.parse(req.body);
  const user = await registerUser(body);

  res.status(201).json({
    success: true,
    message: 'Registration submitted. Wait for admin approval.',
    data: {
      id: user.id,
      email: user.email,
      status: user.status
    }
  });
};

export const login = async (req: AuthRequest, res: Response) => {
  const body = loginSchema.parse(req.body);
  const { user, tokens } = await loginUser(body);

  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'Account inactive');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      tokens
    }
  });
};

export const refresh = async (req: AuthRequest, res: Response) => {
  const token = req.body.refreshToken;
  if (!token) throw new HttpError(400, 'Refresh token missing');
  const tokens = await refreshSession(token);
  res.json({ success: true, data: tokens });
};

