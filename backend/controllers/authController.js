import { supabase, supabaseAdmin } from '../config/db.js';

// User registration
export const signup = async (req, res, next) => {
  try {
    // 1. Updated fields from request body
    const { username, email, password, confirmPassword } = req.body;

    // 2. Validate required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: true,
        message: 'Username, email, password, and confirm password are required.'
      });
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: 'Passwords do not match.'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // 4. Store username in metadata
          username: username
        },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      return res.status(400).json({
        error: true,
        message: authError.message
      });
    }

    // Create profile in profiles table
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          // 5. Save username to the profiles table
          username: username
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        user: authData.user,
        profile: authData.user ? {
          id: authData.user.id,
          username: username,
          email: authData.user.email
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// User login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: true,
        message: error.message
      });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// User logout
export const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        error: true,
        message: error.message
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({
        error: true,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...req.user,
        ...profile,
        first_name: profile?.first_name || req.user.user_metadata?.first_name,
        last_name: profile?.last_name || req.user.user_metadata?.last_name
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { signup, login, logout, getMe };