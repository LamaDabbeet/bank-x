import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const createAccessToken = (payload: { sub: string; role: 'ADMIN' | 'USER' }) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

export const createRefreshToken = (payload: { sub: string; role: 'ADMIN' | 'USER' }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; role: 'ADMIN' | 'USER' };

