# CoinGameDz Backend

This directory contains server-side code for CoinGameDz.

## Structure

- `migrations/` - Database schema and migrations
- `services/` - Server-side business logic (DO NOT expose to frontend)

## Important Security Notes

1. **Never commit secrets** - Use environment variables for all credentials
2. **Service Role Key is server-only** - Never expose to frontend
3. **Points operations must be server-side** - Frontend cannot modify user balance
4. **Database transactions are immutable** - All point changes are recorded as transactions
5. **Row Level Security (RLS) is enabled** - Users can only see their own data

## Environment Variables Required

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_PASSWORD=your-database-password-here
```

## Setup Instructions

1. Copy the SQL from `migrations/001_initial_schema.sql`
2. Go to your Supabase project dashboard
3. Navigate to SQL Editor
4. Create a new query and paste the SQL
5. Execute the migration
6. Verify all tables were created successfully
7. Update your backend `.env` with the credentials

## Never Expose

- Service Role Key
- Database password
- Admin credentials
- Any secrets in frontend code

## Point Operations Flow

1. User performs an action (complete task, claim reward, etc.)
2. Frontend calls your backend API endpoint
3. Backend validates the action
4. Backend calls `UserService.addPoints()` with SERVICE_ROLE_KEY
5. Points are recorded in `point_transactions` table
6. User's `points_balance` is updated atomically
7. Response is sent back to frontend
8. Frontend updates UI from API response

## Row Level Security (RLS)

Each table has RLS policies that ensure:
- Users can only view/modify their own data
- Transactions are read-only for users
- Admin operations require service role key

