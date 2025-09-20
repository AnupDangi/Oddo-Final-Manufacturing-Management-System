import { mongoose } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userSchema } from '../schemas/index.js';

/**
 * User Model for Manufacturing ERP System
 * Handles user authentication, authorization, and role-based access control
 */

// Add pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Add methods to user schema
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role,
      department: this.department 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getRoleHierarchy = function() {
  return {
    admin: 4,
    manager: 3,
    operator: 2,
    inventory: 1
  };
};

userSchema.statics.getDefaultPermissions = function(role) {
  const permissions = {
    admin: [
      'products.read', 'products.write', 'products.delete',
      'work_centers.read', 'work_centers.write', 'work_centers.delete',
      'boms.read', 'boms.write', 'boms.delete',
      'manufacturing_orders.read', 'manufacturing_orders.write', 'manufacturing_orders.delete',
      'work_orders.read', 'work_orders.write', 'work_orders.delete',
      'stock_ledger.read', 'stock_ledger.write', 'stock_ledger.delete',
      'dashboard.read', 'reports.read', 'reports.export',
      'users.read', 'users.write', 'users.delete'
    ],
    manager: [
      'products.read', 'products.write',
      'work_centers.read', 'work_centers.write',
      'boms.read', 'boms.write',
      'manufacturing_orders.read', 'manufacturing_orders.write',
      'work_orders.read', 'work_orders.write',
      'stock_ledger.read', 'stock_ledger.write',
      'dashboard.read', 'reports.read', 'reports.export',
      'users.read'
    ],
    operator: [
      'products.read',
      'work_centers.read',
      'boms.read',
      'manufacturing_orders.read',
      'work_orders.read', 'work_orders.write',
      'stock_ledger.read',
      'dashboard.read'
    ],
    inventory: [
      'products.read', 'products.write',
      'work_centers.read',
      'boms.read',
      'manufacturing_orders.read',
      'work_orders.read',
      'stock_ledger.read', 'stock_ledger.write',
      'dashboard.read'
    ]
  };
  
  return permissions[role] || [];
};

// Create and export the model
const User = mongoose.model('User', userSchema);

class UserModel {
  /**
   * Create a new user
   */
  static async create(userData) {
    try {
      // Set default permissions based on role
      if (!userData.permissions) {
        userData.permissions = User.getDefaultPermissions(userData.role);
      }

      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  static async authenticate(email, password) {
    try {
      const user = await User.findByEmail(email);
      if (!user || !user.isActive) {
        throw new Error('Invalid credentials or account disabled');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return {
        user,
        token: user.generateToken()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async findById(id) {
    try {
      return await User.findById(id).populate('createdBy', 'name email');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users with filters
   */
  static async getAll(filters = {}) {
    try {
      const { role, department, isActive, page = 1, limit = 10 } = filters;
      const query = {};

      if (role) query.role = role;
      if (department) query.department = department;
      if (isActive !== undefined) query.isActive = isActive;

      const skip = (page - 1) * limit;

      const users = await User.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      return {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(id, updateData, updatedBy) {
    try {
      // Don't allow direct password updates through this method
      if (updateData.password) {
        delete updateData.password;
      }

      updateData.updatedBy = updatedBy;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy updatedBy', 'name email');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(id) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  static async checkPermission(userId, permission) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      return user.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has role or higher
   */
  static async checkRoleHierarchy(userId, requiredRole) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      const hierarchy = User.getRoleHierarchy();
      return hierarchy[user.role] >= hierarchy[requiredRole];
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user statistics
   */
  static async getStatistics() {
    try {
      const [totalUsers, byRole, byDepartment, activeUsers] = await Promise.all([
        User.countDocuments(),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ]),
        User.countDocuments({ isActive: true })
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: byRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byDepartment: byDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }
}

export default UserModel;
export { User };