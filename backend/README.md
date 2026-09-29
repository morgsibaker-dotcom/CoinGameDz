# CoinGameDz Backend README

## Overview

This directory contains the server-side implementation for CoinGameDz.

**Important:** This code runs on your backend server, NOT in the browser. Never expose backend code or secrets to the frontend.

## Structure

```
backend/
├── migrations/          # Database schema and migrations
│   └── 001_initial_schema.sql
├── services/            # Business logic (DO NOT expose to frontend)
│   └── index.ts
├── api/                 # API endpoints (coming in Stage 4B)
├── middleware/          # Auth and validation (coming in Stage 4B)
├── utils/               # Utilities and helpers (coming in Stage 4B)
└── README.md            # This file
```

## Prerequisites

- Node.js 18+
- Supabase project with database migration applied
- Environment variables configured

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
NODE_ENV=development
PORT=3000
```

**⚠️ SECURITY:** Do NOT commit `.env` file. It should be in `.gitignore`.

### 3. Apply Database Migration

See [SETUP.md](../SETUP.md) for detailed migration instructions.

Quick check:

```bash
# Verify your database
echo "SELECT COUNT(*) FROM users;" # Should return 0 rows initially
```

## Running the Backend

### Development

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### Production

```bash
npm run build
npm start
```

## Available Services

All services in `backend/services/` are server-only. They use the `SUPABASE_SERVICE_ROLE_KEY` for full database access.

### UserService

```typescript
// Sync Telegram user on first login
await UserService.syncTelegramUser(telegramData)

// Get user by Telegram ID
await UserService.getUserByTelegramId(telegramId)

// Add points (immutable, server-side only)
await UserService.addPoints(userId, amount, type, description, metadata)
```

### TaskService

```typescript
// Complete a task and award points
await TaskService.completeTask(userId, taskId)
```

### RewardService

```typescript
// Claim a reward
await RewardService.claimReward(userId, rewardId)
```

### ReferralService

```typescript
// Register a referral
await ReferralService.registerReferral(referrerUserId, referredTelegramId)
```

## API Endpoints (Coming in Stage 4B)

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/api/auth/telegram` | POST | Authenticate user with Telegram |
| `/api/users/:id` | GET | Get user profile |
| `/api/users/:id/points` | GET | Get user points balance |
| `/api/tasks` | GET | List available tasks |
| `/api/tasks/:id/complete` | POST | Complete a task |
| `/api/rewards` | GET | List available rewards |
| `/api/rewards/:id/claim` | POST | Claim a reward |
| `/api/referrals/:code/register` | POST | Register with referral code |
| `/api/wheel/spin` | POST | Spin the wheel |
| `/api/transactions` | GET | Get user transactions |

## Security Best Practices

### 1. Never Expose Secrets

```typescript
// ❌ WRONG
export const API_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ CORRECT
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
// Don't export the key, only use it internally
```

### 2. Validate All Frontend Requests

```typescript
// ❌ WRONG - trusting frontend user_id
const userId = req.body.user_id

// ✅ CORRECT - get user from Telegram verification
const userId = verifyTelegramData(req.body.initData).user.id
```

### 3. Server-Side Point Operations

```typescript
// ❌ WRONG - frontend modifies balance
const balance = userBalance + earnedPoints

// ✅ CORRECT - backend increments atomically
await UserService.addPoints(userId, earnedPoints, 'earn', 'Task completion')
```

### 4. Use Immutable Audit Logs

All point changes go through `point_transactions` table:

```typescript
// Every balance change is recorded
await supabase.from('point_transactions').insert({
  user_id: userId,
  amount: points,
  type: 'earn',
  description: 'Completed task',
  metadata: { task_id: taskId }
})
```

### 5. Implement Idempotency

Prevent duplicate operations:

```typescript
// Check if task already completed
const existing = await supabase
  .from('task_completions')
  .select('id')
  .eq('user_id', userId)
  .eq('task_id', taskId)
  .single()

if (existing.data) {
  throw new Error('Task already completed')
}
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|----------|
| `SUPABASE_URL` | ✅ | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Backend secret key |
| `SUPABASE_ANON_KEY` | ⏳ | Frontend public key |
| `TELEGRAM_BOT_TOKEN` | ⏳ | Bot token (Stage 5) |
| `NODE_ENV` | ❌ | dev/prod |
| `PORT` | ❌ | Server port |

## Row Level Security (RLS)

RLS policies are configured in the migration. They ensure:

- Users can only view their own data
- Transactions are read-only
- Point balance cannot be modified by users
- Admins with service_role_key bypass RLS

**Example policy:**

```sql
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);
```

## Database Connection

### Frontend Connection

Uses public Anon Key (read-only via RLS):

```typescript
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Backend Connection

Uses Service Role Key (full access):

```typescript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

## Testing

### Test Database Connection

```bash
# Create backend/test-connection.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabase.from('users').select('COUNT(*)')

if (error) {
  console.error('Connection failed:', error)
} else {
  console.log('✅ Connection successful')
}
```

## Deployment

### On Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### On Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy

### On Your Own Server

1. Clone repository
2. Create `.env` with production values
3. Run `npm run build`
4. Run `npm start`
5. Use a process manager like PM2

## Monitoring

### Logs

```bash
# View application logs
npm run logs

# View database logs (Supabase dashboard)
```

### Performance

- Monitor query performance in Supabase dashboard
- Check database size and backups
- Review API usage and rate limits

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- Project issues: Check GitHub Issues

