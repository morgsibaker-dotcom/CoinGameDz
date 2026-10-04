import { supabase } from '../lib/supabase'

export async function getCurrentUser() {
  const { data, error } = await supabase.rpc('get_my_profile')
  if (error) throw new Error(error.message)
  return data
}

export async function getReferralStats(): Promise<{
  referral_count: number
  referral_earnings: number
}> {
  const { data, error } = await supabase.rpc('get_referral_stats')
  if (error) throw new Error(error.message)
  return {
    referral_count: Number(data?.referral_count ?? 0),
    referral_earnings: Number(data?.referral_earnings ?? 0),
  }
}
