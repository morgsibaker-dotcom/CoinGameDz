import { supabase } from '../lib/supabase'

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string | null
  source: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function getPointTransactions(userId: string): Promise<PointTransaction[]> {
  const { data, error } = await supabase.rpc('get_my_transactions', { p_limit: 100 })

  if (error) throw new Error(error.message)

  return (data ?? []).map(row => ({
    ...row,
    amount: Number(row.amount ?? 0),
  })) as PointTransaction[]
}
