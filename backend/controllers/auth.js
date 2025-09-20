import { supabase } from '../config/db.js'

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
            } = req.body

            // Validate required fields
            if (!name || !email || !password || !confirmPassword || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, password, and role are required'
                })
            }

            // Validate password match
            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Passwords do not match'
                })
            }

            // Validate role
            const validRoles = ['Admin', 'Manufacturing Manager', 'Operator', 'Inventory Manager']
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Role must be one of: Admin, Manufacturing Manager, Operator, or Inventory Manager'
                })
            }

            // Check if email already exists in users table
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .single()

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                })
            }

            // Sign up with Supabase auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password
            })

            if (authError) throw authError

            // Insert user data into users table
            const { error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        name,
                        email,
                        password_hash: authData.user.id, // Using Supabase user ID as reference
                        role,
                        phone,
                        is_active: true
                    }
                ])

            if (insertError) {
                // If insert fails, we should clean up the auth user
                await supabase.auth.admin.deleteUser(authData.user.id)
                throw insertError
            }

            return res.status(201).json({
                success: true,
                message: 'Signup successful! Please check your email for verification.',
                data: {
                    id: authData.user.id,
                    name,
                    email,
                    role,
                    phone
                }
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'An error occurred during signup'
            })
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                })
            }

            // First verify if user exists in our users table and is active
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single()

            if (userError || !userData) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials or inactive account'
                })
            }

            // Then attempt login with Supabase auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        phone: userData.phone,
                        is_active: userData.is_active
                    },
                    session: authData.session
                }
            })

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }
    }
}