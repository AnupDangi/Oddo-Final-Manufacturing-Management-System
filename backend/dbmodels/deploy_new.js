import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('📋 Required variables in .env file:');
  console.log('   SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('');
  console.log('💡 Current .env status:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  process.exit(1);
}

// Create PostgreSQL client for direct database connection
const createDbClient = () => {
  // Convert Supabase URL to PostgreSQL connection string
  let connectionString = supabaseUrl;
  
  // Handle different URL formats
  if (connectionString.startsWith('https://')) {
    // Convert https://xxx.supabase.co to postgresql://postgres:[key]@db.xxx.supabase.co:5432/postgres
    const projectRef = connectionString.replace('https://', '').replace('.supabase.co', '');
    connectionString = `postgresql://postgres:${supabaseAnonKey}@db.${projectRef}.supabase.co:5432/postgres`;
  } else if (!connectionString.startsWith('postgresql://')) {
    connectionString = connectionString.replace('postgres://', 'postgresql://');
  }
  
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
};

// Import Supabase client for verification (non-blocking)
let supabase = null;
try {
  const dbModule = await import('../config/db.js');
  supabase = dbModule.supabase;
} catch (err) {
  console.warn('⚠️ Could not import Supabase client for verification, but PostgreSQL deployment will continue...');
}

/**
 * Deploy database schema to Supabase using PostgreSQL client
 * This script executes all SQL schema files in the correct order
 */
async function deploySchema() {
  const client = createDbClient();
  
  try {
    console.log('🚀 Starting Manufacturing Management System Schema Deployment...');
    console.log('=' .repeat(70));

    // Test database connection
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Database connection established!');

    // Check if we should deploy the complete schema or individual files
    const deployScriptPath = path.join(__dirname, 'deploy_schema.sql');
    
    if (fs.existsSync(deployScriptPath)) {
      console.log('📄 Deploying complete schema from deploy_schema.sql...');
      const sqlScript = fs.readFileSync(deployScriptPath, 'utf8');
      
      // Execute the complete schema
      await client.query(sqlScript);
      console.log('✅ Complete schema deployed successfully!');
      
    } else {
      console.log('📁 Deploy_schema.sql not found, deploying individual files...');
      await deployIndividualFiles(client);
    }

    console.log('🎉 Schema deployment completed successfully!');
    console.log('=' .repeat(70));
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('authentication failed')) {
      console.error('');
      console.error('🔐 Authentication Error:');
      console.error('   - Check your SUPABASE_ANON_KEY is correct');
      console.error('   - Make sure you\'re using the service_role key (not anon key) for schema operations');
      console.error('   - Verify your Supabase project is active');
    } else if (error.message.includes('connection')) {
      console.error('');
      console.error('🌐 Connection Error:');
      console.error('   - Check your SUPABASE_URL is correct');
      console.error('   - Verify your internet connection');
      console.error('   - Ensure Supabase project is not paused');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

/**
 * Deploy individual schema files in sequence
 */
async function deployIndividualFiles(client) {
  console.log('📁 Deploying individual schema files...');
  
  const schemaFiles = [
    '01_users.sql',
    '02_products.sql', 
    '03_work_centers.sql',
    '04_bom.sql',
    '05_manufacturing_orders.sql',
    '06_work_orders.sql',
    '07_stock_ledger.sql',
    '08_reporting.sql',
    '09_audit.sql',
    '10_triggers_functions.sql'
  ];

  for (const fileName of schemaFiles) {
    const filePath = path.join(__dirname, fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Processing ${fileName}...`);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sqlContent);
        console.log(`✅ ${fileName} executed successfully`);
      } catch (err) {
        console.error(`❌ Error in ${fileName}:`, err.message);
        throw err; // Re-throw to stop deployment
      }
    } else {
      console.warn(`⚠️ File not found: ${fileName}`);
    }
  }
}

/**
 * Verify that the schema was deployed correctly
 */
async function verifyDeployment() {
  if (!supabase) {
    console.error('❌ Cannot verify deployment: Supabase client not available');
    console.log('💡 You can manually check tables in Supabase Dashboard > Table Editor');
    return;
  }

  console.log('🔍 Verifying schema deployment...');
  
  const tablesToCheck = [
    'users',
    'user_activity_logs',
    'products', 
    'work_centers',
    'work_center_logs',
    'bom',
    'bom_components',
    'bom_operations',
    'manufacturing_orders',
    'mo_components',
    'work_orders',
    'work_order_costs',
    'stock_ledger',
    'reports',
    'kpi_snapshots',
    'audit_log'
  ];

  let successCount = 0;
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (!error) {
        console.log(`✅ Table '${table}' verified successfully`);
        successCount++;
      } else {
        console.log(`❌ Table '${table}' verification failed:`, error.message);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' verification failed:`, err.message);
    }
  }
  
  console.log('');
  console.log(`📊 Verification complete: ${successCount}/${tablesToCheck.length} tables verified`);
  
  if (successCount === tablesToCheck.length) {
    console.log('🎉 All tables verified successfully! Schema deployment is complete.');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Run sample data: node deploy.js sample-data');
    console.log('   2. Start your backend server');
    console.log('   3. Test your API endpoints');
  } else if (successCount > 0) {
    console.log('⚠️ Some tables were verified successfully, but not all.');
    console.log('   This might be expected if you\'re doing a partial deployment.');
  } else {
    console.log('❌ No tables could be verified. Please check your deployment.');
  }
}

/**
 * Deploy sample data for testing
 */
async function deploySampleData() {
  const client = createDbClient();
  
  try {
    console.log('📦 Deploying sample data...');
    console.log('=' .repeat(50));

    await client.connect();
    
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    
    if (fs.existsSync(sampleDataPath)) {
      const sqlScript = fs.readFileSync(sampleDataPath, 'utf8');
      await client.query(sqlScript);
      console.log('✅ Sample data deployed successfully!');
      
      // Show summary
      const summaryQueries = [
        'SELECT COUNT(*) as user_count FROM users',
        'SELECT COUNT(*) as product_count FROM products',
        'SELECT COUNT(*) as mo_count FROM manufacturing_orders',
        'SELECT COUNT(*) as stock_transactions FROM stock_ledger'
      ];
      
      console.log('');
      console.log('📊 Sample Data Summary:');
      for (const query of summaryQueries) {
        try {
          const result = await client.query(query);
          const key = Object.keys(result.rows[0])[0];
          console.log(`   ${key}: ${result.rows[0][key]}`);
        } catch (err) {
          console.log(`   Error getting ${query}:`, err.message);
        }
      }
      
    } else {
      console.error('❌ sample_data.sql file not found!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Sample data deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Show manual deployment instructions
 */
function showManualInstructions() {
  console.log('📋 Manual Deployment Instructions:');
  console.log('=' .repeat(50));
  console.log('');
  console.log('If automatic deployment fails, you can deploy manually:');
  console.log('');
  console.log('1. 🌐 Go to: https://supabase.com/dashboard');
  console.log('2. 📂 Select your project');
  console.log('3. 📝 Go to SQL Editor → New Query');
  console.log('4. 📋 Copy contents of deploy_schema.sql');
  console.log('5. 📝 Paste and click "Run"');
  console.log('6. ✅ Run verification: node deploy.js verify');
  console.log('');
  console.log('📁 SQL File location: ' + path.join(__dirname, 'deploy_schema.sql'));
}

/**
 * Main execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const method = process.argv[2] || 'deploy';
  
  switch (method) {
    case 'verify':
      console.log('🔍 Verifying schema deployment...');
      await verifyDeployment();
      break;
      
    case 'individual':
      console.log('📁 Deploying individual files...');
      const client = createDbClient();
      try {
        await client.connect();
        await deployIndividualFiles(client);
        console.log('✅ Individual files deployed successfully!');
      } catch (error) {
        console.error('❌ Individual file deployment failed:', error.message);
      } finally {
        await client.end();
      }
      break;
      
    case 'sample-data':
      await deploySampleData();
      break;
      
    case 'manual':
      showManualInstructions();
      break;
      
    case 'deploy':
    default:
      await deploySchema();
      break;
  }
}

export { deploySchema, verifyDeployment, deployIndividualFiles, deploySampleData };