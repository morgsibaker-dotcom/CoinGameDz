import { supabase } from '../lib/supabase'

export interface AdminUser {
  id: string
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string | null
  language: string | null
  points_balance: number
  level: number
  referral_count: number
  is_active: boolean
  created_at: string
}

export async function getAdminUsers(
  search = '',
) {
  const { data, error } = await supabase.rpc(
    'get_admin_users',
    {
      p_search: search || null,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminUser[]
}

export async function updateAdminUserStatus(
  userId: string,
  isActive: boolean,
) {
  const { data, error } = await supabase.rpc(
    'update_admin_user_status',
    {
      p_user_id: userId,
      p_is_active: isActive,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
