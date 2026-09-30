import { supabase } from '../lib/supabase'

export async function addPoints(
  userId: number,
  amount: number,
  type: string,
  description: string
) {
  const { data, error } = await supabase.rpc('add_points', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
