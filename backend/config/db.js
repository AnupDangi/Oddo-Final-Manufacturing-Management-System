import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Client for all operations (using anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (same as regular client for now)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔗 Attempting to connect to Supabase database...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('📋 Checking if users table exists...');
      
      // Try a simpler connection test
      const { data: simpleTest, error: simpleError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
        
      if (simpleError) {
        console.error('❌ Simple database test failed:', simpleError.message);
        return false;
      }
    }
    
    console.log('✅ Successfully connected to Supabase database!');
    console.log('📊 Database connection established');
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
};

export default { supabase, supabaseAdmin, testConnection };
