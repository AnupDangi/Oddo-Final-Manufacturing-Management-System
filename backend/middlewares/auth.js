import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const authenticate = async (req, res, next) => {
    try {
        // Check for token in headers
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user by id from decoded token
            const user = await User.findById(decoded.id).select('-password_hash');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is inactive'
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Middleware for role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authorization denied'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

// Optional: Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Optional: Middleware to check if user is a manager
export const isManager = (req, res, next) => {
    if (!req.user || req.user.role !== 'Manufacturing Manager') {
        return res.status(403).json({
            success: false,
            message: 'Manager access required'
        });
    }
    next();
};

// Optional: Middleware to check if user owns the resource or is admin
export const isOwnerOrAdmin = (modelName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authorization denied'
                });
            }

            const resourceId = req.params.id;
            const Model = mongoose.model(modelName);
            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            if (
                resource.user?.toString() !== req.user._id.toString() && 
                req.user.role !== 'Admin'
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }

            next();
        } catch (error) {
            console.error('isOwnerOrAdmin middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    };
};