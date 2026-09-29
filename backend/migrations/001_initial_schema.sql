/**
 * Database migration script
 * This file contains all SQL migrations for the CoinGameDz database
 * 
 * To apply these migrations:
 * 1. Copy the SQL below and run it in your Supabase SQL editor
 * 2. Or use: psql -h db.XXXXX.supabase.co -U postgres -d postgres < migrations.sql
 * 
 * DO NOT commit database credentials or connection strings
 */

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  avatar_url TEXT,
  email VARCHAR(255) UNIQUE,
  language VARCHAR(10) DEFAULT 'en' CHECK (language IN ('en', 'ar', 'fr')),
  points_balance BIGINT DEFAULT 0 CHECK (points_balance >= 0),
  usd_equivalent DECIMAL(10, 2) DEFAULT 0.00,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for users
CREATE INDEX idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Point transactions table (immutable audit log)
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount != 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('earn', 'spend', 'bonus', 'referral', 'withdrawal')),
  description TEXT NOT NULL,
  source VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for point_transactions
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON public.point_transactions(type);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('watch', 'click', 'survey', 'game')),
  reward_points BIGINT NOT NULL CHECK (reward_points > 0),
  is_active BOOLEAN DEFAULT true,
  max_completions_per_user INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tasks
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_is_active ON public.tasks(is_active);

-- Task completions table
CREATE TABLE public.task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  points_awarded BIGINT NOT NULL CHECK (points_awarded > 0),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for task_completions
CREATE INDEX idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX idx_task_completions_user_task ON public.task_completions(user_id, task_id);
CREATE UNIQUE INDEX idx_task_completions_unique_per_task ON public.task_completions(user_id, task_id);

-- Rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('daily', 'streak', 'welcome', 'gift', 'achievement')),
  points_reward BIGINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rewards
CREATE INDEX idx_rewards_type ON public.rewards(reward_type);
CREATE INDEX idx_rewards_is_active ON public.rewards(is_active);

-- Reward claims table
CREATE TABLE public.reward_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_claimed BIGINT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reward_claims
CREATE INDEX idx_reward_claims_user_id ON public.reward_claims(user_id);
CREATE INDEX idx_reward_claims_reward_id ON public.reward_claims(reward_id);
CREATE INDEX idx_reward_claims_user_reward ON public.reward_claims(user_id, reward_id);
CREATE UNIQUE INDEX idx_reward_claims_unique_per_reward ON public.reward_claims(user_id, reward_id);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 20.00,
  total_commission BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT referrer_not_self CHECK (referrer_id != referred_user_id)
);

-- Create indexes for referrals
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE UNIQUE INDEX idx_referrals_unique ON public.referrals(referrer_id, referred_user_id);

-- Wheel spins table
CREATE TABLE public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reward_type VARCHAR(255) NOT NULL,
  points_won BIGINT NOT NULL CHECK (points_won > 0),
  spun_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for wheel_spins
CREATE INDEX idx_wheel_spins_user_id ON public.wheel_spins(user_id);
CREATE INDEX idx_wheel_spins_spun_at ON public.wheel_spins(spun_at DESC);

-- App configuration table
CREATE TABLE public.app_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for app_config
CREATE INDEX idx_app_config_key ON public.app_config(key);

-- Enable Row Level Security (RLS) for security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for point_transactions (read-only for users)
CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- RLS Policies for task_completions
CREATE POLICY "Users can view their own completions" ON public.task_completions
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- RLS Policies for reward_claims
CREATE POLICY "Users can view their own claims" ON public.reward_claims
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- RLS Policies for wheel_spins
CREATE POLICY "Users can view their own spins" ON public.wheel_spins
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_updated_at();

-- Function to update tasks's updated_at timestamp
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tasks updated_at
CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Function to update rewards's updated_at timestamp
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rewards updated_at
CREATE TRIGGER trigger_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_updated_at();

-- Function to update app_config's updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for app_config updated_at
CREATE TRIGGER trigger_app_config_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_app_config_updated_at();
