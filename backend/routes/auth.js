import express from 'express';
import { UserController } from '../controllers/auth.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/profile', authenticate, UserController.getProfile);

export default router;