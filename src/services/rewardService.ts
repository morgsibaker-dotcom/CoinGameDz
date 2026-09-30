import { supabase } from '../lib/supabase'

export async function getActiveRewards() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getClaimedRewardIds(userId: string) {
  const { data, error } = await supabase
    .from('reward_claims')
    .select('reward_id')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((item) => item.reward_id)
}

export async function claimReward(
  userId: string,
  rewardId: string
) {
  const { data, error } = await supabase.rpc('claim_reward', {
    p_user_id: userId,
    p_reward_id: rewardId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
