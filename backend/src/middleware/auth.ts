import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { HttpError } from './error-handler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'ADMIN' | 'USER';
  };
}

const extractToken = (req: Request) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.substring(7);
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return undefined;
};

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return next(new HttpError(401, 'Authentication token missing'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: 'ADMIN' | 'USER' };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true }
    });

    if (!user) {
      return next(new HttpError(401, 'User not found'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new HttpError(403, 'Account inactive'));
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token'));
  }
};

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return next(new HttpError(403, 'Insufficient permissions'));
    }
    next();
  };
};

