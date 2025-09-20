import express from 'express';
import { UserController } from '../controllers/auth.js';
import { auth,authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/profile', auth, UserController.getProfile);

export default router;