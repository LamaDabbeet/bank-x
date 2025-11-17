import type { Response } from 'express';
import { z } from 'zod';

import type { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { logAction } from '../services/log.service';

const uiLogSchema = z.object({
  log: z.string().min(2),
  haveError: z.boolean().optional()
});

export const listLogs = async (_req: AuthRequest, res: Response) => {
  const logs = await prisma.logEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { email: true } }
    }
  });

  res.json({ success: true, data: logs });
};

export const createUiLog = async (req: AuthRequest, res: Response) => {
  const body = uiLogSchema.parse(req.body);
  await logAction({
    log: body.log,
    haveError: body.haveError,
    userId: req.user?.id,
    type: 1
  });

  res.status(201).json({ success: true });
};

