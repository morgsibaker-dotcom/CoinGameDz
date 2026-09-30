import { supabase } from '../lib/supabase'

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
