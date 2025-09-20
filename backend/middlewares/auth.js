import { supabase } from '../config/db.js';

// Middleware to verify JWT token from Supabase
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: true,
        message: 'Invalid or expired token'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: true,
      message: 'Authentication service error'
    });
  }
};

// --- NEW MIDDLEWARE ---
// Middleware to check if the user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    // This middleware must run AFTER authenticateToken
    const userId = req.user.id;

    // Query the profiles table to get the user's role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: true, message: 'User profile not found.' });
    }

    // Check if the role is 'Admin'
    if (profile.role !== 'Admin') {
      return res.status(403).json({ error: true, message: 'Forbidden: Admin access required.' });
    }

    // If user is an admin, proceed to the next handler
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ error: true, message: 'Error checking admin status.' });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without auth
  }
};

export default { authenticateToken, isAdmin, optionalAuth };