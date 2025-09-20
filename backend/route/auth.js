import express from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateSignup, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticateToken, getMe);

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    version: '1.0',
    endpoints: {
      'POST /signup': 'Register a new user',
      'POST /login': 'Authenticate user',
      'POST /logout': 'Sign out user',
      'GET /me': 'Get current user profile (requires auth)'
    },
    examples: {
      // --- THIS SECTION IS UPDATED ---
      signup: {
        method: 'POST',
        url: '/api/v1/auth/signup',
        body: {
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        }
      },
      // ---------------------------------
      login: {
        method: 'POST',
        url: '/api/v1/auth/login',
        body: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  });
});

export default router;