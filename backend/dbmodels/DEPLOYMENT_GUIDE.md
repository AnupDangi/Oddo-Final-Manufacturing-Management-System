# Quick Deployment Guide for Manufacturing Management System Database

## 🚀 How to Deploy the Database Schema

### Option 1: Manual Deployment (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `xmonbrstkwxatkrfzyuj`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute Schema**
   - Open the file: `deploy_schema.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Deployment**
   ```bash
   cd backend/dbmodels
   node deploy.js verify
   ```

### Option 2: Using the Deployment Script

```bash
# Navigate to the dbmodels directory
cd backend/dbmodels

# Run deployment (will show manual instructions)
node deploy.js

# After manual deployment, verify tables
node deploy.js verify
```

## 📋 Expected Tables After Deployment

The following 16 tables should be created:

1. **users** - User authentication and roles
2. **user_activity_logs** - User activity tracking
3. **products** - Product master data
4. **work_centers** - Work center definitions
5. **work_center_logs** - Work center activities
6. **bom** - Bill of Materials headers
7. **bom_components** - BOM material components
8. **bom_operations** - BOM operation steps
9. **manufacturing_orders** - Production orders
10. **mo_components** - MO material allocations
11. **work_orders** - Individual operation tasks
12. **work_order_costs** - WO cost tracking
13. **stock_ledger** - Inventory transactions
14. **reports** - Report metadata
15. **kpi_snapshots** - Daily KPI tracking
16. **audit_log** - Change audit trail

## 🔧 Troubleshooting

### Environment Variables Issue
If you see "Missing required Supabase environment variables":

1. Check your `.env` file in the `backend` folder
2. Ensure it contains:
   ```
   SUPABASE_URL=https://xmonbrstkwxatkrfzyuj.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Permission Issues
If you get permission errors during deployment:
- Make sure you're using the service role key (not anon key) for schema creation
- Check that your Supabase project allows schema modifications

### Table Already Exists Errors
- The schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to re-run
- If you need to start fresh, drop all tables first

## ✅ Verification Steps

After deployment, verify your setup:

1. **Check Table Count**
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   Should return 16 or more.

2. **Check Key Tables**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('users', 'products', 'manufacturing_orders', 'work_orders');
   ```

3. **Check Triggers and Functions**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public';
   ```

## 🎯 Next Steps

Once the database is deployed:

1. **Add Sample Data** (optional)
   ```bash
   node deploy.js sample-data
   ```

2. **Start Backend Server**
   ```bash
   cd ../
   npm start
   ```

3. **Test API Endpoints**
   - User authentication
   - Product management
   - Manufacturing orders

## 📞 Need Help?

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure your internet connection is stable
4. Try the manual deployment method if the script fails