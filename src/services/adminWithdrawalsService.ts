import { supabase } from '../lib/supabase'

export interface AdminWithdrawal {
  id: string
  user_id: string
  telegram_id: number
  username: string | null
  amount_points: number
  amount_usd: number
  method: string
  account_details: Record<string, unknown>
  status: string
  created_at: string
}

export async function getAdminWithdrawals() {
  const { data, error } = await supabase.rpc(
    'get_admin_withdrawals',
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminWithdrawal[]
}

export async function updateWithdrawalStatus(
  withdrawalId: string,
  status: string,
) {
  const { data, error } = await supabase.rpc(
    'update_withdrawal_status_admin',
    {
      p_withdrawal_id: withdrawalId,
      p_status: status,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
