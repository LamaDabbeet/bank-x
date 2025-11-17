import { Router } from 'express';

import { adminCredit, adminDebit, userDashboard } from '../controllers/transaction.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => {
  userDashboard(req, res).catch(next);
});

router.post('/:accountId/credit', requireRole('ADMIN'), (req, res, next) => {
  adminCredit(req, res).catch(next);
});

router.post('/:accountId/debit', requireRole('ADMIN'), (req, res, next) => {
  adminDebit(req, res).catch(next);
});

export default router;

