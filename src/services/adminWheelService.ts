import { supabase } from '../lib/supabase'

export interface AdminWheelPrize {
  id: string
  label: string
  points: number
  probability: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAdminWheelPrizes() {
  const { data, error } = await supabase.rpc(
    'get_admin_wheel_prizes',
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminWheelPrize[]
}

export async function createAdminWheelPrize(
  label: string,
  points: number,
  probability: number,
) {
  const { data, error } = await supabase.rpc(
    'create_admin_wheel_prize',
    {
      p_label: label,
      p_points: points,
      p_probability: probability,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminWheelPrize(
  prizeId: string,
  label: string,
  points: number,
  probability: number,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_wheel_prize',
    {
      p_prize_id: prizeId,
      p_label: label,
      p_points: points,
      p_probability: probability,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminWheelPrizeStatus(
  prizeId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_wheel_prize_status',
    {
      p_prize_id: prizeId,
      p_is_active: isActive,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
