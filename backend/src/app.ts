import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import logRoutes from './routes/log.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { httpLogger } from './middleware/logger';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  const allowedOrigin = env.UI_ORIGIN ?? 'http://localhost:3000';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: env.RATE_LIMIT_RPM,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use(httpLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/logs', logRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

