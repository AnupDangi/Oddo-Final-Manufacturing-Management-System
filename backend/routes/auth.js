import express from 'express';
import { UserController } from '../controllers/auth.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', UserController.signup);
router.post('/register', UserController.signup); // Add register route pointing to the same controller
router.post('/login', UserController.login);
router.get('/profile', auth, UserController.getProfile);

export default router;