import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

/**
 * Basic authentication middleware to verify JWT token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user details from database
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, is_active')
      .eq('user_id', decoded.user_id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};
/**
 * Check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      
      // Convert single role to array for consistent handling
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Check if user's role is in the allowed roles
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Admin only access
 */
export const requireAdmin = requireRole('Admin');

/**
 * Admin or Manager access
 */
export const requireAdminOrManager = requireRole(['Admin', 'Manager']);

/**
 * All authenticated users (any role)
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

/**
 * Check if user can access specific user data
 * Users can access their own data, Admins and Managers can access any user data
 * @param {string} userIdParam - Parameter name containing the user ID to check
 * @returns {Function} Express middleware function
 */
export const requireOwnershipOrElevated = (userIdParam = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const targetUserId = parseInt(req.params[userIdParam]);
      const currentUserId = req.user.user_id;
      const userRole = req.user.role;

      // Admins and Managers can access any user data
      if (['Admin', 'Manager'].includes(userRole)) {
        return next();
      }

      // Users can only access their own data
      if (targetUserId === currentUserId) {
        return next();
      }

      // Access denied
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data.'
      });
    } catch (error) {
      console.error('Ownership authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Role hierarchy check - ensures user has sufficient privileges
 * Admin > Manager > Operator > Inventory
 */
export const requireMinimumRole = (minimumRole) => {
  const roleHierarchy = {
    'Inventory': 1,
    'Operator': 2,
    'Manager': 3,
    'Admin': 4
  };

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRoleLevel = roleHierarchy[req.user.role];
      const requiredRoleLevel = roleHierarchy[minimumRole];

      if (!userRoleLevel || !requiredRoleLevel) {
        return res.status(500).json({
          success: false,
          message: 'Invalid role configuration'
        });
      }

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Minimum role required: ${minimumRole}. Your role: ${req.user.role}`
        });
      }

      next();
    } catch (error) {
      console.error('Role hierarchy authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Check if user belongs to specific department(s)
 * @param {string|string[]} allowedDepartments - Single department or array of allowed departments
 * @returns {Function} Express middleware function
 */
export const requireDepartment = (allowedDepartments) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admins can access all departments
      if (req.user.role === 'Admin') {
        return next();
      }

      const userDepartment = req.user.department;
      const departments = Array.isArray(allowedDepartments) ? allowedDepartments : [allowedDepartments];

      if (!userDepartment || !departments.includes(userDepartment)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required department: ${departments.join(' or ')}. Your department: ${userDepartment || 'None'}`
        });
      }

      next();
    } catch (error) {
      console.error('Department authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

/**
 * Validate that the user account is active
 */
export const requireActiveUser = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    next();
  } catch (error) {
    console.error('Active user validation error:', error);
    res.status(500).json({
      success: false,
      message: 'User validation failed'
    });
  }
};

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  requireAuth,
  requireOwnershipOrElevated,
  requireMinimumRole,
  requireDepartment,
  requireActiveUser
};