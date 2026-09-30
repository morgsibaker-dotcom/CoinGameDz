import { supabase } from '../lib/supabase'

export interface AdminDashboardStats {
  users_count: number
  active_users_count: number
  tasks_count: number
  active_tasks_count: number
  rewards_count: number
  active_rewards_count: number
  withdrawals_count: number
  pending_withdrawals_count: number
  total_points: number
  total_withdrawal_usd: number
}

export async function getAdminDashboardStats() {
  const { data, error } = await supabase.rpc(
    'get_admin_dashboard_stats',
  )

  if (error) {
    throw new Error(error.message)
  }

  return data as AdminDashboardStats
}
