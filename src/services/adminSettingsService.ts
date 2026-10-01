import { supabase } from '../lib/supabase'

export interface AdminAppConfig {
  key: string
  value: unknown
  description: string | null
  created_at: string
  updated_at: string
}

export async function updateAdminEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAdminPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getAdminAppConfig(): Promise<AdminAppConfig[]> {
  const { data, error } = await supabase.rpc(
    'get_admin_app_config',
  )

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AdminAppConfig[]
}

export async function updateAdminAppConfig(
  key: string,
  value: unknown,
): Promise<AdminAppConfig> {
  const { data, error } = await supabase.rpc(
    'update_admin_app_config',
    {
      p_key: key,
      p_value: value,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data as AdminAppConfig
}
