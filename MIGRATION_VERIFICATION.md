# CoinGameDz Database Migration Verification Checklist

Use this checklist to verify the database migration was applied successfully.

## Pre-Migration Checklist

- [ ] Supabase project created and accessible
- [ ] You have admin access to the Supabase project
- [ ] You can access the Supabase SQL Editor
- [ ] `backend/migrations/001_initial_schema.sql` file is available

## Migration Application Steps

1. **Open Supabase SQL Editor**
   - [ ] Go to your Supabase dashboard
   - [ ] Click **SQL Editor** in left sidebar
   - [ ] Click **New Query**

2. **Copy and Paste Migration**
   - [ ] Open `backend/migrations/001_initial_schema.sql` from the repository
   - [ ] Copy the entire SQL content
   - [ ] Paste into the Supabase SQL Editor

3. **Execute Migration**
   - [ ] Click **Run** button
   - [ ] Wait for completion (should show success message)
   - [ ] Check for any error messages in the output

## Post-Migration Verification

### Step 1: Verify All Tables Created

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected output (9 tables):**
```
table_name
──────────────────────
app_config
point_transactions
referral_rewards
referrals
reward_claims
rewards
task_completions
tasks
users
wheel_spins
```

- [ ] All 9 tables exist

### Step 2: Verify Table Columns

For each table below, run:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'TABLE_NAME'
ORDER BY ordinal_position;
```

#### Users Table
- [ ] `id` (UUID)
- [ ] `telegram_id` (BIGINT, unique)
- [ ] `username` (VARCHAR, unique)
- [ ] `first_name` (VARCHAR)
- [ ] `last_name` (VARCHAR)
- [ ] `avatar_url` (TEXT)
- [ ] `email` (VARCHAR, unique)
- [ ] `language` (VARCHAR)
- [ ] `points_balance` (BIGINT, >= 0)
- [ ] `usd_equivalent` (DECIMAL)
- [ ] `level` (INTEGER, >= 1)
- [ ] `referral_code` (VARCHAR, unique)
- [ ] `referred_by` (UUID)
- [ ] `created_at` (TIMESTAMP)
- [ ] `updated_at` (TIMESTAMP)
- [ ] `is_active` (BOOLEAN)

#### Point Transactions Table
- [ ] `id` (UUID)
- [ ] `user_id` (UUID, foreign key)
- [ ] `amount` (BIGINT)
- [ ] `type` (VARCHAR: earn, spend, bonus, referral, withdrawal)
- [ ] `description` (TEXT)
- [ ] `source` (VARCHAR)
- [ ] `metadata` (JSONB)
- [ ] `created_at` (TIMESTAMP)

#### Tasks Table
- [ ] `id` (UUID)
- [ ] `title` (VARCHAR)
- [ ] `description` (TEXT)
- [ ] `category` (VARCHAR: watch, click, survey, game)
- [ ] `reward_points` (BIGINT, > 0)
- [ ] `is_active` (BOOLEAN)
- [ ] `max_completions_per_user` (INTEGER)
- [ ] `created_at` (TIMESTAMP)
- [ ] `updated_at` (TIMESTAMP)

#### Task Completions Table
- [ ] `id` (UUID)
- [ ] `user_id` (UUID, foreign key)
- [ ] `task_id` (UUID, foreign key)
- [ ] `points_awarded` (BIGINT, > 0)
- [ ] `completed_at` (TIMESTAMP)

#### Rewards Table
- [ ] `id` (UUID)
- [ ] `title` (VARCHAR)
- [ ] `description` (TEXT)
- [ ] `reward_type` (VARCHAR: daily, streak, welcome, gift, achievement)
- [ ] `points_reward` (BIGINT)
- [ ] `is_active` (BOOLEAN)
- [ ] `created_at` (TIMESTAMP)
- [ ] `updated_at` (TIMESTAMP)

#### Reward Claims Table
- [ ] `id` (UUID)
- [ ] `user_id` (UUID, foreign key)
- [ ] `reward_id` (UUID, foreign key)
- [ ] `points_claimed` (BIGINT)
- [ ] `claimed_at` (TIMESTAMP)

#### Referrals Table
- [ ] `id` (UUID)
- [ ] `referrer_id` (UUID, foreign key)
- [ ] `referred_user_id` (UUID, foreign key)
- [ ] `referral_code` (VARCHAR)
- [ ] `commission_rate` (DECIMAL)
- [ ] `total_commission` (BIGINT)
- [ ] `created_at` (TIMESTAMP)

#### Wheel Spins Table
- [ ] `id` (UUID)
- [ ] `user_id` (UUID, foreign key)
- [ ] `reward_type` (VARCHAR)
- [ ] `points_won` (BIGINT, > 0)
- [ ] `spun_at` (TIMESTAMP)

#### App Config Table
- [ ] `id` (UUID)
- [ ] `key` (VARCHAR, unique)
- [ ] `value` (JSONB)
- [ ] `description` (TEXT)
- [ ] `updated_at` (TIMESTAMP)

### Step 3: Verify Indexes Created

Run this query:

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected: 20+ indexes created**
- [ ] Indexes for `users` table
- [ ] Indexes for `point_transactions` table
- [ ] Indexes for `task_completions` table
- [ ] Indexes for `reward_claims` table
- [ ] Indexes for `referrals` table

### Step 4: Verify Functions and Triggers

Run this query:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**Expected functions:**
- [ ] `update_app_config_updated_at`
- [ ] `update_rewards_updated_at`
- [ ] `update_tasks_updated_at`
- [ ] `update_user_updated_at`

### Step 5: Verify Row Level Security (RLS)

Run this query:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected: RLS enabled on these tables**
- [ ] `users` (rowsecurity = true)
- [ ] `point_transactions` (rowsecurity = true)
- [ ] `task_completions` (rowsecurity = true)
- [ ] `reward_claims` (rowsecurity = true)
- [ ] `wheel_spins` (rowsecurity = true)

### Step 6: Verify Policies

Run this query:

```sql
SELECT policyname, tablename, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected policies:**
- [ ] `users`: "Users can view their own profile"
- [ ] `users`: "Users can update their own profile"
- [ ] `point_transactions`: "Users can view their own transactions"
- [ ] `task_completions`: "Users can view their own completions"
- [ ] `reward_claims`: "Users can view their own claims"
- [ ] `wheel_spins`: "Users can view their own spins"

## Troubleshooting

### Migration Failed with SQL Errors

**Problem:** SQL errors during migration execution

**Solution:**
1. Check the error message for the specific line
2. Verify the syntax is correct
3. Try running the migration in smaller sections
4. Check if any tables already exist (duplicate table names)

### "Extension not found" Error

**Problem:** Error about `uuid-ossp` or `pgcrypto` extension

**Solution:**
1. Extensions should be created automatically
2. If not, run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
3. Try running the migration again

### RLS Policies Not Created

**Problem:** Policies section is empty

**Solution:**
1. Scroll down in the migration file
2. Find the `CREATE POLICY` statements
3. Manually run them in the SQL Editor

### Missing Tables

**Problem:** Some tables exist, others don't

**Solution:**
1. Check which tables are missing
2. Find the `CREATE TABLE` statement for each missing table
3. Run just those statements
4. Re-verify

## After Successful Migration

Once all checks pass:

1. ✅ Keep this checklist for reference
2. ✅ Document any issues you encountered
3. ✅ Proceed to environment variable configuration
4. ✅ Begin Stage 4B implementation

## Questions?

If something is missing or incorrect:
1. Check the migration file carefully
2. Verify no errors in the Supabase SQL Editor output
3. Try dropping tables and running migration again
4. Review Supabase documentation for specific errors

