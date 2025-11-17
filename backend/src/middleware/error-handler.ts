import type { NextFunction, Request, Response } from 'express';

import { logger } from './logger';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, 'Resource not found'));
};

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err.message || 'Internal server error';

  logger.error({ err, path: req.path }, 'Request failed');

  res.status(status).json({
    success: false,
    message
  });
};

