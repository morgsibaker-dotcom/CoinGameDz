# CoinGameDz Setup Guide

## Prerequisites

1. **Supabase Project Created** — Go to [supabase.com](https://supabase.com) and create a new project
2. **Node.js 18+** — For running the backend
3. **Git** — For version control

## Step 1: Apply the Database Migration

### 1.1 Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### 1.2 Run the Migration

1. Open `backend/migrations/001_initial_schema.sql` in this repository
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run**

### 1.3 Verify the Migration

After the migration completes, verify all tables were created:

```sql
-- Run this query in Supabase SQL Editor to verify
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- app_config
- referrals
- reward_claims
- rewards
- task_completions
- tasks
- users
- wheel_spins
- point_transactions

If all 9 tables are listed, the migration was successful. ✅

## Step 2: Configure Environment Variables

### 2.1 Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API** in the left sidebar
3. Copy these values:
   - **Project URL** — This is your `SUPABASE_URL`
   - **Anon Public Key** — This is your `VITE_SUPABASE_ANON_KEY`
   - **Service Role Secret** — This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this private!)

### 2.2 Create Environment Files

**For Frontend (`.env.local`):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key-here
```

**For Backend (`.env`):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
```

### 2.3 Security Checklist

✅ **DO:**
- Store environment variables in `.env` files (not committed to git)
- Use `.env.local` for local development
- Use `.env.production` for production (with real values)
- Keep the Service Role Key private
- Use different keys for dev/staging/production

❌ **DON'T:**
- Commit `.env` files to git
- Paste secrets into chat or emails
- Use the same key across multiple environments
- Share the Service Role Key with frontend code
- Hardcode credentials in source code

### 2.4 Verify .env is in .gitignore

The repository already has this configured in `.env.gitignore`. Make sure `.env*` files are NOT tracked by git:

```bash
# Check if .env files are tracked
git ls-files | grep .env

# Result should be empty (only .env.example should be tracked)
```

## Step 3: Test Your Configuration

### 3.1 Frontend Configuration Test

```bash
# Install dependencies
npm install

# Run frontend in development mode
npm run dev

# Expected: App starts without Supabase credential errors
# Check console for: "[CoinGameDz] Telegram WebApp initialized"
```

### 3.2 Backend Configuration Test

```bash
# Create a simple test script to verify Supabase connection
# This will be added in Stage 4B implementation
```

## Step 4: Enable Row Level Security (RLS)

### 4.1 Verify RLS is Enabled

1. Go to Supabase dashboard → **Authentication** → **Policies**
2. For each table (users, point_transactions, task_completions, reward_claims, wheel_spins):
   - Click the table name
   - Verify RLS is **Enabled** (toggle should be ON)
   - Review the policies created by the migration

### 4.2 Test User Isolation

The RLS policies ensure:
- Users can only view their own data
- Users cannot modify sensitive fields (points_balance)
- Transaction records are immutable
- Administrators with service_role_key can bypass RLS

## Step 5: Next Steps

Once verified:
1. ✅ Database migration applied
2. ✅ Environment variables configured
3. ✅ RLS policies enabled
4. ✅ Frontend builds without errors

You're ready for **Stage 4B: Backend Implementation**

## Troubleshooting

### "Tables not found" errors
- **Solution:** Re-run the migration. Check for SQL syntax errors in the output.

### "Invalid API Key" errors
- **Solution:** Verify you copied the correct key from Supabase Settings → API
- **Wrong key:** Service Role Key (this goes in backend only)
- **Right key for frontend:** Anon Public Key

### "VITE_SUPABASE_URL is undefined"
- **Solution:** Create `.env.local` file in project root with correct variables
- Restart the dev server after creating .env file

### "Cannot read property 'WebApp' of undefined"
- **Solution:** This is normal outside Telegram. App will use mock data.

## Support

If you need help:
1. Check the error message in browser console (F12)
2. Verify all environment variables are set
3. Re-run the migration
4. Check Supabase project status (no service disruptions)

## Security Reminders

🔒 **Critical:**
- Never commit `.env` files
- Never share the Service Role Key
- Never expose backend secrets in frontend code
- Always use HTTPS in production
- Rotate credentials periodically
- Monitor Supabase audit logs for suspicious activity

