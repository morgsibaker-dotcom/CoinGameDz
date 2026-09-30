import { supabase } from '../lib/supabase'

export async function createWithdrawalRequest(
  userId: string,
  amountPoints: number,
  method: string,
  accountDetails: Record<string, unknown>,
) {
  const { data, error } = await supabase.rpc(
    'create_withdrawal_request',
    {
      p_user_id: userId,
      p_amount_points: amountPoints,
      p_method: method,
      p_account_details: accountDetails,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getWithdrawalRequests(
  userId: string,
) {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select(
      'id, amount_points, amount_usd, method, status, created_at',
    )
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
