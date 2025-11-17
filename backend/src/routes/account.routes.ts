import { Router } from 'express';

import {
  adminCreateAccount,
  adminDeleteAccount,
  adminListAccounts,
  adminUpdateAccount,
  userGetAccount,
  userUpdateAccount
} from '../controllers/account.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => {
  userGetAccount(req, res).catch(next);
});

router.patch('/me', (req, res, next) => {
  userUpdateAccount(req, res).catch(next);
});

router.post('/', requireRole('ADMIN'), (req, res, next) => {
  adminCreateAccount(req, res).catch(next);
});

router.get('/', requireRole('ADMIN'), (req, res, next) => {
  adminListAccounts(req, res).catch(next);
});

router.patch('/:accountId', requireRole('ADMIN'), (req, res, next) => {
  adminUpdateAccount(req, res).catch(next);
});

router.delete('/:accountId', requireRole('ADMIN'), (req, res, next) => {
  adminDeleteAccount(req, res).catch(next);
});

export default router;

