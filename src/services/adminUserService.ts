import { supabase } from '../lib/supabase'

export interface AdminUser {
  id: string
  telegram_id: number
  username: string | null
  first_name: string | null
  points_balance: number
  level: number
  is_active: boolean
  created_at: string
}

async function adminId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Admin session not found')
  return data.user.id
}

export async function getAdminUsers() {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_list_users', {
    p_admin_auth_user_id: id,
    p_limit: 100,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminUser[]
}
