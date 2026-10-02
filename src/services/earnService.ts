import { supabase } from '../lib/supabase'

export type EarnAction = 'tap' | 'daily_checkin' | 'task'

export async function awardPoints(action: EarnAction) {
  const { data, error } = await supabase.functions.invoke('earn-points', { body: { action } })
  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Reward failed')
  return { points: Number(data.points_balance), usdEquivalent: Number(data.usd_equivalent) }
}
