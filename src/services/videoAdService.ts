import { supabase } from '../lib/supabase'

export async function rewardVideoAd(userId: string) {
  const { data, error } = await supabase.rpc('reward_video_ad', {
    p_user_id: userId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
