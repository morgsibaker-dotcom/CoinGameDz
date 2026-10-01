import { supabase } from '../lib/supabase'

export interface AdminReward {
  id: string
  title: string
  description: string
  reward_type: string
  points_reward: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAdminRewards() {
  const { data, error } = await supabase.rpc(
    'get_admin_rewards',
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminReward[]
}

export async function createAdminReward(
  title: string,
  description: string,
  rewardType: string,
  pointsReward: number,
) {
  const { data, error } = await supabase.rpc(
    'create_admin_reward',
    {
      p_title: title,
      p_description: description,
      p_reward_type: rewardType,
      p_points_reward: pointsReward,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminReward(
  rewardId: string,
  title: string,
  description: string,
  rewardType: string,
  pointsReward: number,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_reward',
    {
      p_reward_id: rewardId,
      p_title: title,
      p_description: description,
      p_reward_type: rewardType,
      p_points_reward: pointsReward,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminRewardStatus(
  rewardId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_reward_status',
    {
      p_reward_id: rewardId,
      p_is_active: isActive,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
