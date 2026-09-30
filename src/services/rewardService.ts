import { supabase } from '../lib/supabase'

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
