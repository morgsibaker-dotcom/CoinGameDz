import { supabase } from '../lib/supabase'

export interface AdminWithdrawal {
  id: string
  user_id: string
  method: string
  destination: string
  amount_points: number
  amount_usd: number
  status: string
  admin_note: string | null
  created_at: string
  updated_at: string
}

async function adminId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Admin session not found')
  return data.user.id
}

export async function getAdminWithdrawals() {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_list_withdrawals', {
    p_admin_auth_user_id: id,
    p_limit: 100,
  })
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminWithdrawal[]
}
