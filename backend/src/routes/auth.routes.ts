import { Router } from 'express';

import { login, refresh, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', (req, res, next) => {
  register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  login(req, res).catch(next);
});

router.post('/refresh', (req, res, next) => {
  refresh(req, res).catch(next);
});

export default router;

