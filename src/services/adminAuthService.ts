import { supabase } from '../lib/supabase'

export async function adminLogin(
  email: string,
  password: string,
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Admin login failed')
  }

  const { data: admin, error: adminError } =
    await supabase
      .from('admin_users')
      .select('id, username, is_active')
      .eq('auth_user_id', data.user.id)
      .eq('is_active', true)
      .maybeSingle()

  if (adminError) {
    await supabase.auth.signOut()
    throw new Error(adminError.message)
  }

  if (!admin) {
    await supabase.auth.signOut()
    throw new Error('You are not authorized as an admin')
  }

  return {
    user: data.user,
    admin,
  }
}

export async function adminLogout() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
