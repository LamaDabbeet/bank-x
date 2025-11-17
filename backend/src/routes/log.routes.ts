import { Router } from 'express';

import { createUiLog, listLogs } from '../controllers/log.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/ui', (req, res, next) => {
  createUiLog(req, res).catch(next);
});

router.get('/', authenticate, requireRole('ADMIN'), (req, res, next) => {
  listLogs(req, res).catch(next);
});

export default router;

