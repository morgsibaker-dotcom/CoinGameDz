import { supabase } from '../lib/supabase'

export interface AdminCoreSettings {
  withdrawal_min_points: number
  points_per_usd: number
  usd_to_dzd: number
  usd_to_usdt: number
  tap_limit_per_minute: number
  daily_ad_limit: number
  ad_reward_points: number
}

async function adminId() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Admin session not found')
  return data.user.id
}

export async function getAdminCoreSettings(): Promise<AdminCoreSettings> {
  const id = await adminId()
  const { data, error } = await supabase.rpc('get_admin_settings', { p_admin_auth_user_id: id })
  if (error) throw new Error(error.message)
  return data as AdminCoreSettings
}

export async function updateAdminCoreSettings(settings: AdminCoreSettings) {
  const id = await adminId()
  const { data, error } = await supabase.rpc('admin_save_settings', {
    p_admin_auth_user_id: id,
    p_withdrawal_min_points: settings.withdrawal_min_points,
    p_points_per_usd: settings.points_per_usd,
    p_usd_to_dzd: settings.usd_to_dzd,
    p_usd_to_usdt: settings.usd_to_usdt,
    p_tap_limit_per_minute: settings.tap_limit_per_minute,
    p_daily_ad_limit: settings.daily_ad_limit,
    p_ad_reward_points: settings.ad_reward_points,
  })
  if (error) throw new Error(error.message)
  if (!data?.success) throw new Error(data?.error ?? 'Settings update failed')
  return data
}

export async function updateAdminEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email })
  if (error) throw new Error(error.message)
  return data
}

export async function updateAdminPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
  return data
}