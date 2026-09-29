/**
 * Backend API Service Layer
 * 
 * This is a template for server-side operations with the Supabase database.
 * This code should run on your backend server, NOT in the frontend.
 * 
 * To use this:
 * 1. Set up a Node.js backend with your Supabase credentials
 * 2. Use the SUPABASE_SERVICE_ROLE_KEY (never expose this to frontend)
 * 3. Implement API endpoints that call these functions
 * 4. Frontend calls your API endpoints, never the database directly for sensitive operations
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'

// Backend-only initialization (never expose these to frontend)
// Initialize with SERVICE ROLE KEY for full database access
const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * User Service
 * Server-side operations for user management
 */
export class UserService {
  /**
   * Create or update user from Telegram data
   * Called when user first logs in via Telegram
   */
  static async syncTelegramUser(telegramData: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    photo_url?: string
  }) {
    const referralCode = `REF_${telegramData.id}_${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          telegram_id: telegramData.id,
          username: telegramData.username || `user_${telegramData.id}`,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          avatar_url: telegramData.photo_url,
          language: (telegramData.language_code as 'en' | 'ar' | 'fr') || 'en',
          referral_code: referralCode,
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user by telegram_id
   */
  static async getUserByTelegramId(telegramId: number) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update user points (server-only operation)
   * NEVER allow frontend to call this directly
   */
  static async addPoints(
    userId: string,
    amount: number,
    type: 'earn' | 'spend' | 'bonus' | 'referral',
    description: string,
    metadata?: Record<string, any>
  ) {
    // 1. Create transaction record (immutable audit log)
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('point_transactions')
      .insert({
        user_id: userId,
        amount,
        type,
        description,
        metadata,
      })
      .select()
      .single()

    if (txError) throw txError

    // 2. Update user points balance
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        points_balance: supabaseAdmin.rpc('increment_points', {
          user_id: userId,
          amount,
        }),
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    return { transaction, user }
  }
}

/**
 * Task Service
 * Server-side operations for task management
 */
export class TaskService {
  /**
   * Complete a task for a user
   * Validates completion limits and awards points
   */
  static async completeTask(userId: string, taskId: string) {
    // 1. Get task details
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError
    if (!task || !task.is_active) throw new Error('Task not found or inactive')

    // 2. Check if user already completed this task (if there's a limit)
    if (task.max_completions_per_user) {
      const { data: completions, error: completionError } = await supabaseAdmin
        .from('task_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('task_id', taskId)

      if (completionError) throw completionError
      if (completions && completions.length >= task.max_completions_per_user) {
        throw new Error('Task completion limit reached')
      }
    }

    // 3. Record task completion
    const { data: completion, error: completionError } = await supabaseAdmin
      .from('task_completions')
      .insert({
        user_id: userId,
        task_id: taskId,
        points_awarded: task.reward_points,
      })
      .select()
      .single()

    if (completionError) throw completionError

    // 4. Award points to user
    return UserService.addPoints(
      userId,
      task.reward_points,
      'earn',
      `Completed task: ${task.title}`,
      { task_id: taskId }
    )
  }
}

/**
 * Reward Service
 * Server-side operations for reward management
 */
export class RewardService {
  /**
   * Claim a reward for a user
   */
  static async claimReward(userId: string, rewardId: string) {
    // 1. Get reward details
    const { data: reward, error: rewardError } = await supabaseAdmin
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single()

    if (rewardError) throw rewardError
    if (!reward || !reward.is_active) throw new Error('Reward not found or inactive')

    // 2. Check if user already claimed this reward
    const { data: existingClaim } = await supabaseAdmin
      .from('reward_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('reward_id', rewardId)
      .single()

    if (existingClaim) throw new Error('Reward already claimed')

    // 3. Record reward claim
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('reward_claims')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        points_claimed: reward.points_reward,
      })
      .select()
      .single()

    if (claimError) throw claimError

    // 4. Award points if applicable
    if (reward.points_reward) {
      return UserService.addPoints(
        userId,
        reward.points_reward,
        'bonus',
        `Claimed reward: ${reward.title}`,
        { reward_id: rewardId }
      )
    }

    return { claim }
  }
}

/**
 * Referral Service
 * Server-side operations for referral management
 */
export class ReferralService {
  /**
   * Register a referral relationship
   */
  static async registerReferral(referrerUserId: string, referredTelegramId: number) {
    // 1. Get the referred user
    const { data: referredUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', referredTelegramId)
      .single()

    if (userError) throw userError
    if (!referredUser) throw new Error('Referred user not found')

    // 2. Check if referral already exists
    const { data: existingReferral } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerUserId)
      .eq('referred_user_id', referredUser.id)
      .single()

    if (existingReferral) throw new Error('Referral already exists')

    // 3. Create referral record
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerUserId,
        referred_user_id: referredUser.id,
        referral_code: referredUser.referral_code,
      })
      .select()
      .single()

    if (referralError) throw referralError
    return referral
  }
}
