import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export class UserController {
    static async signup(req, res) {
        try {
            const { 
                name,
                email,
                password,
                confirmPassword,
                role,
                phone
            } = req.body;

            // Validate required fields
            if (!name || !email || !password || !confirmPassword || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, password, and role are required'
                });
            }

            // Validate password match
            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Passwords do not match'
                });
            }

            // Validate role
            const validRoles = ['Admin', 'Manufacturing Manager', 'Operator', 'Inventory Manager'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Role must be one of: Admin, Manufacturing Manager, Operator, or Inventory Manager'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new User({
                name,
                email: email.toLowerCase(),
                password_hash: hashedPassword,
                role,
                phone,
                is_active: true
            });

            // Save user
            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password_hash;

            return res.status(201).json({
                success: true,
                message: 'Signup successful!',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Signup error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during signup',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user by email
            const user = await User.findOne({ 
                email: email.toLowerCase(),
                is_active: true 
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials or inactive account'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Remove password from response
            const userResponse = user.toObject();
            delete userResponse.password_hash;

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred during login',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-password_hash');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user profile'
            });
        }
    }
}